from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    username: str
    display_name: str
    avatar: str = "owl_hero"
    timezone: str = "Asia/Kolkata"
    sound_enabled: bool = True
    dark_mode: bool = False


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar: Optional[str] = None
    timezone: Optional[str] = None
    sound_enabled: Optional[bool] = None
    dark_mode: Optional[bool] = None
    active_course_id: Optional[int] = None
    daily_goal_xp: Optional[int] = None
    simulated_day_offset: Optional[int] = None


class UserSkillProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    skill_id: int
    lessons_completed: int
    completed_at: Optional[datetime] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    display_name: str
    avatar: str
    timezone: str
    active_course_id: Optional[int] = None
    xp_total: int
    streak_count: int
    last_active_date: Optional[str] = None
    hearts: int
    hearts_updated_at: datetime
    gems: int
    daily_goal_xp: int
    simulated_day_offset: int
    sound_enabled: bool
    dark_mode: bool
    is_seeded_bot: bool
    created_at: datetime
    updated_at: datetime
