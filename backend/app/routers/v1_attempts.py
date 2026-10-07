from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from app.core.db import get_db
from app.core.dependencies import get_current_user
from app.models.user import User, UserSkillProgress
from app.models.course import Lesson, Skill
from app.models.attempt import LessonAttempt
from app.models.gamification import DailyXP, LeagueMember
from app.services.lesson_engine import LessonEngine
from app.services.hearts import HeartService
from app.services.streak import StreakService
from app.services.xp import XPService
from app.core.clock import get_user_today_str, get_current_time
from app.schemas.api_v1 import (
    AnswerSubmitRequest,
    AnswerFeedbackResponse,
    AttemptCompleteRequest,
    AttemptCompleteResponse,
)

router = APIRouter(tags=["Attempt Engine"])


@router.post("/attempts/{attempt_id}/answer", response_model=AnswerFeedbackResponse)
def submit_answer(
    attempt_id: int,
    req: AnswerSubmitRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Validates submitted answer, records attempt_answers, decrements heart on error,
    and returns feedback with solution and accent warnings.
    """
    stmt = (
        select(LessonAttempt)
        .where(LessonAttempt.id == attempt_id, LessonAttempt.user_id == user.id)
        .options(selectinload(LessonAttempt.user))
    )
    attempt = db.scalar(stmt)
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attempt not found",
        )
    if attempt.status != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attempt is already finished",
        )

    result = LessonEngine.process_attempt_answer(
        db=db,
        attempt=attempt,
        exercise_id=req.exercise_id,
        submitted_answer=req.submitted_answer,
        is_retry=req.is_retry,
    )

    return AnswerFeedbackResponse(
        correct=result["correct"],
        solution=result["solution"],
        accent_warning=result["accent_warning"],
        hearts=result["hearts"],
        out_of_hearts=result["out_of_hearts"],
    )


@router.post("/attempts/{attempt_id}/complete", response_model=AttemptCompleteResponse)
def complete_attempt(
    attempt_id: int,
    req: AttemptCompleteRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Atomic transaction completing an attempt:
    - Calculates XP
    - Updates total XP, daily XP, league weekly XP
    - Updates streak
    - Advances user skill progress
    """
    stmt = (
        select(LessonAttempt)
        .where(LessonAttempt.id == attempt_id, LessonAttempt.user_id == user.id)
        .options(
            selectinload(LessonAttempt.lesson).selectinload(Lesson.skill),
            selectinload(LessonAttempt.user),
        )
    )
    attempt = db.scalar(stmt)
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attempt not found",
        )

    current_time = get_current_time(user)
    today_str = get_user_today_str(user)

    attempt.status = "completed"
    attempt.finished_at = current_time

    # Calculate XP
    if attempt.is_practice:
        xp_earned = 5
        # Restore +1 heart if hearts < 5
        if user.hearts < 5:
            user.hearts += 1
    else:
        xp_earned = XPService.calculate_lesson_xp(
            mistakes=attempt.mistakes,
            duration_seconds=req.duration_seconds,
        )
    attempt.xp_earned = xp_earned

    # 1. Update User XP
    user.xp_total += xp_earned

    # 2. Update Daily XP
    daily_stmt = select(DailyXP).where(DailyXP.user_id == user.id, DailyXP.date == today_str)
    daily_rec = db.scalar(daily_stmt)
    if daily_rec:
        daily_rec.xp += xp_earned
    else:
        daily_rec = DailyXP(user_id=user.id, date=today_str, xp=xp_earned)
        db.add(daily_rec)

    # 3. Update League Member Weekly XP
    league_stmt = select(LeagueMember).where(LeagueMember.user_id == user.id)
    league_member = db.scalar(league_stmt)
    if league_member:
        league_member.weekly_xp += xp_earned

    # 4. Update Streak
    updated_streak = StreakService.update_streak_on_activity(user)

    # 5. Advance Skill Progress (only for standard lesson attempts)
    skill = attempt.lesson.skill if attempt.lesson else None
    skill_completed = False
    lessons_completed_count = 0

    if skill and not attempt.is_practice:
        prog_stmt = select(UserSkillProgress).where(
            UserSkillProgress.user_id == user.id,
            UserSkillProgress.skill_id == skill.id,
        )
        prog = db.scalar(prog_stmt)
        if not prog:
            prog = UserSkillProgress(
                user_id=user.id,
                skill_id=skill.id,
                lessons_completed=1,
            )
            db.add(prog)
            lessons_completed_count = 1
        else:
            if prog.lessons_completed < skill.lesson_count:
                prog.lessons_completed += 1
            lessons_completed_count = prog.lessons_completed

        if prog.lessons_completed >= skill.lesson_count:
            skill_completed = True
            if not prog.completed_at:
                prog.completed_at = current_time
                # Award bonus gems for completing skill
                user.gems += 50
    elif skill:
        prog_stmt = select(UserSkillProgress).where(
            UserSkillProgress.user_id == user.id,
            UserSkillProgress.skill_id == skill.id,
        )
        prog = db.scalar(prog_stmt)
        if prog:
            lessons_completed_count = prog.lessons_completed
            skill_completed = prog.lessons_completed >= skill.lesson_count

    db.commit()
    db.refresh(user)

    return AttemptCompleteResponse(
        attempt_id=attempt.id,
        status=attempt.status,
        xp_earned=xp_earned,
        mistakes=attempt.mistakes,
        total_xp=user.xp_total,
        streak=updated_streak,
        hearts=user.hearts,
        gems=user.gems,
        lessons_completed=lessons_completed_count,
        skill_completed=skill_completed,
    )
