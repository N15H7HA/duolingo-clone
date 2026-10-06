import math
from datetime import datetime, timezone, timedelta
from typing import Optional
from app.models.user import User
from app.core.clock import get_current_time

MAX_HEARTS = 5
REGEN_SECONDS = 18000  # 5 hours
HEART_REFILL_GEMS_COST = 350


class HeartService:
    @staticmethod
    def evaluate_and_regenerate(user: User, current_time: Optional[datetime] = None) -> int:
        """
        Calculates lazy heart regeneration based on elapsed time from hearts_updated_at.
        Updates user hearts and hearts_updated_at in memory.
        Returns the remaining seconds until the next heart regenerates (0 if already max).
        """
        now = current_time or get_current_time(user)
        
        last_updated = user.hearts_updated_at
        if last_updated.tzinfo is None:
            last_updated = last_updated.replace(tzinfo=timezone.utc)

        if user.hearts >= MAX_HEARTS:
            user.hearts = MAX_HEARTS
            user.hearts_updated_at = now
            return 0

        elapsed_seconds = (now - last_updated).total_seconds()
        if elapsed_seconds < 0:
            elapsed_seconds = 0

        gained = math.floor(elapsed_seconds / REGEN_SECONDS)
        if gained > 0:
            new_hearts = min(MAX_HEARTS, user.hearts + int(gained))
            user.hearts = new_hearts
            if new_hearts >= MAX_HEARTS:
                user.hearts_updated_at = now
            else:
                user.hearts_updated_at = last_updated + timedelta(seconds=int(gained * REGEN_SECONDS))

        if user.hearts >= MAX_HEARTS:
            return 0

        # Calculate time remaining for next heart
        current_anchor = user.hearts_updated_at
        if current_anchor.tzinfo is None:
            current_anchor = current_anchor.replace(tzinfo=timezone.utc)
        current_elapsed = (now - current_anchor).total_seconds()
        next_in = max(0, int(REGEN_SECONDS - current_elapsed))
        return next_in

    @staticmethod
    def decrement_heart(user: User, current_time: Optional[datetime] = None) -> int:
        """
        Decrements a heart on mistake.
        If user was at max hearts (5), sets the regeneration anchor to current time.
        Returns the new heart count.
        """
        now = current_time or get_current_time(user)
        HeartService.evaluate_and_regenerate(user, now)

        if user.hearts > 0:
            was_full = (user.hearts == MAX_HEARTS)
            user.hearts -= 1
            if was_full:
                user.hearts_updated_at = now

        return user.hearts

    @staticmethod
    def refill_with_gems(user: User, current_time: Optional[datetime] = None) -> bool:
        """
        Refills hearts to 5 in exchange for 350 gems.
        Returns False if user has insufficient gems.
        """
        if user.gems < HEART_REFILL_GEMS_COST:
            return False

        now = current_time or get_current_time(user)
        user.gems -= HEART_REFILL_GEMS_COST
        user.hearts = MAX_HEARTS
        user.hearts_updated_at = now
        return True

    @staticmethod
    def award_practice_heart(user: User, current_time: Optional[datetime] = None) -> int:
        """
        Awards 1 heart for completing a practice lesson.
        """
        now = current_time or get_current_time(user)
        HeartService.evaluate_and_regenerate(user, now)
        if user.hearts < MAX_HEARTS:
            user.hearts += 1
            if user.hearts == MAX_HEARTS:
                user.hearts_updated_at = now
        return user.hearts
