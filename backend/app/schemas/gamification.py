from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class DailyXPResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    date: str
    xp: int


class LeagueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    tier: int


class LeagueMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    league_id: int
    user_id: int
    weekly_xp: int
    reached_at: datetime


class LeaderboardEntryResponse(BaseModel):
    user_id: int
    username: str
    display_name: str
    avatar: str
    weekly_xp: int
    rank: int
    is_current_user: bool = False


class LeaderboardResponse(BaseModel):
    league: LeagueResponse
    entries: List[LeaderboardEntryResponse] = []
