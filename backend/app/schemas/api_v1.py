from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class UserProfileResponse(BaseModel):
    id: int
    username: str
    display_name: str
    avatar: str
    timezone: str
    xp_total: int
    streak: int
    hearts: int
    next_heart_in_seconds: int
    gems: int
    daily_goal_xp: int
    daily_xp_today: int
    goal_completed: bool
    goal_percentage: int
    sound_enabled: bool
    dark_mode: bool
    simulated_day_offset: int


class UserSettingsUpdate(BaseModel):
    daily_goal_xp: Optional[int] = Field(None, ge=1, le=100)
    sound_enabled: Optional[bool] = None
    dark_mode: Optional[bool] = None


class StrippedExerciseOption(BaseModel):
    id: int
    text: str
    pair_key: Optional[str] = None
    side: Optional[str] = None
    position: int


class StrippedExercise(BaseModel):
    id: int
    lesson_id: int
    position: int
    type: str  # select, translate, match_pairs, fill_blank, type_answer
    prompt: str
    source_text: str
    image_key: Optional[str] = None
    options: List[StrippedExerciseOption] = []


class LessonStartResponse(BaseModel):
    attempt_id: int
    lesson_id: int
    lesson_title: str
    is_practice: bool = False
    is_fallback: bool = False
    mode: str = "standard"  # standard, practice, mistakes, timed, legendary
    is_legendary: bool = False
    time_limit_seconds: Optional[int] = None
    max_strikes: Optional[int] = None
    exercises: List[StrippedExercise]


class PracticeSummaryResponse(BaseModel):
    mistakes_count: int
    hearts: int
    words_count: int


class AnswerSubmitRequest(BaseModel):
    exercise_id: int
    submitted_answer: str
    is_retry: bool = False


class AnswerFeedbackResponse(BaseModel):
    correct: bool
    solution: str
    accent_warning: bool
    hearts: int
    out_of_hearts: bool


class AttemptCompleteRequest(BaseModel):
    duration_seconds: int = 0


class AttemptCompleteResponse(BaseModel):
    attempt_id: int
    status: str
    xp_earned: int
    xp_gained: Optional[int] = None
    mistakes: int
    total_xp: int
    streak: int
    hearts: int
    gems: int
    lessons_completed: int
    skill_completed: bool
    is_legendary: bool = False


class HeartRefillResponse(BaseModel):
    success: bool
    hearts: int
    gems: int
    message: str


class LeaderboardEntry(BaseModel):
    user_id: int
    username: str
    display_name: str
    avatar: str
    weekly_xp: int
    rank: int
    is_current_user: bool = False


class LeagueLeaderboardResponse(BaseModel):
    league_id: int
    league_name: str
    league_tier: int
    entries: List[LeaderboardEntry]


class DevAdvanceDayResponse(BaseModel):
    success: bool
    simulated_day_offset: int
    current_simulated_date: str
    message: str


class DevResetResponse(BaseModel):
    success: bool
    message: str
