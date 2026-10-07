import unicodedata
import re
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from app.models.user import User
from app.models.course import Lesson, Exercise, ExerciseOption, ExerciseAnswer
from app.models.attempt import LessonAttempt, AttemptAnswer
from app.services.hearts import HeartService
from app.core.clock import get_current_time


def clean_text(s: str) -> str:
    """Cleans whitespace, lowercase, and strips punctuation."""
    if not s:
        return ""
    s = s.strip().lower()
    # Strip common Spanish and standard punctuation
    s = re.sub(r'[¿¡.,!?;:"\'\-_()\[\]{}~`]', '', s)
    # Collapse whitespace
    return re.sub(r'\s+', ' ', s).strip()


def strip_accents(s: str) -> str:
    """Normalizes string using NFD to remove diacritics and accents."""
    cleaned = clean_text(s)
    nfd = unicodedata.normalize("NFD", cleaned)
    return "".join(c for c in nfd if unicodedata.category(c) != "Mn")


class LessonEngine:
    @staticmethod
    def evaluate_exercise_answer(
        exercise: Exercise, submitted_answer: str
    ) -> Dict[str, Any]:
        """
        Evaluates submitted answer against exercise data.
        Returns:
            - is_correct (bool)
            - solution (str)
            - accent_warning (bool)
        """
        # Determine primary solutions
        valid_answers = [a.answer_text for a in exercise.answers]
        if not valid_answers:
            valid_answers = [opt.text for opt in exercise.options if opt.is_correct]

        primary_solution = valid_answers[0] if valid_answers else ""

        if exercise.type == "match_pairs":
            # Matching pairs are validated client-side during the exercise or via matched pairs
            return {
                "is_correct": True,
                "solution": "All pairs matched",
                "accent_warning": False,
            }

        cleaned_sub = clean_text(submitted_answer)
        stripped_sub = strip_accents(submitted_answer)

        is_exact_match = False
        is_accentless_match = False

        for ans in valid_answers:
            ans_clean = clean_text(ans)
            ans_stripped = strip_accents(ans)

            if cleaned_sub == ans_clean:
                is_exact_match = True
                primary_solution = ans
                break
            elif stripped_sub == ans_stripped:
                is_accentless_match = True
                primary_solution = ans

        if is_exact_match:
            return {
                "is_correct": True,
                "solution": primary_solution,
                "accent_warning": False,
            }
        elif is_accentless_match:
            # Correct answer, but missed an accent mark!
            return {
                "is_correct": True,
                "solution": primary_solution,
                "accent_warning": True,
            }
        else:
            return {
                "is_correct": False,
                "solution": primary_solution,
                "accent_warning": False,
            }

    @staticmethod
    def process_attempt_answer(
        db: Session,
        attempt: LessonAttempt,
        exercise_id: int,
        submitted_answer: str,
        is_retry: bool = False,
    ) -> Dict[str, Any]:
        """
        Processes an answer submission, updates attempt mistakes and user hearts.
        """
        user = attempt.user
        current_time = get_current_time(user)

        ex_stmt = (
            select(Exercise)
            .where(Exercise.id == exercise_id)
            .options(
                selectinload(Exercise.options),
                selectinload(Exercise.answers),
            )
        )
        exercise = db.scalar(ex_stmt)
        if not exercise:
            raise ValueError("Exercise not found")

        eval_result = LessonEngine.evaluate_exercise_answer(exercise, submitted_answer)
        is_correct = eval_result["is_correct"]
        solution = eval_result["solution"]
        accent_warning = eval_result["accent_warning"]

        # Record AttemptAnswer
        attempt_ans = AttemptAnswer(
            attempt_id=attempt.id,
            exercise_id=exercise.id,
            submitted_answer=submitted_answer,
            is_correct=is_correct,
            is_retry=is_retry,
            answered_at=current_time,
        )
        db.add(attempt_ans)

        # Handle mistake - Do NOT deduct hearts during practice sessions
        if not is_correct and not is_retry and not attempt.is_practice:
            attempt.mistakes += 1
            # Decrement user heart
            remaining_hearts = HeartService.decrement_heart(user, current_time)
            attempt.hearts_lost += 1
        else:
            if not is_correct and not is_retry:
                attempt.mistakes += 1
            remaining_hearts = user.hearts

        out_of_hearts = (remaining_hearts <= 0) and not attempt.is_practice

        db.commit()

        return {
            "correct": is_correct,
            "solution": solution,
            "accent_warning": accent_warning,
            "hearts": remaining_hearts,
            "out_of_hearts": out_of_hearts,
        }
