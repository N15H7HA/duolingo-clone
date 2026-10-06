import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.db import SessionLocal
from app.models.user import User
from app.services.hearts import HeartService, MAX_HEARTS
from app.services.streak import StreakService
from app.services.xp import XPService
from app.services.lesson_engine import strip_accents, clean_text
from seed.seed import seed_database


@pytest.fixture(scope="session", autouse=True)
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


def test_get_me_endpoint(client):
    """Test GET /api/v1/me returns profile with gamification and time-aware stats."""
    res = client.get("/api/v1/me")
    assert res.status_code == 200
    data = res.json()
    assert data["username"] == "niso"
    assert data["hearts"] == 4
    assert data["next_heart_in_seconds"] > 0
    assert data["gems"] == 820
    assert data["daily_goal_xp"] == 20
    assert data["streak"] == 3
    assert data["sound_enabled"] is True


def test_update_settings_endpoint(client):
    """Test PATCH /api/v1/me/settings updates daily goal and preferences."""
    res = client.patch(
        "/api/v1/me/settings",
        json={"daily_goal_xp": 30, "dark_mode": True, "sound_enabled": False},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["daily_goal_xp"] == 30
    assert data["dark_mode"] is True
    assert data["sound_enabled"] is False

    # Restore default
    client.patch("/api/v1/me/settings", json={"daily_goal_xp": 20, "dark_mode": False, "sound_enabled": True})


def test_get_path_endpoint(client):
    """Test GET /api/v1/path derives completed, active, and locked states dynamically."""
    res = client.get("/api/v1/path")
    assert res.status_code == 200
    data = res.json()
    assert "units" in data
    assert len(data["units"]) >= 3

    unit1_skills = data["units"][0]["skills"]
    assert len(unit1_skills) == 4

    # Skill 1 (Greetings): completed (3/3 -> 100%)
    assert unit1_skills[0]["name"] == "Greetings"
    assert unit1_skills[0]["status"] == "completed"
    assert unit1_skills[0]["progress_percentage"] == 100

    # Skill 2 (Basics 1): completed (3/3 -> 100%)
    assert unit1_skills[1]["name"] == "Basics 1"
    assert unit1_skills[1]["status"] == "completed"
    assert unit1_skills[1]["progress_percentage"] == 100

    # Skill 3 (Basics 2): active (1/3 -> 33%)
    assert unit1_skills[2]["name"] == "Basics 2"
    assert unit1_skills[2]["status"] == "active"
    assert unit1_skills[2]["progress_percentage"] == 33

    # Skill 4 (Common Phrases): locked (0/3 -> 0%)
    assert unit1_skills[3]["name"] == "Common Phrases"
    assert unit1_skills[3]["status"] == "locked"
    assert unit1_skills[3]["progress_percentage"] == 0


def test_lesson_queue_stripped(client):
    """Test POST /api/v1/lessons/{id}/start returns stripped exercise options without is_correct."""
    res = client.post("/api/v1/lessons/1/start")
    assert res.status_code == 200
    data = res.json()
    assert "attempt_id" in data
    assert len(data["exercises"]) == 10

    # Ensure no is_correct field is leaked in options
    for ex in data["exercises"]:
        for opt in ex["options"]:
            assert "is_correct" not in opt


def test_answer_submission_and_accent_warning(client):
    """Test POST /api/v1/attempts/{id}/answer with exact, accent-missing, and wrong answers."""
    # Start attempt
    start_res = client.post("/api/v1/lessons/1/start")
    attempt_id = start_res.json()["attempt_id"]
    exercises = start_res.json()["exercises"]

    # Ex 1: "¡Hola!" -> Test exact match
    ex1 = exercises[0]
    ans1 = client.post(
        f"/api/v1/attempts/{attempt_id}/answer",
        json={"exercise_id": ex1["id"], "submitted_answer": "Hola"},
    )
    assert ans1.status_code == 200
    res1 = ans1.json()
    assert res1["correct"] is True
    assert res1["accent_warning"] is False

    # Ex 5: "Adiós" -> Test accent missing warning ("adios" vs "adiós")
    ex5 = exercises[4]  # Exercise 5 is type_answer for 'Goodbye'
    ans5 = client.post(
        f"/api/v1/attempts/{attempt_id}/answer",
        json={"exercise_id": ex5["id"], "submitted_answer": "adios"},
    )
    assert ans5.status_code == 200
    res5 = ans5.json()
    assert res5["correct"] is True
    assert res5["accent_warning"] is True  # Accent warning detected!

    # Ex 2: Wrong answer -> decrements heart
    ex2 = exercises[1]
    ans_wrong = client.post(
        f"/api/v1/attempts/{attempt_id}/answer",
        json={"exercise_id": ex2["id"], "submitted_answer": "Buenas noches"},
    )
    assert ans_wrong.status_code == 200
    res_w = ans_wrong.json()
    assert res_w["correct"] is False
    assert res_w["hearts"] == 3  # Decremented from 4 to 3


def test_attempt_completion_and_xp(client):
    """Test POST /api/v1/attempts/{id}/complete calculates XP and updates progress."""
    start_res = client.post("/api/v1/lessons/1/start")
    attempt_id = start_res.json()["attempt_id"]

    complete_res = client.post(
        f"/api/v1/attempts/{attempt_id}/complete",
        json={"duration_seconds": 60},  # Fast speed (< 180s)
    )
    assert complete_res.status_code == 200
    data = complete_res.json()
    assert data["status"] == "completed"
    # XP = 10 (base) + 5 (0 mistakes) + 2 (speed < 180s) = 17 XP
    assert data["xp_earned"] == 17
    assert data["streak"] >= 3


def test_heart_refill_endpoint(client):
    """Test POST /api/v1/hearts/refill refills hearts for 350 gems."""
    res = client.post("/api/v1/hearts/refill")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["hearts"] == 5
    # Initial gems was 820 -> 820 - 350 = 470
    assert data["gems"] == 470


def test_practice_lesson_endpoint(client):
    """Test POST /api/v1/practice/start."""
    res = client.post("/api/v1/practice/start")
    assert res.status_code == 200
    data = res.json()
    assert data["is_practice"] is True
    assert len(data["exercises"]) == 5


def test_leaderboard_endpoint(client):
    """Test GET /api/v1/leaderboard returns Bronze league with user 1 ranked."""
    res = client.get("/api/v1/leaderboard")
    assert res.status_code == 200
    data = res.json()
    assert data["league_name"] == "Bronze"
    assert len(data["entries"]) == 30
    assert any(e["is_current_user"] for e in data["entries"])


def test_dev_advance_day_and_reset(client):
    """Test developer endpoints: advance day and database reset."""
    adv_res = client.post("/api/v1/dev/advance-day")
    assert adv_res.status_code == 200
    assert adv_res.json()["simulated_day_offset"] == 1

    reset_res = client.post("/api/v1/dev/reset")
    assert reset_res.status_code == 200
    assert reset_res.json()["success"] is True

    # Check that after reset, user offset is 0 again
    me_res = client.get("/api/v1/me")
    assert me_res.json()["simulated_day_offset"] == 0
    assert me_res.json()["hearts"] == 4
    assert me_res.json()["gems"] == 820


def test_xp_calculation_unit():
    """Verify XP calculation logic."""
    assert XPService.calculate_lesson_xp(mistakes=0, duration_seconds=120) == 17  # 10 + 5 + 2
    assert XPService.calculate_lesson_xp(mistakes=2, duration_seconds=120) == 12  # 10 + 0 + 2
    assert XPService.calculate_lesson_xp(mistakes=0, duration_seconds=300) == 15  # 10 + 5 + 0
    assert XPService.calculate_lesson_xp(mistakes=1, duration_seconds=300) == 10  # 10 + 0 + 0


def test_accent_stripping_unit():
    """Verify accent stripping and normalization helpers."""
    assert clean_text("¡Hola, Mundo!") == "hola mundo"
    assert strip_accents("¿Cómo estás?") == "como estas"
    assert strip_accents("Adiós") == "adios"
