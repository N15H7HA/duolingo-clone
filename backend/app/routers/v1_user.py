from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.db import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.gamification import DailyXP
from app.services.hearts import HeartService
from app.services.streak import StreakService
from app.core.clock import get_user_today_str, get_current_time
from app.schemas.api_v1 import UserProfileResponse, UserSettingsUpdate

router = APIRouter(tags=["User Profile & Settings"])


@router.get("/me", response_model=UserProfileResponse)
def get_user_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Applies lazy heart regeneration and streak display rule.
    Returns XP, streak, hearts, next_heart_in_seconds, gems, daily goal status.
    """
    current_time = get_current_time(user)
    next_heart_seconds = HeartService.evaluate_and_regenerate(user, current_time)
    display_streak = StreakService.get_display_streak(user)

    # Fetch daily XP for today
    today_str = get_user_today_str(user)
    stmt = select(DailyXP).where(DailyXP.user_id == user.id, DailyXP.date == today_str)
    daily_record = db.scalar(stmt)
    daily_xp_today = daily_record.xp if daily_record else 0

    goal_completed = daily_xp_today >= user.daily_goal_xp
    goal_percentage = min(100, int((daily_xp_today / max(1, user.daily_goal_xp)) * 100))

    db.commit()

    return UserProfileResponse(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        avatar=user.avatar,
        timezone=user.timezone,
        xp_total=user.xp_total,
        streak=display_streak,
        hearts=user.hearts,
        next_heart_in_seconds=next_heart_seconds,
        gems=user.gems,
        daily_goal_xp=user.daily_goal_xp,
        daily_xp_today=daily_xp_today,
        goal_completed=goal_completed,
        goal_percentage=goal_percentage,
        sound_enabled=user.sound_enabled,
        dark_mode=user.dark_mode,
        simulated_day_offset=user.simulated_day_offset,
    )


@router.patch("/me/settings", response_model=UserProfileResponse)
def update_user_settings(
    settings_in: UserSettingsUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates daily goal XP, sound enabled, or dark mode settings.
    """
    if settings_in.daily_goal_xp is not None:
        user.daily_goal_xp = settings_in.daily_goal_xp
    if settings_in.sound_enabled is not None:
        user.sound_enabled = settings_in.sound_enabled
    if settings_in.dark_mode is not None:
        user.dark_mode = settings_in.dark_mode

    db.commit()
    db.refresh(user)

    return get_user_profile(user=user, db=db)
