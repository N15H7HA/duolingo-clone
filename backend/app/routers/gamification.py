from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.db import get_db
from app.models.gamification import League, DailyXP
from app.services.gamification_service import GamificationService
from app.schemas.gamification import (
    LeagueResponse,
    LeaderboardResponse,
    DailyXPResponse,
)

router = APIRouter(prefix="/gamification", tags=["Gamification"])


@router.get("/leagues", response_model=List[LeagueResponse])
def get_leagues(db: Session = Depends(get_db)):
    """List all league divisions."""
    stmt = select(League).order_by(League.tier)
    return list(db.scalars(stmt).all())


@router.get("/leagues/{league_id}/leaderboard", response_model=LeaderboardResponse)
def get_league_leaderboard(
    league_id: int,
    user_id: int = Query(1, description="Current user ID for highlight"),
    db: Session = Depends(get_db),
):
    """Retrieve leaderboard rankings for a specific league."""
    leaderboard = GamificationService.get_leaderboard(
        db, league_id=league_id, current_user_id=user_id
    )
    if not leaderboard:
        raise HTTPException(status_code=404, detail="League not found")
    return leaderboard


@router.get("/daily-xp/{user_id}", response_model=List[DailyXPResponse])
def get_user_daily_xp(user_id: int, db: Session = Depends(get_db)):
    """Retrieve daily XP history for streak charts."""
    stmt = (
        select(DailyXP)
        .where(DailyXP.user_id == user_id)
        .order_by(DailyXP.date.desc())
        .limit(30)
    )
    return list(db.scalars(stmt).all())
