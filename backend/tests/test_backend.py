import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from app.main import app
from app.core.db import SessionLocal
from app.models.user import User, UserSkillProgress
from app.models.course import Course, Unit, Skill, Lesson, Exercise
from app.models.gamification import League, LeagueMember, DailyXP
from app.core.clock import AppClock


from seed.seed import seed_database


@pytest.fixture(scope="module", autouse=True)
def setup_seed():
    """Ensure clean seeded state before running tests."""
    seed_database()


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture(scope="function")
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_sqlite_pragmas(client, db_session):
    """Verify foreign keys and WAL mode are enforced."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["foreign_keys"] is True
    assert data["journal_mode"].lower() == "wal"


def test_preseeded_user_niso(client, db_session):
    """Verify user 'niso' has correct initial fields and stats."""
    res = client.get("/api/users/me")
    assert res.status_code == 200
    user = res.json()
    assert user["username"] == "niso"
    assert user["display_name"] == "Niso"
    assert user["avatar"] == "owl_hero"
    assert user["timezone"] == "Asia/Kolkata"
    assert user["xp_total"] == 140
    assert user["streak_count"] == 3
    assert user["hearts"] in (4, 5)
    assert user["gems"] == 820
    assert user["daily_goal_xp"] == 20
    assert user["simulated_day_offset"] == 0
    assert user["is_seeded_bot"] is False


def test_user_skill_progress(client):
    """Verify niso has 2 skills completed and 3rd skill with 1/3 lessons completed."""
    res = client.get("/api/users/1/progress")
    assert res.status_code == 200
    progress = res.json()
    assert len(progress) == 4
    
    # Skill 1: Greetings -> 3/3
    assert progress[0]["lessons_completed"] == 3
    assert progress[0]["completed_at"] is not None
    
    # Skill 2: Basics 1 -> 3/3
    assert progress[1]["lessons_completed"] == 3
    assert progress[1]["completed_at"] is not None
    
    # Skill 3: Basics 2 -> 1/3
    assert progress[2]["lessons_completed"] == 1
    assert progress[2]["completed_at"] is None

    # Skill 4: Common Phrases -> 0/3
    assert progress[3]["lessons_completed"] == 0


def test_course_curriculum_and_exercise_types(client, db_session):
    """Verify Unit 1 has 4 skills, 3 lessons each, and 10 exercises per lesson covering all 5 types."""
    res = client.get("/api/courses/1/tree?user_id=1")
    assert res.status_code == 200
    tree = res.json()
    assert tree["name"] == "Spanish"
    assert len(tree["units"]) == 3

    unit1 = tree["units"][0]
    assert unit1["title"] == "Unit 1: Basics"
    assert len(unit1["skills"]) == 4

    # Count total exercises in Unit 1
    unit1_skill_ids = [s["id"] for s in unit1["skills"]]
    lessons = db_session.query(Lesson).filter(Lesson.skill_id.in_(unit1_skill_ids)).all()
    assert len(lessons) == 12  # 4 skills * 3 lessons

    lesson_ids = [l.id for l in lessons]
    exercises = db_session.query(Exercise).filter(Exercise.lesson_id.in_(lesson_ids)).all()
    assert len(exercises) == 120  # 12 lessons * 10 exercises

    # Check all 5 exercise types exist
    exercise_types = {ex.type for ex in exercises}
    assert exercise_types == {"select", "translate", "match_pairs", "fill_blank", "type_answer"}


def test_league_leaderboard_and_bots(client, db_session):
    """Verify Bronze league has 30 members (niso + 29 bots) and sorted properly."""
    res = client.get("/api/gamification/leagues/1/leaderboard?user_id=1")
    assert res.status_code == 200
    data = res.json()
    assert data["league"]["name"] == "Bronze"
    assert data["league"]["tier"] == 1
    assert len(data["entries"]) == 30

    # Verify niso is present and flagged as current user
    niso_entry = next(e for e in data["entries"] if e["username"] == "niso")
    assert niso_entry["is_current_user"] is True
    assert niso_entry["weekly_xp"] == 140

    # Verify bots have weekly XP between 40 and 520
    xps = [e["weekly_xp"] for e in data["entries"]]
    assert max(xps) == 520
    assert min(xps) == 40
    # Verify rankings are strictly descending
    assert xps == sorted(xps, reverse=True)


def test_lesson_detail_and_attempt_flow(client):
    """Verify loading lesson details and completing an attempt."""
    # 1. Fetch lesson 1 detail
    res = client.get("/api/courses/lessons/1")
    assert res.status_code == 200
    lesson = res.json()
    assert len(lesson["exercises"]) == 10

    # 2. Start attempt
    start_res = client.post("/api/attempts", json={"lesson_id": 1})
    assert start_res.status_code == 200
    attempt = start_res.json()
    attempt_id = attempt["id"]

    # 3. Submit correct answer for exercise 1
    ex1 = lesson["exercises"][0]
    ans_res = client.post(
        f"/api/attempts/{attempt_id}/answers",
        json={"exercise_id": ex1["id"], "submitted_answer": "Hola"},
    )
    assert ans_res.status_code == 200
    assert ans_res.json()["is_correct"] is True

    # 4. Finish attempt
    finish_res = client.post(
        f"/api/attempts/{attempt_id}/finish?status=completed"
    )
    assert finish_res.status_code == 200
    finished = finish_res.json()
    assert finished["status"] == "completed"
    assert finished["xp_earned"] == 20  # 15 base + 5 no mistakes bonus


def test_app_clock_utilities():
    """Verify clock utility functions."""
    today = AppClock.today_local_str("Asia/Kolkata", 0)
    yesterday = AppClock.yesterday_local_str("Asia/Kolkata", 0)
    assert AppClock.is_consecutive_day(yesterday, today) is True
    assert AppClock.is_same_day(today, today) is True
