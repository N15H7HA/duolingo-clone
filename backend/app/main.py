from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.db import engine, Base
# Ensure all models are registered with Base metadata
import app.models  # noqa: F401

# Import v1 routers
from app.routers import (
    v1_user,
    v1_path,
    v1_lessons,
    v1_attempts,
    v1_hearts,
    v1_leaderboard,
    v1_dev,
    health,
    courses,
    users,
    attempts,
    gamification,
)

# Auto-create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Duolingo Clone API",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)

# CORS configuration for local development and production frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register v1 endpoints under /api/v1
API_V1_PREFIX = "/api/v1"
app.include_router(v1_user.router, prefix=API_V1_PREFIX)
app.include_router(v1_path.router, prefix=API_V1_PREFIX)
app.include_router(v1_lessons.router, prefix=API_V1_PREFIX)
app.include_router(v1_attempts.router, prefix=API_V1_PREFIX)
app.include_router(v1_hearts.router, prefix=API_V1_PREFIX)
app.include_router(v1_leaderboard.router, prefix=API_V1_PREFIX)
app.include_router(v1_dev.router, prefix=API_V1_PREFIX)
app.include_router(health.router, prefix=API_V1_PREFIX)

# Also mount legacy routes under /api for full backward compatibility
app.include_router(health.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(attempts.router, prefix="/api")
app.include_router(gamification.router, prefix="/api")


@app.get("/")
def root():
    return {
        "app": "Duolingo Clone API",
        "version": "1.0.0",
        "docs": "/api/v1/docs",
    }
