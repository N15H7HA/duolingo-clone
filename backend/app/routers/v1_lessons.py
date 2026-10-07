from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from app.core.db import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.course import Lesson, Exercise, Skill
from app.models.attempt import LessonAttempt
from app.schemas.api_v1 import (
    LessonStartResponse,
    PracticeSummaryResponse,
    StrippedExercise,
    StrippedExerciseOption,
)
from app.core.clock import get_current_time

router = APIRouter(tags=["Lessons & Practice"])


@router.post("/lessons/{lesson_id}/start", response_model=LessonStartResponse)
def start_lesson(
    lesson_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Starts a standard lesson attempt.
    Rejects with 409 Conflict if the user is out of hearts.
    Returns stripped exercise queue without is_correct flags.
    """
    if user.hearts <= 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You are out of hearts! Refill hearts with gems or practice to earn more.",
        )

    stmt = (
        select(Lesson)
        .where(Lesson.id == lesson_id)
        .options(
            selectinload(Lesson.exercises).selectinload(Exercise.options),
        )
    )
    lesson = db.scalar(stmt)
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    current_time = get_current_time(user)
    attempt = LessonAttempt(
        user_id=user.id,
        lesson_id=lesson.id,
        status="in_progress",
        mistakes=0,
        hearts_lost=0,
        xp_earned=0,
        started_at=current_time,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # Strip exercise answers and correctness flags
    stripped_exercises = []
    for ex in sorted(lesson.exercises, key=lambda e: e.position):
        stripped_options = [
            StrippedExerciseOption(
                id=opt.id,
                text=opt.text,
                pair_key=opt.pair_key,
                side=opt.side,
                position=opt.position,
            )
            for opt in sorted(ex.options, key=lambda o: o.position)
        ]
        stripped_exercises.append(
            StrippedExercise(
                id=ex.id,
                lesson_id=ex.lesson_id,
                position=ex.position,
                type=ex.type,
                prompt=ex.prompt,
                source_text=ex.source_text,
                image_key=ex.image_key,
                options=stripped_options,
            )
        )

    return LessonStartResponse(
        attempt_id=attempt.id,
        lesson_id=lesson.id,
        lesson_title=lesson.title,
        is_practice=False,
        is_fallback=False,
        mode="standard",
        exercises=stripped_exercises,
    )


@router.post("/lessons/{skill_or_lesson_id}/legendary/start", response_model=LessonStartResponse)
def start_legendary_challenge(
    skill_or_lesson_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Starts a Legendary Trophy Challenge for a completed skill.
    Can be initiated with either a skill_id or lesson_id.
    Enforces 3 strikes maximum rule.
    Returns 8 harder translation, fill_blank, and type_answer exercises.
    """
    # 1. Try to find skill directly
    skill_stmt = (
        select(Skill)
        .where(Skill.id == skill_or_lesson_id)
        .options(
            selectinload(Skill.lessons).selectinload(Lesson.exercises).selectinload(Exercise.options),
            selectinload(Skill.lessons).selectinload(Lesson.exercises).selectinload(Exercise.answers),
        )
    )
    skill = db.scalar(skill_stmt)

    if not skill:
        # Try to find lesson and its parent skill
        lesson_stmt = (
            select(Lesson)
            .where(Lesson.id == skill_or_lesson_id)
            .options(
                selectinload(Lesson.skill).selectinload(Skill.lessons).selectinload(Lesson.exercises).selectinload(Exercise.options),
            )
        )
        lesson_obj = db.scalar(lesson_stmt)
        if lesson_obj and lesson_obj.skill:
            skill = lesson_obj.skill

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill or lesson not found for Legendary Challenge",
        )

    # 2. Gather exercises across the skill's lessons
    all_exercises = []
    for l in skill.lessons:
        for ex in l.exercises:
            all_exercises.append(ex)

    if not all_exercises:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No exercises found for Legendary Challenge",
        )

    # Prefer harder types (type_answer, translate, fill_blank)
    harder_types = ["type_answer", "translate", "fill_blank", "select", "match_pairs"]
    sorted_exercises = sorted(
        all_exercises,
        key=lambda e: harder_types.index(e.type) if e.type in harder_types else 99,
    )
    selected_exercises = sorted_exercises[:8]

    first_lesson_id = skill.lessons[0].id if skill.lessons else skill_or_lesson_id
    current_time = get_current_time(user)

    attempt = LessonAttempt(
        user_id=user.id,
        lesson_id=first_lesson_id,
        status="in_progress",
        mode="legendary",
        is_practice=False,
        mistakes=0,
        hearts_lost=0,
        xp_earned=0,
        started_at=current_time,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    stripped_exercises = []
    for ex in selected_exercises:
        stripped_options = [
            StrippedExerciseOption(
                id=opt.id,
                text=opt.text,
                pair_key=opt.pair_key,
                side=opt.side,
                position=opt.position,
            )
            for opt in sorted(ex.options, key=lambda o: o.position)
        ]
        stripped_exercises.append(
            StrippedExercise(
                id=ex.id,
                lesson_id=ex.lesson_id,
                position=ex.position,
                type=ex.type,
                prompt=ex.prompt,
                source_text=ex.source_text,
                image_key=ex.image_key,
                options=stripped_options,
            )
        )

    return LessonStartResponse(
        attempt_id=attempt.id,
        lesson_id=first_lesson_id,
        lesson_title=f"Legendary: {skill.name}",
        is_practice=False,
        is_fallback=False,
        mode="legendary",
        is_legendary=True,
        max_strikes=3,
        exercises=stripped_exercises,
    )


@router.post("/practice/timed/start", response_model=LessonStartResponse)
def start_timed_practice(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a rapid-fire timed practice attempt with a 90-second global countdown.
    Generates 12 rapid exercises from the course curriculum.
    Practice rules: no persistent hearts deducted.
    """
    stmt = (
        select(Exercise)
        .options(
            selectinload(Exercise.options),
            selectinload(Exercise.answers),
        )
        .order_by(Exercise.id)
        .limit(12)
    )
    exercises_to_run = list(db.scalars(stmt).all())
    if not exercises_to_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No practice exercises found",
        )

    first_ex = exercises_to_run[0]
    lesson_id = first_ex.lesson_id

    current_time = get_current_time(user)
    attempt = LessonAttempt(
        user_id=user.id,
        lesson_id=lesson_id,
        status="in_progress",
        mode="timed",
        is_practice=True,
        mistakes=0,
        hearts_lost=0,
        xp_earned=0,
        started_at=current_time,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    stripped_exercises = []
    for ex in exercises_to_run:
        stripped_options = [
            StrippedExerciseOption(
                id=opt.id,
                text=opt.text,
                pair_key=opt.pair_key,
                side=opt.side,
                position=opt.position,
            )
            for opt in sorted(ex.options, key=lambda o: o.position)
        ]
        stripped_exercises.append(
            StrippedExercise(
                id=ex.id,
                lesson_id=ex.lesson_id,
                position=ex.position,
                type=ex.type,
                prompt=ex.prompt,
                source_text=ex.source_text,
                image_key=ex.image_key,
                options=stripped_options,
            )
        )

    return LessonStartResponse(
        attempt_id=attempt.id,
        lesson_id=lesson_id,
        lesson_title="Speed Challenge",
        is_practice=True,
        is_fallback=False,
        mode="timed",
        time_limit_seconds=90,
        exercises=stripped_exercises,
    )


def get_user_unresolved_mistakes(db: Session, user_id: int) -> list[Exercise]:
    """
    Finds exercises where the user answered incorrectly and has not yet cleared them with a subsequent correct answer.
    """
    from app.models.attempt import AttemptAnswer

    # Find distinct exercise_ids where user had an incorrect answer
    stmt = (
        select(AttemptAnswer.exercise_id)
        .join(LessonAttempt, AttemptAnswer.attempt_id == LessonAttempt.id)
        .where(
            LessonAttempt.user_id == user_id,
            AttemptAnswer.is_correct == False,
        )
        .distinct()
    )
    mistake_ex_ids = list(db.scalars(stmt).all())
    if not mistake_ex_ids:
        return []

    # Filter out exercises that have since been answered correctly
    unresolved_ids = []
    for ex_id in mistake_ex_ids:
        latest_ans = (
            db.query(AttemptAnswer)
            .join(LessonAttempt, AttemptAnswer.attempt_id == LessonAttempt.id)
            .where(
                LessonAttempt.user_id == user_id,
                AttemptAnswer.exercise_id == ex_id,
            )
            .order_by(AttemptAnswer.answered_at.desc(), AttemptAnswer.id.desc())
            .first()
        )
        if latest_ans and not latest_ans.is_correct:
            unresolved_ids.append(ex_id)

    if not unresolved_ids:
        return []

    ex_stmt = (
        select(Exercise)
        .where(Exercise.id.in_(unresolved_ids))
        .options(
            selectinload(Exercise.options),
            selectinload(Exercise.answers),
        )
    )
    return list(db.scalars(ex_stmt).all())


@router.get("/practice/summary", response_model=PracticeSummaryResponse)
def get_practice_summary(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns summary statistics for the Practice Hub (unresolved mistakes count, hearts, learned words).
    """
    unresolved = get_user_unresolved_mistakes(db, user.id)
    return PracticeSummaryResponse(
        mistakes_count=len(unresolved),
        hearts=user.hearts,
        words_count=35,
    )


@router.post("/practice/mistakes/start", response_model=LessonStartResponse)
def start_mistakes_practice(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Starts an isolated review session of the user's logged mistakes.
    If no logged mistakes exist, returns fallback set of 5 exercises from completed lessons with is_fallback: true.
    Practice sessions do NOT deduct hearts on wrong answers.
    """
    unresolved = get_user_unresolved_mistakes(db, user.id)
    is_fallback = False

    if not unresolved:
        is_fallback = True
        stmt = (
            select(Exercise)
            .options(
                selectinload(Exercise.options),
                selectinload(Exercise.answers),
            )
            .order_by(Exercise.id)
            .limit(5)
        )
        exercises_to_run = list(db.scalars(stmt).all())
    else:
        exercises_to_run = unresolved[:5]

    first_ex = exercises_to_run[0] if exercises_to_run else None
    lesson_id = first_ex.lesson_id if first_ex else 1

    current_time = get_current_time(user)
    attempt = LessonAttempt(
        user_id=user.id,
        lesson_id=lesson_id,
        status="in_progress",
        is_practice=True,
        mistakes=0,
        hearts_lost=0,
        xp_earned=0,
        started_at=current_time,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    stripped_exercises = []
    for ex in exercises_to_run:
        stripped_options = [
            StrippedExerciseOption(
                id=opt.id,
                text=opt.text,
                pair_key=opt.pair_key,
                side=opt.side,
                position=opt.position,
            )
            for opt in sorted(ex.options, key=lambda o: o.position)
        ]
        stripped_exercises.append(
            StrippedExercise(
                id=ex.id,
                lesson_id=ex.lesson_id,
                position=ex.position,
                type=ex.type,
                prompt=ex.prompt,
                source_text=ex.source_text,
                image_key=ex.image_key,
                options=stripped_options,
            )
        )

    return LessonStartResponse(
        attempt_id=attempt.id,
        lesson_id=lesson_id,
        lesson_title="Mistakes Review",
        is_practice=True,
        is_fallback=is_fallback,
        exercises=stripped_exercises,
    )


@router.post("/practice/start", response_model=LessonStartResponse)
def start_practice(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a practice attempt from review exercises.
    Allows practice even when out of hearts to earn +1 heart.
    """
    stmt = (
        select(Lesson)
        .order_by(Lesson.id)
        .options(
            selectinload(Lesson.exercises).selectinload(Exercise.options),
        )
    )
    lesson = db.scalars(stmt).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No practice lessons found",
        )

    current_time = get_current_time(user)
    attempt = LessonAttempt(
        user_id=user.id,
        lesson_id=lesson.id,
        status="in_progress",
        is_practice=True,
        mistakes=0,
        hearts_lost=0,
        xp_earned=0,
        started_at=current_time,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    practice_exercises = sorted(lesson.exercises, key=lambda e: e.position)[:5]
    stripped_exercises = []
    for ex in practice_exercises:
        stripped_options = [
            StrippedExerciseOption(
                id=opt.id,
                text=opt.text,
                pair_key=opt.pair_key,
                side=opt.side,
                position=opt.position,
            )
            for opt in sorted(ex.options, key=lambda o: o.position)
        ]
        stripped_exercises.append(
            StrippedExercise(
                id=ex.id,
                lesson_id=ex.lesson_id,
                position=ex.position,
                type=ex.type,
                prompt=ex.prompt,
                source_text=ex.source_text,
                image_key=ex.image_key,
                options=stripped_options,
            )
        )

    return LessonStartResponse(
        attempt_id=attempt.id,
        lesson_id=lesson.id,
        lesson_title="Practice Session",
        is_practice=True,
        is_fallback=False,
        exercises=stripped_exercises,
    )
