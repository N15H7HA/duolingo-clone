from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.db import get_db
from app.services.user_service import UserService
from app.models.user import UserSkillProgress
from app.schemas.user import (
    UserResponse,
    UserCreate,
    UserUpdate,
    UserSkillProgressResponse,
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_current_default_user(db: Session = Depends(get_db)):
    """Default active user (niso)."""
    user = UserService.get_user_by_username(db, "niso")
    if not user:
        # Fallback to first user
        stmt = select(User).order_by(User.id)
        user = db.scalar(stmt)
        if not user:
            raise HTTPException(status_code=404, detail="No users found. Please seed the database.")
    return user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID."""
    user = UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserResponse)
def update_user_profile(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):
    """Update user settings or simulated offset."""
    user = UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserService.update_user(db, user, user_in)


@router.get("/{user_id}/progress", response_model=List[UserSkillProgressResponse])
def get_user_progress(user_id: int, db: Session = Depends(get_db)):
    """Get skill progress for a user."""
    stmt = select(UserSkillProgress).where(UserSkillProgress.user_id == user_id)
    return list(db.scalars(stmt).all())
