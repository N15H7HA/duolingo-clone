from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import (
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db import Base

if TYPE_CHECKING:
    from app.models.course import Course, Skill
    from app.models.attempt import LessonAttempt
    from app.models.gamification import DailyXP, LeagueMember


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(128), nullable=False)
    avatar: Mapped[str] = mapped_column(String(255), default="owl_hero", nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), default="Asia/Kolkata", nullable=False)
    active_course_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True
    )
    xp_total: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    streak_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_active_date: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # YYYY-MM-DD
    hearts: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    hearts_updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )
    gems: Mapped[int] = mapped_column(Integer, default=500, nullable=False)
    daily_goal_xp: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    simulated_day_offset: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sound_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    dark_mode: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_seeded_bot: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    active_course: Mapped[Optional["Course"]] = relationship("Course", foreign_keys=[active_course_id])
    skill_progress: Mapped[List["UserSkillProgress"]] = relationship(
        "UserSkillProgress", back_populates="user", cascade="all, delete-orphan"
    )
    lesson_attempts: Mapped[List["LessonAttempt"]] = relationship(
        "LessonAttempt", back_populates="user", cascade="all, delete-orphan"
    )
    daily_xp_records: Mapped[List["DailyXP"]] = relationship(
        "DailyXP", back_populates="user", cascade="all, delete-orphan"
    )
    league_memberships: Mapped[List["LeagueMember"]] = relationship(
        "LeagueMember", back_populates="user", cascade="all, delete-orphan"
    )


class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    skill_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True
    )
    lessons_completed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill_progress"),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="skill_progress")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="user_progress")
