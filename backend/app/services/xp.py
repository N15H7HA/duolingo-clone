class XPService:
    @staticmethod
    def calculate_lesson_xp(mistakes: int = 0, duration_seconds: int = 0) -> int:
        """
        Calculates XP earned from completing a standard lesson:
        - Base: 10 XP
        - Perfect Bonus (0 mistakes): +5 XP
        - Speed Bonus (< 180 seconds / 3 min): +2 XP
        """
        base_xp = 10
        perfect_bonus = 5 if mistakes == 0 else 0
        speed_bonus = 2 if 0 < duration_seconds < 180 else 0
        return base_xp + perfect_bonus + speed_bonus

    @staticmethod
    def calculate_practice_xp() -> int:
        """Practice lessons award a fixed 5 XP."""
        return 5
