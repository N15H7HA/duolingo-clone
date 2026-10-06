from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.clock import get_user_today_str
from app.schemas.api_v1 import DevAdvanceDayResponse, DevResetResponse
from seed.seed import seed_database

router = APIRouter(tags=["Developer Tools"])


@router.post("/dev/advance-day", response_model=DevAdvanceDayResponse)
def advance_day(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Advances the simulated clock offset by +1 day for testing streaks and passive heart regeneration.
    """
    user.simulated_day_offset += 1
    db.commit()
    db.refresh(user)

    today_str = get_user_today_str(user)

    return DevAdvanceDayResponse(
        success=True,
        simulated_day_offset=user.simulated_day_offset,
        current_simulated_date=today_str,
        message=f"Simulated time advanced by 1 day. Current simulated date: {today_str}",
    )


@router.post("/dev/reset", response_model=DevResetResponse)
def reset_demo_database():
    """
    Triggers seed.py to reset database tables and re-seed clean initial state.
    """
    seed_database()
    return DevResetResponse(
        success=True,
        message="Database successfully reset and re-seeded to initial demo state.",
    )
