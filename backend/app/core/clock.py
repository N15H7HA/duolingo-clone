from datetime import datetime, date, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import Optional


class AppClock:
    """
    Clock utility supporting simulated day offsets for time travel testing
    and streak calculation.
    """

    @staticmethod
    def now_utc(simulated_day_offset: int = 0) -> datetime:
        """Returns the current UTC timestamp offset by simulated days."""
        base_now = datetime.now(timezone.utc)
        if simulated_day_offset != 0:
            base_now += timedelta(days=simulated_day_offset)
        return base_now

    @staticmethod
    def today_local_str(
        tz_name: str = "Asia/Kolkata", simulated_day_offset: int = 0
    ) -> str:
        """Returns the current date in YYYY-MM-DD format in the user's timezone."""
        try:
            tz = ZoneInfo(tz_name)
        except Exception:
            tz = ZoneInfo("UTC")

        now_in_tz = datetime.now(tz)
        if simulated_day_offset != 0:
            now_in_tz += timedelta(days=simulated_day_offset)
        return now_in_tz.strftime("%Y-%m-%d")

    @staticmethod
    def yesterday_local_str(
        tz_name: str = "Asia/Kolkata", simulated_day_offset: int = 0
    ) -> str:
        """Returns yesterday's date in YYYY-MM-DD format in user's timezone."""
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
    def is_consecutive_day(
        last_date_str: Optional[str],
        today_str: str,
    ) -> bool:
        """
        Determines if today is consecutive to last_date.
        Returns True if last_date was yesterday.
        """
        if not last_date_str:
            return False
        try:
            last_date = datetime.strptime(last_date_str, "%Y-%m-%d").date()
            today_date = datetime.strptime(today_str, "%Y-%m-%d").date()
            return (today_date - last_date).days == 1
        except Exception:
            return False

    @staticmethod
    def is_same_day(
        last_date_str: Optional[str],
        today_str: str,
    ) -> bool:
        """Checks if two date strings represent the same day."""
        return last_date_str == today_str


def get_clock() -> AppClock:
    """FastAPI dependency to retrieve the AppClock."""
    return AppClock()
