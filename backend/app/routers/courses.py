from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.services.course_service import CourseService
from app.schemas.course import (
    CourseResponse,
    CourseTreeResponse,
    LessonDetailResponse,
)

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("", response_model=List[CourseResponse])
def list_courses(db: Session = Depends(get_db)):
    """Retrieve all available language courses."""
    return CourseService.get_all_courses(db)


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get metadata for a single course."""
    course = CourseService.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/{course_id}/tree", response_model=CourseTreeResponse)
def get_course_curriculum_tree(
    course_id: int,
    user_id: Optional[int] = Query(None, description="Optional user ID to compute completion & lock state"),
    db: Session = Depends(get_db),
):
    """Retrieve complete unit/skill/lesson learning tree with unlock states."""
    tree = CourseService.get_course_tree(db, course_id, user_id=user_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Course not found")
    return tree


@router.get("/lessons/{lesson_id}", response_model=LessonDetailResponse)
def get_lesson_detail(lesson_id: int, db: Session = Depends(get_db)):
    """Retrieve a lesson along with its ordered exercises and options."""
    lesson = CourseService.get_lesson_with_exercises(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson
