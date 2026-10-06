from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.db import get_db
from app.models.user import User
from app.services.hearts import HeartService
from app.core.clock import get_current_time


def get_current_user(db: Session = Depends(get_db)) -> User:
    """
    FastAPI dependency to fetch the current active user (defaulting to user ID 1 'niso').
    Applies lazy heart regeneration automatically on user access.
    """
    stmt = select(User).where(User.id == 1)
    user = db.scalar(stmt)
    if not user:
        # Fallback to first user in database
        stmt = select(User).order_by(User.id)
        user = db.scalar(stmt)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No users found. Please seed the database.",
            )

    # Perform lazy heart regeneration on read
    current_time = get_current_time(user)
    HeartService.evaluate_and_regenerate(user, current_time)
    db.commit()
    return user
