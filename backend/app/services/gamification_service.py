from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, desc
from app.models.user import User
from app.models.gamification import DailyXP, League, LeagueMember
from app.schemas.gamification import (
    LeaderboardResponse,
    LeaderboardEntryResponse,
    LeagueResponse,
)
from app.core.clock import AppClock


class GamificationService:
    @staticmethod
    def record_xp_and_update_streak(
        db: Session, user: User, xp_gained: int
    ) -> None:
        """
        Awards XP to the user, records DailyXP, updates streak based on timezone and simulated clock.
        """
        user.xp_total += xp_gained

        # Calculate today in user's timezone with simulated day offset
        today_str = AppClock.today_local_str(user.timezone, user.simulated_day_offset)

        # Update or create DailyXP
        stmt = select(DailyXP).where(
            DailyXP.user_id == user.id, DailyXP.date == today_str
        )
        daily_record = db.scalar(stmt)
        if daily_record:
            daily_record.xp += xp_gained
        else:
            daily_record = DailyXP(user_id=user.id, date=today_str, xp=xp_gained)
            db.add(daily_record)

        # Streak calculation
        if user.last_active_date is None:
            user.streak_count = 1
            user.last_active_date = today_str
        elif AppClock.is_same_day(user.last_active_date, today_str):
            # Already practiced today, streak stays the same
            pass
        elif AppClock.is_consecutive_day(user.last_active_date, today_str):
            # Practiced yesterday, advance streak
            user.streak_count += 1
            user.last_active_date = today_str
        else:
            # Missed a day or more, reset streak to 1
            user.streak_count = 1
            user.last_active_date = today_str

        # Update League Member weekly XP
        league_stmt = select(LeagueMember).where(LeagueMember.user_id == user.id)
        league_member = db.scalar(league_stmt)
        if league_member:
            league_member.weekly_xp += xp_gained

        db.commit()

    @staticmethod
    def get_leaderboard(
        db: Session, league_id: int, current_user_id: Optional[int] = None
    ) -> Optional[LeaderboardResponse]:
        league = db.scalar(select(League).where(League.id == league_id))
        if not league:
            return None

        stmt = (
            select(LeagueMember)
            .where(LeagueMember.league_id == league_id)
            .options(selectinload(LeagueMember.user))
            .order_by(desc(LeagueMember.weekly_xp), LeagueMember.reached_at)
        )
        members = db.scalars(stmt).all()

        entries: List[LeaderboardEntryResponse] = []
        for rank, member in enumerate(members, start=1):
            u = member.user
            entries.append(
                LeaderboardEntryResponse(
                    user_id=u.id,
                    username=u.username,
                    display_name=u.display_name,
                    avatar=u.avatar,
                    weekly_xp=member.weekly_xp,
                    rank=rank,
                    is_current_user=(current_user_id == u.id),
                )
            )

        return LeaderboardResponse(
            league=LeagueResponse(id=league.id, name=league.name, tier=league.tier),
            entries=entries,
        )
