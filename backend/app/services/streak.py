from app.models.user import User
from app.core.clock import get_user_today_str, get_user_yesterday_str


class StreakService:
    @staticmethod
    def get_display_streak(user: User) -> int:
        """
        Determines the current streak count to display to the user.
        If the user has not practiced today or yesterday, the active streak has broken (0).
        """
        if not user.last_active_date:
            return 0

        today_str = get_user_today_str(user)
        yesterday_str = get_user_yesterday_str(user)

        if user.last_active_date == today_str or user.last_active_date == yesterday_str:
            return user.streak_count

        return 0

    @staticmethod
    def update_streak_on_activity(user: User) -> int:
        """
        Updates the user's streak when they complete an activity/lesson.
        Returns the updated streak count.
        """
        today_str = get_user_today_str(user)
        yesterday_str = get_user_yesterday_str(user)

        if user.last_active_date == today_str:
            # Already practiced today, streak unchanged
            pass
        elif user.last_active_date == yesterday_str:
            # Practiced yesterday, increment streak
            user.streak_count += 1
            user.last_active_date = today_str
        else:
            # Missed a day or first activity ever, reset streak to 1
            user.streak_count = 1
            user.last_active_date = today_str

        return user.streak_count
