from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.db import get_db

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
def health_check(db: Session = Depends(get_db)):
    # Verify DB connection and WAL mode
    result = db.execute(text("PRAGMA journal_mode;")).scalar()
    fk_check = db.execute(text("PRAGMA foreign_keys;")).scalar()
    return {
        "status": "healthy",
        "database": "connected",
        "journal_mode": result,
        "foreign_keys": bool(fk_check),
    }
