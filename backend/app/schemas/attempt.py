from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class AttemptAnswerCreate(BaseModel):
    exercise_id: int
    submitted_answer: str
    is_retry: bool = False


class AttemptAnswerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    attempt_id: int
    exercise_id: int
    submitted_answer: str
    is_correct: bool
    is_retry: bool
    answered_at: datetime


class LessonAttemptCreate(BaseModel):
    lesson_id: int


class LessonAttemptUpdate(BaseModel):
    status: Optional[str] = None  # in_progress, completed, failed, abandoned
    mistakes: Optional[int] = None
    hearts_lost: Optional[int] = None
    xp_earned: Optional[int] = None


class LessonAttemptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    lesson_id: int
    status: str
    mistakes: int
    hearts_lost: int
    xp_earned: int
    started_at: datetime
    finished_at: Optional[datetime] = None
    answers: List[AttemptAnswerResponse] = []


class AnswerSubmissionResult(BaseModel):
    is_correct: bool
    correct_answers: List[str]
    hearts_remaining: int
    xp_awarded: int = 0
