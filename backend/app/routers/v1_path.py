from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.progress import ProgressService

router = APIRouter(tags=["Learning Path"])


@router.get("/path")
def get_learning_path(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns units and skills with dynamically derived status (completed, active, locked)
    and progress rings for the active course.
    """
    return ProgressService.get_user_path(db, user)
