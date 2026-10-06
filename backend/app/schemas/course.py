from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ExerciseOptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exercise_id: int
    text: str
    is_correct: bool
    pair_key: Optional[str] = None
    side: Optional[str] = None
    position: int


class ExerciseAnswerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exercise_id: int
    answer_text: str


class ExerciseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lesson_id: int
    position: int
    type: str  # select, translate, match_pairs, fill_blank, type_answer
    prompt: str
    source_text: str
    image_key: Optional[str] = None
    options: List[ExerciseOptionResponse] = []
    answers: List[ExerciseAnswerResponse] = []


class LessonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    skill_id: int
    position: int
    title: str


class LessonDetailResponse(LessonResponse):
    exercises: List[ExerciseResponse] = []


class SkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    unit_id: int
    position: int
    name: str
    icon: str
    lesson_count: int


class SkillTreeResponse(SkillResponse):
    lessons: List[LessonResponse] = []
    lessons_completed: int = 0
    is_completed: bool = False
    is_unlocked: bool = True


class UnitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    position: int
    title: str
    description: str
    color: str


class UnitTreeResponse(UnitResponse):
    skills: List[SkillTreeResponse] = []


class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    from_language: str
    to_language: str
    flag: str


class CourseTreeResponse(CourseResponse):
    units: List[UnitTreeResponse] = []
