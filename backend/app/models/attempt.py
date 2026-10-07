from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import (
    Integer,
    String,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.course import Lesson, Exercise


class LessonAttempt(Base):
    __tablename__ = "lesson_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    lesson_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(32), default="in_progress", nullable=False
    )  # in_progress, completed, failed, abandoned
    is_practice: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    mistakes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    hearts_lost: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="lesson_attempts")
    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="attempts")
    answers: Mapped[List["AttemptAnswer"]] = relationship(
        "AttemptAnswer", back_populates="attempt", cascade="all, delete-orphan", order_by="AttemptAnswer.answered_at"
    )


class AttemptAnswer(Base):
    __tablename__ = "attempt_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    attempt_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("lesson_attempts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    exercise_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False, index=True
    )
    submitted_answer: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    is_retry: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    answered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )

    # Relationships
    attempt: Mapped["LessonAttempt"] = relationship("LessonAttempt", back_populates="answers")
    exercise: Mapped["Exercise"] = relationship("Exercise", back_populates="attempt_answers")
