from datetime import datetime, timezone, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.user import User, UserSkillProgress
from app.schemas.user import UserCreate, UserUpdate
from app.core.config import settings
from app.core.clock import AppClock


class UserService:
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        user = db.scalar(stmt)
        if user:
            UserService.regenerate_hearts(db, user)
        return user

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        stmt = select(User).where(User.username == username)
        user = db.scalar(stmt)
        if user:
            UserService.regenerate_hearts(db, user)
        return user

    @staticmethod
    def create_user(db: Session, user_in: UserCreate) -> User:
        user = User(
            username=user_in.username,
            display_name=user_in.display_name,
            avatar=user_in.avatar,
            timezone=user_in.timezone,
            sound_enabled=user_in.sound_enabled,
            dark_mode=user_in.dark_mode,
            hearts=settings.DEFAULT_HEARTS,
            hearts_updated_at=datetime.now(timezone.utc),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_user(db: Session, user: User, user_in: UserUpdate) -> User:
        update_data = user_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def regenerate_hearts(db: Session, user: User) -> None:
        """
        Passive heart regeneration: 1 heart per HEART_REGEN_MINUTES (default 30m) up to MAX_HEARTS (5).
        """
        if user.hearts >= settings.MAX_HEARTS:
            return

        now_utc = AppClock.now_utc(user.simulated_day_offset)
        last_updated = user.hearts_updated_at
        if last_updated.tzinfo is None:
            last_updated = last_updated.replace(tzinfo=timezone.utc)

        elapsed_seconds = (now_utc - last_updated).total_seconds()
        regen_interval_seconds = settings.HEART_REGEN_MINUTES * 60

        if elapsed_seconds >= regen_interval_seconds:
            hearts_to_add = int(elapsed_seconds // regen_interval_seconds)
            new_hearts = min(settings.MAX_HEARTS, user.hearts + hearts_to_add)
            user.hearts = new_hearts
            # Advance hearts_updated_at
            remainder_seconds = elapsed_seconds % regen_interval_seconds
            user.hearts_updated_at = now_utc - timedelta(seconds=remainder_seconds)
            db.commit()
