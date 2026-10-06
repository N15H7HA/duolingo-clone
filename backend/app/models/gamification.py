from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import (
    Integer,
    String,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db import Base

if TYPE_CHECKING:
    from app.models.user import User


class DailyXP(Base):
    __tablename__ = "daily_xp"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    date: Mapped[str] = mapped_column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_user_daily_xp_date"),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="daily_xp_records")


class League(Base):
    __tablename__ = "leagues"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    tier: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)

    # Relationships
    members: Mapped[List["LeagueMember"]] = relationship(
        "LeagueMember", back_populates="league", cascade="all, delete-orphan", order_by="desc(LeagueMember.weekly_xp)"
    )


class LeagueMember(Base):
    __tablename__ = "league_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    league_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("leagues.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    weekly_xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reached_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("league_id", "user_id", name="uq_league_member"),
    )

    # Relationships
    league: Mapped["League"] = relationship("League", back_populates="members")
    user: Mapped["User"] = relationship("User", back_populates="league_memberships")
