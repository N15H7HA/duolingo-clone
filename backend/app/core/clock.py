from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from app.models.user import User


def get_current_time(user: "User") -> datetime:
    """
    Returns the current UTC timestamp offset by the user's simulated_day_offset.
    Ensures all time simulation works deterministically.
    """
    base_now = datetime.now(timezone.utc)
    if user.simulated_day_offset != 0:
        base_now += timedelta(days=user.simulated_day_offset)
    return base_now


def get_user_today_str(user: "User") -> str:
    """
    Returns today's date in YYYY-MM-DD format based on user's timezone
    and simulated_day_offset.
    """
    current_utc = get_current_time(user)
    try:
        tz = ZoneInfo(user.timezone)
    except Exception:
        tz = ZoneInfo("UTC")
    local_time = current_utc.astimezone(tz)
    return local_time.strftime("%Y-%m-%d")


def get_user_yesterday_str(user: "User") -> str:
    """
    Returns yesterday's date in YYYY-MM-DD format based on user's timezone
    and simulated_day_offset.
    """
    current_utc = get_current_time(user)
    try:
        tz = ZoneInfo(user.timezone)
    except Exception:
        tz = ZoneInfo("UTC")
    local_time = current_utc.astimezone(tz) - timedelta(days=1)
    return local_time.strftime("%Y-%m-%d")


class AppClock:
    """Legacy clock helper class for backward compatibility."""

    @staticmethod
    def now_utc(simulated_day_offset: int = 0) -> datetime:
        base_now = datetime.now(timezone.utc)
        if simulated_day_offset != 0:
            base_now += timedelta(days=simulated_day_offset)
        return base_now

    @staticmethod
    def today_local_str(tz_name: str = "Asia/Kolkata", simulated_day_offset: int = 0) -> str:
        try:
            tz = ZoneInfo(tz_name)
        except Exception:
            tz = ZoneInfo("UTC")
        now_in_tz = datetime.now(tz)
        if simulated_day_offset != 0:
            now_in_tz += timedelta(days=simulated_day_offset)
        return now_in_tz.strftime("%Y-%m-%d")

    @staticmethod
    def yesterday_local_str(tz_name: str = "Asia/Kolkata", simulated_day_offset: int = 0) -> str:
        try:
            tz = ZoneInfo(tz_name)
        except Exception:
            tz = ZoneInfo("UTC")
        now_in_tz = datetime.now(tz)
        if simulated_day_offset != 0:
            now_in_tz += timedelta(days=simulated_day_offset)
        yesterday = now_in_tz - timedelta(days=1)
        return yesterday.strftime("%Y-%m-%d")

    @staticmethod
    def is_consecutive_day(last_date_str: Optional[str], today_str: str) -> bool:
        if not last_date_str:
            return False
        try:
            last_date = datetime.strptime(last_date_str, "%Y-%m-%d").date()
            today_date = datetime.strptime(today_str, "%Y-%m-%d").date()
            return (today_date - last_date).days == 1
        except Exception:
            return False

    @staticmethod
    def is_same_day(last_date_str: Optional[str], today_str: str) -> bool:
        return last_date_str == today_str
