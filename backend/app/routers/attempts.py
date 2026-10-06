import json
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from app.core.db import get_db
from app.models.user import User, UserSkillProgress
from app.models.course import Lesson, Exercise, Skill
from app.models.attempt import LessonAttempt, AttemptAnswer
from app.schemas.attempt import (
    LessonAttemptCreate,
    LessonAttemptResponse,
    AttemptAnswerCreate,
    AnswerSubmissionResult,
)
from app.services.gamification_service import GamificationService

router = APIRouter(prefix="/attempts", tags=["Attempts"])


def normalize_str(s: str) -> str:
    """Helper to normalize text for lenient answer checking."""
    return s.strip().lower().rstrip(".!?¿¡,")


@router.post("", response_model=LessonAttemptResponse)
def start_lesson_attempt(
    attempt_in: LessonAttemptCreate,
    user_id: int = 1,  # Default to active user
    db: Session = Depends(get_db),
):
    """Start a new lesson attempt."""
    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    lesson = db.scalar(select(Lesson).where(Lesson.id == attempt_in.lesson_id))
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    attempt = LessonAttempt(
        user_id=user.id,
        lesson_id=lesson.id,
        status="in_progress",
        mistakes=0,
        hearts_lost=0,
        xp_earned=0,
        started_at=datetime.now(timezone.utc),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


@router.post("/{attempt_id}/answers", response_model=AnswerSubmissionResult)
def submit_exercise_answer(
    attempt_id: int,
    answer_in: AttemptAnswerCreate,
    db: Session = Depends(get_db),
):
    """Submit and evaluate an answer for an exercise."""
    stmt = (
        select(LessonAttempt)
        .where(LessonAttempt.id == attempt_id)
        .options(selectinload(LessonAttempt.user))
    )
    attempt = db.scalar(stmt)
    if not attempt or attempt.status != "in_progress":
        raise HTTPException(status_code=400, detail="Invalid or completed attempt")

    user = attempt.user
    ex_stmt = (
        select(Exercise)
        .where(Exercise.id == answer_in.exercise_id)
        .options(
            selectinload(Exercise.options),
            selectinload(Exercise.answers),
        )
    )
    exercise = db.scalar(ex_stmt)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    submitted = normalize_str(answer_in.submitted_answer)
    is_correct = False
    valid_answers: List[str] = []

    if exercise.type in ("select", "translate", "fill_blank", "type_answer"):
        # Collect valid answer strings
        if exercise.answers:
            valid_answers = [a.answer_text for a in exercise.answers]
        if not valid_answers:
            valid_answers = [opt.text for opt in exercise.options if opt.is_correct]

        # Check submitted against normalized valid answers
        normalized_valid = [normalize_str(ans) for ans in valid_answers]
        if submitted in normalized_valid:
            is_correct = True
    elif exercise.type == "match_pairs":
        # Submitted answer may be JSON formatted or verified pair list
        is_correct = True
        valid_answers = ["All pairs matched"]

    # Record AttemptAnswer
    attempt_answer = AttemptAnswer(
        attempt_id=attempt.id,
        exercise_id=exercise.id,
        submitted_answer=answer_in.submitted_answer,
        is_correct=is_correct,
        is_retry=answer_in.is_retry,
        answered_at=datetime.now(timezone.utc),
    )
    db.add(attempt_answer)

    xp_awarded = 0
    if not is_correct and not answer_in.is_retry:
        attempt.mistakes += 1
        if user.hearts > 0:
            user.hearts -= 1
            user.hearts_updated_at = datetime.now(timezone.utc)
            attempt.hearts_lost += 1

    db.commit()

    return AnswerSubmissionResult(
        is_correct=is_correct,
        correct_answers=valid_answers,
        hearts_remaining=user.hearts,
        xp_awarded=xp_awarded,
    )


@router.post("/{attempt_id}/finish", response_model=LessonAttemptResponse)
def finish_lesson_attempt(
    attempt_id: int,
    status: str = "completed",  # completed, failed, abandoned
    db: Session = Depends(get_db),
):
    """Complete a lesson attempt and record gamification awards."""
    stmt = (
        select(LessonAttempt)
        .where(LessonAttempt.id == attempt_id)
        .options(
            selectinload(LessonAttempt.user),
            selectinload(LessonAttempt.lesson).selectinload(Lesson.skill),
            selectinload(LessonAttempt.answers),
        )
    )
    attempt = db.scalar(stmt)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    attempt.status = status
    attempt.finished_at = datetime.now(timezone.utc)

    if status == "completed":
        # Base XP is 15
        xp_earned = 15
        if attempt.mistakes == 0:
            xp_earned += 5  # Perfect lesson bonus
        attempt.xp_earned = xp_earned

        # Update Skill Progress
        user = attempt.user
        skill = attempt.lesson.skill
        prog_stmt = select(UserSkillProgress).where(
            UserSkillProgress.user_id == user.id,
            UserSkillProgress.skill_id == skill.id,
        )
        progress = db.scalar(prog_stmt)
        if not progress:
            progress = UserSkillProgress(
                user_id=user.id,
                skill_id=skill.id,
                lessons_completed=1,
            )
            db.add(progress)
        else:
            if progress.lessons_completed < skill.lesson_count:
                progress.lessons_completed += 1

        if progress.lessons_completed >= skill.lesson_count and not progress.completed_at:
            progress.completed_at = datetime.now(timezone.utc)

        # Gamification XP and Streak Update
        GamificationService.record_xp_and_update_streak(db, user, xp_earned)

    db.commit()
    db.refresh(attempt)
    return attempt
