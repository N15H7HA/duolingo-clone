from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from app.core.db import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.course import Lesson, Exercise
from app.models.attempt import LessonAttempt
from app.schemas.api_v1 import (
    LessonStartResponse,
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
    # Pick lesson 1 (Hello & Goodbye) or available practice lesson
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
        mistakes=0,
        hearts_lost=0,
        xp_earned=0,
        started_at=current_time,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # Select first 5 exercises for practice
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
        exercises=stripped_exercises,
    )
