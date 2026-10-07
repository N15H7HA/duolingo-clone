import os
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

tags_metadata = [
    {"name": "User & Profile", "description": "Learner profile, statistics, and preference management."},
    {"name": "Learning Path", "description": "Curriculum course tree and skill progression."},
    {"name": "Lessons & Practice", "description": "Lesson initiation, generic practice, and mistakes review."},
    {"name": "Attempt Engine", "description": "Real-time answer validation and atomic attempt completion."},
    {"name": "Hearts & Economy", "description": "Heart refills and gem economy."},
    {"name": "Leaderboard & Leagues", "description": "Weekly tiered tournament rankings with seeded competitors."},
    {"name": "Developer Sandbox", "description": "Time-machine day simulation and database reset utilities."},
    {"name": "System Health", "description": "Database connectivity and health probes."},
]

app = FastAPI(
    title="Duolingo Clone API",
    description="Production-grade, fullstack language learning API with gamification, lazy heart regeneration, and spaced repetition mistake reviews.",
    version="1.0.0",
    openapi_tags=tags_metadata,
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)

# CORS configuration for local development and production frontends (e.g. Vercel)
raw_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

frontend_env = os.getenv("FRONTEND_URL")
if frontend_env:
    raw_origins.append(frontend_env)

# Strip trailing slashes and deduplicate
allowed_origins = list(dict.fromkeys(o.strip().rstrip("/") for o in raw_origins if o and o.strip()))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
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

# Also mount v1 and health routes under /api for full backward compatibility
app.include_router(health.router, prefix="/api")
app.include_router(v1_user.router, prefix="/api")
app.include_router(v1_path.router, prefix="/api")
app.include_router(v1_lessons.router, prefix="/api")
app.include_router(v1_attempts.router, prefix="/api")
app.include_router(v1_hearts.router, prefix="/api")
app.include_router(v1_leaderboard.router, prefix="/api")
app.include_router(v1_dev.router, prefix="/api")
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
