from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import (
    Integer,
    String,
    Boolean,
    Text,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db import Base

if TYPE_CHECKING:
    from app.models.user import UserSkillProgress
    from app.models.attempt import LessonAttempt, AttemptAnswer


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(16), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    from_language: Mapped[str] = mapped_column(String(16), default="en", nullable=False)
    to_language: Mapped[str] = mapped_column(String(16), default="es", nullable=False)
    flag: Mapped[str] = mapped_column(String(32), default="🇪🇸", nullable=False)

    # Relationships
    units: Mapped[List["Unit"]] = relationship(
        "Unit", back_populates="course", cascade="all, delete-orphan", order_by="Unit.position"
    )


class Unit(Base):
    __tablename__ = "units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    course_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    color: Mapped[str] = mapped_column(String(32), default="#58CC02", nullable=False)

    __table_args__ = (
        UniqueConstraint("course_id", "position", name="uq_unit_course_position"),
    )

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="units")
    skills: Mapped[List["Skill"]] = relationship(
        "Skill", back_populates="unit", cascade="all, delete-orphan", order_by="Skill.position"
    )


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    unit_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("units.id", ondelete="CASCADE"), nullable=False, index=True
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    icon: Mapped[str] = mapped_column(String(64), default="star", nullable=False)
    lesson_count: Mapped[int] = mapped_column(Integer, default=3, nullable=False)

    __table_args__ = (
        UniqueConstraint("unit_id", "position", name="uq_skill_unit_position"),
    )

    # Relationships
    unit: Mapped["Unit"] = relationship("Unit", back_populates="skills")
    lessons: Mapped[List["Lesson"]] = relationship(
        "Lesson", back_populates="skill", cascade="all, delete-orphan", order_by="Lesson.position"
    )
    user_progress: Mapped[List["UserSkillProgress"]] = relationship(
        "UserSkillProgress", back_populates="skill", cascade="all, delete-orphan"
    )


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    skill_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(128), nullable=False)

    __table_args__ = (
        UniqueConstraint("skill_id", "position", name="uq_lesson_skill_position"),
    )

    # Relationships
    skill: Mapped["Skill"] = relationship("Skill", back_populates="lessons")
    exercises: Mapped[List["Exercise"]] = relationship(
        "Exercise", back_populates="lesson", cascade="all, delete-orphan", order_by="Exercise.position"
    )
    attempts: Mapped[List["LessonAttempt"]] = relationship(
        "LessonAttempt", back_populates="lesson", cascade="all, delete-orphan"
    )


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lesson_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    type: Mapped[str] = mapped_column(String(32), nullable=False)  # select, translate, match_pairs, fill_blank, type_answer
    prompt: Mapped[str] = mapped_column(String(255), nullable=False)
    source_text: Mapped[str] = mapped_column(Text, nullable=False)
    image_key: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    __table_args__ = (
        UniqueConstraint("lesson_id", "position", name="uq_exercise_lesson_position"),
    )

    # Relationships
    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="exercises")
    options: Mapped[List["ExerciseOption"]] = relationship(
        "ExerciseOption", back_populates="exercise", cascade="all, delete-orphan", order_by="ExerciseOption.position"
    )
    answers: Mapped[List["ExerciseAnswer"]] = relationship(
        "ExerciseAnswer", back_populates="exercise", cascade="all, delete-orphan"
    )
    attempt_answers: Mapped[List["AttemptAnswer"]] = relationship(
        "AttemptAnswer", back_populates="exercise", cascade="all, delete-orphan"
    )


class ExerciseOption(Base):
    __tablename__ = "exercise_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    exercise_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False, index=True
    )
    text: Mapped[str] = mapped_column(String(255), nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    pair_key: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    side: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)  # left, right
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    exercise: Mapped["Exercise"] = relationship("Exercise", back_populates="options")


class ExerciseAnswer(Base):
    __tablename__ = "exercise_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    exercise_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False, index=True
    )
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationships
    exercise: Mapped["Exercise"] = relationship("Exercise", back_populates="answers")
