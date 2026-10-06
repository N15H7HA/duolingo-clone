from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.hearts import HeartService
from app.schemas.api_v1 import HeartRefillResponse

router = APIRouter(tags=["Hearts"])


@router.post("/hearts/refill", response_model=HeartRefillResponse)
def refill_hearts(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Refills hearts to full (5) in exchange for 350 gems.
    Returns 409 Conflict if the user has insufficient gems.
    """
    success = HeartService.refill_with_gems(user)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Insufficient gems. Required: 350, Available: {user.gems}",
        )

    db.commit()
    db.refresh(user)

    return HeartRefillResponse(
        success=True,
        hearts=user.hearts,
        gems=user.gems,
        message="Hearts successfully refilled to 5!",
    )
