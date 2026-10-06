from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, desc
from app.core.db import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.gamification import League, LeagueMember
from app.schemas.api_v1 import LeagueLeaderboardResponse, LeaderboardEntry

router = APIRouter(tags=["Leaderboard"])


@router.get("/leaderboard", response_model=LeagueLeaderboardResponse)
def get_league_leaderboard(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the current league leaderboard (Bronze League) with user rankings.
    """
    # Fetch user's active league membership (default to Bronze League tier 1)
    member_stmt = select(LeagueMember).where(LeagueMember.user_id == user.id)
    user_member = db.scalar(member_stmt)

    league_id = user_member.league_id if user_member else 1
    league = db.scalar(select(League).where(League.id == league_id))
    if not league:
        league = db.scalar(select(League).order_by(League.tier))
        if not league:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No leagues found. Please seed the database.",
            )

    members_stmt = (
        select(LeagueMember)
        .where(LeagueMember.league_id == league.id)
        .options(selectinload(LeagueMember.user))
        .order_by(desc(LeagueMember.weekly_xp), LeagueMember.reached_at)
    )
    members = db.scalars(members_stmt).all()

    entries = []
    for rank, member in enumerate(members, start=1):
        u = member.user
        entries.append(
            LeaderboardEntry(
                user_id=u.id,
                username=u.username,
                display_name=u.display_name,
                avatar=u.avatar,
                weekly_xp=member.weekly_xp,
                rank=rank,
                is_current_user=(u.id == user.id),
            )
        )

    return LeagueLeaderboardResponse(
        league_id=league.id,
        league_name=league.name,
        league_tier=league.tier,
        entries=entries,
    )
