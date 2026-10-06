import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

# Add backend directory to sys.path so app modules import cleanly
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.db import engine, Base, SessionLocal
from app.core.clock import AppClock
from app.models.user import User, UserSkillProgress
from app.models.course import (
    Course,
    Unit,
    Skill,
    Lesson,
    Exercise,
    ExerciseOption,
    ExerciseAnswer,
)
from app.models.gamification import DailyXP, League, LeagueMember


def clean_database(db: Session) -> None:
    """Drops and recreates all database tables."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def seed_leagues(db: Session) -> list[League]:
    league_names = [
        "Bronze",
        "Silver",
        "Gold",
        "Sapphire",
        "Ruby",
        "Emerald",
        "Amethyst",
        "Pearl",
        "Obsidian",
        "Diamond",
    ]
    leagues = []
    for tier, name in enumerate(league_names, start=1):
        league = League(name=name, tier=tier)
        db.add(league)
        leagues.append(league)
    db.flush()
    return leagues


def create_exercise(
    db: Session,
    lesson_id: int,
    position: int,
    ex_type: str,
    prompt: str,
    source_text: str,
    image_key: str | None,
    options_data: list[dict],
    answers_data: list[str],
) -> Exercise:
    ex = Exercise(
        lesson_id=lesson_id,
        position=position,
        type=ex_type,
        prompt=prompt,
        source_text=source_text,
        image_key=image_key,
    )
    db.add(ex)
    db.flush()

    for opt in options_data:
        db.add(
            ExerciseOption(
                exercise_id=ex.id,
                text=opt["text"],
                is_correct=opt.get("is_correct", False),
                pair_key=opt.get("pair_key"),
                side=opt.get("side"),
                position=opt.get("position", 0),
            )
        )

    for ans_text in answers_data:
        db.add(
            ExerciseAnswer(
                exercise_id=ex.id,
                answer_text=ans_text,
            )
        )

    return ex


def seed_unit1_basics(db: Session, unit: Unit) -> list[Skill]:
    skills_data = [
        {"position": 1, "name": "Greetings", "icon": "wave", "lesson_count": 3},
        {"position": 2, "name": "Basics 1", "icon": "coffee", "lesson_count": 3},
        {"position": 3, "name": "Basics 2", "icon": "apple", "lesson_count": 3},
        {"position": 4, "name": "Common Phrases", "icon": "chat", "lesson_count": 3},
    ]

    skills = []
    for s_info in skills_data:
        skill = Skill(
            unit_id=unit.id,
            position=s_info["position"],
            name=s_info["name"],
            icon=s_info["icon"],
            lesson_count=s_info["lesson_count"],
        )
        db.add(skill)
        skills.append(skill)
    db.flush()

    # ----------------------------------------------------
    # SKILL 1: Greetings (3 Lessons x 10 Exercises = 30)
    # ----------------------------------------------------
    s1 = skills[0]
    
    # Lesson 1.1: Hello & Goodbye
    l1_1 = Lesson(skill_id=s1.id, position=1, title="Hello & Goodbye")
    db.add(l1_1)
    db.flush()

    # Ex 1: Select
    create_exercise(
        db, l1_1.id, 1, "select",
        "Select the correct translation for 'Hello'",
        "Hello", "hand_wave",
        [
            {"text": "¡Hola!", "is_correct": True, "position": 1},
            {"text": "Adiós", "is_correct": False, "position": 2},
            {"text": "Gracias", "is_correct": False, "position": 3},
        ],
        ["Hola", "¡Hola!"]
    )
    # Ex 2: Translate
    create_exercise(
        db, l1_1.id, 2, "translate",
        "Translate this sentence",
        "Good morning", None,
        [
            {"text": "Buenos", "is_correct": True, "position": 1},
            {"text": "días", "is_correct": True, "position": 2},
            {"text": "noches", "is_correct": False, "position": 3},
            {"text": "Hola", "is_correct": False, "position": 4},
        ],
        ["Buenos días", "buenos dias"]
    )
    # Ex 3: Match Pairs
    create_exercise(
        db, l1_1.id, 3, "match_pairs",
        "Match the greeting pairs",
        "Greetings matching", None,
        [
            {"text": "Hello", "pair_key": "p1", "side": "left", "position": 1},
            {"text": "Goodbye", "pair_key": "p2", "side": "left", "position": 2},
            {"text": "Thanks", "pair_key": "p3", "side": "left", "position": 3},
            {"text": "Morning", "pair_key": "p4", "side": "left", "position": 4},
            {"text": "Night", "pair_key": "p5", "side": "left", "position": 5},
            {"text": "Hola", "pair_key": "p1", "side": "right", "position": 1},
            {"text": "Adiós", "pair_key": "p2", "side": "right", "position": 2},
            {"text": "Gracias", "pair_key": "p3", "side": "right", "position": 3},
            {"text": "Mañana", "pair_key": "p4", "side": "right", "position": 4},
            {"text": "Noche", "pair_key": "p5", "side": "right", "position": 5},
        ],
        ["All matched"]
    )
    # Ex 4: Fill in the blank
    create_exercise(
        db, l1_1.id, 4, "fill_blank",
        "Complete the sentence",
        "Buenas ___ (Good evening)", None,
        [
            {"text": "noches", "is_correct": True, "position": 1},
            {"text": "días", "is_correct": False, "position": 2},
            {"text": "tardes", "is_correct": False, "position": 3},
        ],
        ["noches", "Buenas noches"]
    )
    # Ex 5: Type Answer
    create_exercise(
        db, l1_1.id, 5, "type_answer",
        "Type 'Goodbye' in Spanish",
        "Goodbye", "waving_man",
        [],
        ["adiós", "Adiós"]
    )
    # Ex 6: Select
    create_exercise(
        db, l1_1.id, 6, "select",
        "Select the correct translation for 'Good afternoon'",
        "Good afternoon", "sun",
        [
            {"text": "Buenas tardes", "is_correct": True, "position": 1},
            {"text": "Buenos días", "is_correct": False, "position": 2},
            {"text": "Buenas noches", "is_correct": False, "position": 3},
        ],
        ["Buenas tardes", "buenas tardes"]
    )
    # Ex 7: Translate
    create_exercise(
        db, l1_1.id, 7, "translate",
        "Translate this sentence",
        "Hello, good morning", None,
        [
            {"text": "Hola,", "is_correct": True, "position": 1},
            {"text": "buenos", "is_correct": True, "position": 2},
            {"text": "días", "is_correct": True, "position": 3},
            {"text": "adiós", "is_correct": False, "position": 4},
        ],
        ["Hola, buenos días", "Hola buenos dias", "¡Hola! Buenos días"]
    )
    # Ex 8: Fill Blank
    create_exercise(
        db, l1_1.id, 8, "fill_blank",
        "Complete the sentence",
        "Muchas ___ (Many thanks)", None,
        [
            {"text": "gracias", "is_correct": True, "position": 1},
            {"text": "noches", "is_correct": False, "position": 2},
            {"text": "tardes", "is_correct": False, "position": 3},
        ],
        ["gracias", "Muchas gracias"]
    )
    # Ex 9: Select
    create_exercise(
        db, l1_1.id, 9, "select",
        "What does 'Adiós' mean?",
        "Adiós", None,
        [
            {"text": "Goodbye", "is_correct": True, "position": 1},
            {"text": "Hello", "is_correct": False, "position": 2},
            {"text": "Please", "is_correct": False, "position": 3},
        ],
        ["Goodbye", "goodbye", "bye"]
    )
    # Ex 10: Type Answer
    create_exercise(
        db, l1_1.id, 10, "type_answer",
        "Type 'Thank you' in Spanish",
        "Thank you", "thumbs_up",
        [],
        ["gracias", "Gracias"]
    )

    # Lesson 1.2: How are you?
    l1_2 = Lesson(skill_id=s1.id, position=2, title="How are you?")
    db.add(l1_2)
    db.flush()

    create_exercise(
        db, l1_2.id, 1, "select",
        "How do you say 'How are you?'",
        "How are you?", "question_person",
        [
            {"text": "¿Cómo estás?", "is_correct": True, "position": 1},
            {"text": "¿Dónde estás?", "is_correct": False, "position": 2},
            {"text": "¿Quién eres?", "is_correct": False, "position": 3},
        ],
        ["¿Cómo estás?", "Como estas", "como estas?"]
    )
    create_exercise(
        db, l1_2.id, 2, "translate",
        "Translate this sentence",
        "Very well, thank you", None,
        [
            {"text": "Muy", "is_correct": True, "position": 1},
            {"text": "bien,", "is_correct": True, "position": 2},
            {"text": "gracias", "is_correct": True, "position": 3},
            {"text": "mal", "is_correct": False, "position": 4},
        ],
        ["Muy bien, gracias", "Muy bien gracias", "muy bien, gracias"]
    )
    create_exercise(
        db, l1_2.id, 3, "match_pairs",
        "Match the pairs",
        "Well-being match", None,
        [
            {"text": "Very", "pair_key": "p1", "side": "left", "position": 1},
            {"text": "Well", "pair_key": "p2", "side": "left", "position": 2},
            {"text": "Bad", "pair_key": "p3", "side": "left", "position": 3},
            {"text": "Please", "pair_key": "p4", "side": "left", "position": 4},
            {"text": "You're welcome", "pair_key": "p5", "side": "left", "position": 5},
            {"text": "Muy", "pair_key": "p1", "side": "right", "position": 1},
            {"text": "Bien", "pair_key": "p2", "side": "right", "position": 2},
            {"text": "Mal", "pair_key": "p3", "side": "right", "position": 3},
            {"text": "Por favor", "pair_key": "p4", "side": "right", "position": 4},
            {"text": "De nada", "pair_key": "p5", "side": "right", "position": 5},
        ],
        ["All matched"]
    )
    create_exercise(
        db, l1_2.id, 4, "fill_blank",
        "Complete the response",
        "De ___ (You are welcome)", None,
        [
            {"text": "nada", "is_correct": True, "position": 1},
            {"text": "todo", "is_correct": False, "position": 2},
            {"text": "bien", "is_correct": False, "position": 3},
        ],
        ["nada", "De nada"]
    )
    create_exercise(
        db, l1_2.id, 5, "type_answer",
        "Type 'Please' in Spanish",
        "Please", "pray_hands",
        [],
        ["por favor", "Por favor", "porfavor"]
    )
    create_exercise(
        db, l1_2.id, 6, "select",
        "Select the translation for 'Nice to meet you'",
        "Nice to meet you", "handshake",
        [
            {"text": "Mucho gusto", "is_correct": True, "position": 1},
            {"text": "Hasta luego", "is_correct": False, "position": 2},
            {"text": "Buenas noches", "is_correct": False, "position": 3},
        ],
        ["Mucho gusto", "mucho gusto"]
    )
    create_exercise(
        db, l1_2.id, 7, "translate",
        "Translate this sentence",
        "And you?", None,
        [
            {"text": "¿Y", "is_correct": True, "position": 1},
            {"text": "tú?", "is_correct": True, "position": 2},
            {"text": "él", "is_correct": False, "position": 3},
            {"text": "yo", "is_correct": False, "position": 4},
        ],
        ["¿Y tú?", "Y tu", "y tu?", "Y tú?"]
    )
    create_exercise(
        db, l1_2.id, 8, "fill_blank",
        "Complete the sentence",
        "Por ___, gracias (Please, thank you)", None,
        [
            {"text": "favor", "is_correct": True, "position": 1},
            {"text": "nada", "is_correct": False, "position": 2},
            {"text": "bien", "is_correct": False, "position": 3},
        ],
        ["favor", "Por favor"]
    )
    create_exercise(
        db, l1_2.id, 9, "select",
        "What does 'Muy mal' mean?",
        "Muy mal", "sad_face",
        [
            {"text": "Very bad", "is_correct": True, "position": 1},
            {"text": "Very good", "is_correct": False, "position": 2},
            {"text": "So-so", "is_correct": False, "position": 3},
        ],
        ["Very bad", "very bad"]
    )
    create_exercise(
        db, l1_2.id, 10, "type_answer",
        "Type 'Well' in Spanish",
        "Well", "smile",
        [],
        ["bien", "Bien"]
    )

    # Lesson 1.3: Introductions
    l1_3 = Lesson(skill_id=s1.id, position=3, title="Introductions")
    db.add(l1_3)
    db.flush()

    create_exercise(
        db, l1_3.id, 1, "select",
        "How do you say 'My name is Carlos'?",
        "My name is Carlos", "boy_profile",
        [
            {"text": "Me llamo Carlos", "is_correct": True, "position": 1},
            {"text": "Yo eres Carlos", "is_correct": False, "position": 2},
            {"text": "Tú te llamas Carlos", "is_correct": False, "position": 3},
        ],
        ["Me llamo Carlos", "me llamo carlos"]
    )
    create_exercise(
        db, l1_3.id, 2, "translate",
        "Translate this sentence",
        "See you later", None,
        [
            {"text": "Hasta", "is_correct": True, "position": 1},
            {"text": "luego", "is_correct": True, "position": 2},
            {"text": "mañana", "is_correct": False, "position": 3},
            {"text": "Hola", "is_correct": False, "position": 4},
        ],
        ["Hasta luego", "hasta luego"]
    )
    create_exercise(
        db, l1_3.id, 3, "match_pairs",
        "Match the introduction terms",
        "Introductions match", None,
        [
            {"text": "Name", "pair_key": "p1", "side": "left", "position": 1},
            {"text": "See you tomorrow", "pair_key": "p2", "side": "left", "position": 2},
            {"text": "Delighted", "pair_key": "p3", "side": "left", "position": 3},
            {"text": "Friend", "pair_key": "p4", "side": "left", "position": 4},
            {"text": "Sir/Mr", "pair_key": "p5", "side": "left", "position": 5},
            {"text": "Nombre", "pair_key": "p1", "side": "right", "position": 1},
            {"text": "Hasta mañana", "pair_key": "p2", "side": "right", "position": 2},
            {"text": "Encantado", "pair_key": "p3", "side": "right", "position": 3},
            {"text": "Amigo", "pair_key": "p4", "side": "right", "position": 4},
            {"text": "Señor", "pair_key": "p5", "side": "right", "position": 5},
        ],
        ["All matched"]
    )
    create_exercise(
        db, l1_3.id, 4, "fill_blank",
        "Complete the sentence",
        "Hasta ___ (See you tomorrow)", None,
        [
            {"text": "mañana", "is_correct": True, "position": 1},
            {"text": "luego", "is_correct": False, "position": 2},
            {"text": "pronto", "is_correct": False, "position": 3},
        ],
        ["mañana", "manana", "Hasta mañana"]
    )
    create_exercise(
        db, l1_3.id, 5, "type_answer",
        "Type 'See you later' in Spanish",
        "See you later", "clock_icon",
        [],
        ["hasta luego", "Hasta luego"]
    )
    create_exercise(
        db, l1_3.id, 6, "select",
        "Select the correct word for 'Madam/Mrs.'",
        "Madam / Mrs.", "woman_icon",
        [
            {"text": "Señora", "is_correct": True, "position": 1},
            {"text": "Señorita", "is_correct": False, "position": 2},
            {"text": "Señor", "is_correct": False, "position": 3},
        ],
        ["Señora", "señora", "senora"]
    )
    create_exercise(
        db, l1_3.id, 7, "translate",
        "Translate this sentence",
        "Hello, delighted to meet you", None,
        [
            {"text": "Hola,", "is_correct": True, "position": 1},
            {"text": "encantado", "is_correct": True, "position": 2},
            {"text": "adiós", "is_correct": False, "position": 3},
            {"text": "luego", "is_correct": False, "position": 4},
        ],
        ["Hola, encantado", "Hola encantado", "¡Hola! Encantado"]
    )
    create_exercise(
        db, l1_3.id, 8, "fill_blank",
        "Complete the sentence",
        "¿Cómo te ___? (What is your name?)", None,
        [
            {"text": "llamas", "is_correct": True, "position": 1},
            {"text": "llamo", "is_correct": False, "position": 2},
            {"text": "llama", "is_correct": False, "position": 3},
        ],
        ["llamas", "¿Cómo te llamas?"]
    )
    create_exercise(
        db, l1_3.id, 9, "select",
        "What does 'Hasta pronto' mean?",
        "Hasta pronto", None,
        [
            {"text": "See you soon", "is_correct": True, "position": 1},
            {"text": "See you yesterday", "is_correct": False, "position": 2},
            {"text": "Good morning", "is_correct": False, "position": 3},
        ],
        ["See you soon", "see you soon"]
    )
    create_exercise(
        db, l1_3.id, 10, "type_answer",
        "Type 'Friend' in Spanish",
        "Friend", "handshake",
        [],
        ["amigo", "amiga", "Amigo", "Amiga"]
    )

    # ----------------------------------------------------
    # SKILL 2: Basics 1 (3 Lessons x 10 Exercises = 30)
    # ----------------------------------------------------
    s2 = skills[1]

    # Lesson 2.1: People & Pronouns
    l2_1 = Lesson(skill_id=s2.id, position=1, title="People & Pronouns")
    db.add(l2_1)
    db.flush()

    create_exercise(
        db, l2_1.id, 1, "select",
        "Select the correct translation for 'I am a boy'",
        "I am a boy", "boy_standing",
        [
            {"text": "Yo soy un niño", "is_correct": True, "position": 1},
            {"text": "Ella es una niña", "is_correct": False, "position": 2},
            {"text": "Tú eres un hombre", "is_correct": False, "position": 3},
        ],
        ["Yo soy un niño", "yo soy un nino"]
    )
    create_exercise(
        db, l2_1.id, 2, "translate",
        "Translate this sentence",
        "The woman", "woman_face",
        [
            {"text": "La", "is_correct": True, "position": 1},
            {"text": "mujer", "is_correct": True, "position": 2},
            {"text": "El", "is_correct": False, "position": 3},
            {"text": "hombre", "is_correct": False, "position": 4},
        ],
        ["La mujer", "la mujer"]
    )
    create_exercise(
        db, l2_1.id, 3, "match_pairs",
        "Match the basic words",
        "Basics matching", None,
        [
            {"text": "Man", "pair_key": "p1", "side": "left", "position": 1},
            {"text": "Woman", "pair_key": "p2", "side": "left", "position": 2},
            {"text": "Boy", "pair_key": "p3", "side": "left", "position": 3},
            {"text": "Girl", "pair_key": "p4", "side": "left", "position": 4},
            {"text": "I", "pair_key": "p5", "side": "left", "position": 5},
            {"text": "Hombre", "pair_key": "p1", "side": "right", "position": 1},
            {"text": "Mujer", "pair_key": "p2", "side": "right", "position": 2},
            {"text": "Niño", "pair_key": "p3", "side": "right", "position": 3},
            {"text": "Niña", "pair_key": "p4", "side": "right", "position": 4},
            {"text": "Yo", "pair_key": "p5", "side": "right", "position": 5},
        ],
        ["All matched"]
    )
    create_exercise(
        db, l2_1.id, 4, "fill_blank",
        "Complete the sentence",
        "Tú ___ una mujer (You are a woman)", None,
        [
            {"text": "eres", "is_correct": True, "position": 1},
            {"text": "soy", "is_correct": False, "position": 2},
            {"text": "es", "is_correct": False, "position": 3},
        ],
        ["eres", "Tú eres una mujer"]
    )
    create_exercise(
        db, l2_1.id, 5, "type_answer",
        "Type 'The man' in Spanish",
        "The man", "man_face",
        [],
        ["el hombre", "El hombre"]
    )
    create_exercise(
        db, l2_1.id, 6, "select",
        "Select the translation for 'She is a girl'",
        "She is a girl", "girl_standing",
        [
            {"text": "Ella es una niña", "is_correct": True, "position": 1},
            {"text": "Él es un niño", "is_correct": False, "position": 2},
            {"text": "Yo soy una niña", "is_correct": False, "position": 3},
        ],
        ["Ella es una niña", "ella es una nina"]
    )
    create_exercise(
        db, l2_1.id, 7, "translate",
        "Translate this sentence",
        "He is a man", None,
        [
            {"text": "Él", "is_correct": True, "position": 1},
            {"text": "es", "is_correct": True, "position": 2},
            {"text": "un", "is_correct": True, "position": 3},
            {"text": "hombre", "is_correct": True, "position": 4},
            {"text": "mujer", "is_correct": False, "position": 5},
        ],
        ["Él es un hombre", "El es un hombre", "el es un hombre"]
    )
    create_exercise(
        db, l2_1.id, 8, "fill_blank",
        "Complete the sentence",
        "Yo ___ un hombre (I am a man)", None,
        [
            {"text": "soy", "is_correct": True, "position": 1},
            {"text": "eres", "is_correct": False, "position": 2},
            {"text": "es", "is_correct": False, "position": 3},
        ],
        ["soy", "Yo soy"]
    )
    create_exercise(
        db, l2_1.id, 9, "select",
        "What does 'Un niño' mean?",
        "Un niño", None,
        [
            {"text": "A boy", "is_correct": True, "position": 1},
            {"text": "A girl", "is_correct": False, "position": 2},
            {"text": "A man", "is_correct": False, "position": 3},
        ],
        ["A boy", "a boy"]
    )
    create_exercise(
        db, l2_1.id, 10, "type_answer",
        "Type 'The girl' in Spanish",
        "The girl", "girl_face",
        [],
        ["la niña", "La niña", "la nina", "La nina"]
    )

    # Lesson 2.2: Eating & Drinking
    l2_2 = Lesson(skill_id=s2.id, position=2, title="Eating & Drinking")
    db.add(l2_2)
    db.flush()

    create_exercise(
        db, l2_2.id, 1, "select",
        "Select the correct translation for 'I drink water'",
        "I drink water", "water_glass",
        [
            {"text": "Yo bebo agua", "is_correct": True, "position": 1},
            {"text": "Yo como pan", "is_correct": False, "position": 2},
            {"text": "Tú bebes leche", "is_correct": False, "position": 3},
        ],
        ["Yo bebo agua", "yo bebo agua"]
    )
    create_exercise(
        db, l2_2.id, 2, "translate",
        "Translate this sentence",
        "The man eats bread", None,
        [
            {"text": "El", "is_correct": True, "position": 1},
            {"text": "hombre", "is_correct": True, "position": 2},
            {"text": "come", "is_correct": True, "position": 3},
            {"text": "pan", "is_correct": True, "position": 4},
            {"text": "agua", "is_correct": False, "position": 5},
        ],
        ["El hombre come pan", "el hombre come pan"]
    )
    create_exercise(
        db, l2_2.id, 3, "match_pairs",
        "Match food and drink words",
        "Food drinks match", None,
        [
            {"text": "Water", "pair_key": "p1", "side": "left", "position": 1},
            {"text": "Bread", "pair_key": "p2", "side": "left", "position": 2},
            {"text": "Milk", "pair_key": "p3", "side": "left", "position": 3},
            {"text": "Apple", "pair_key": "p4", "side": "left", "position": 4},
            {"text": "Eat", "pair_key": "p5", "side": "left", "position": 5},
            {"text": "Agua", "pair_key": "p1", "side": "right", "position": 1},
            {"text": "Pan", "pair_key": "p2", "side": "right", "position": 2},
            {"text": "Leche", "pair_key": "p3", "side": "right", "position": 3},
            {"text": "Manzana", "pair_key": "p4", "side": "right", "position": 4},
            {"text": "Comer", "pair_key": "p5", "side": "right", "position": 5},
        ],
        ["All matched"]
    )
    create_exercise(
        db, l2_2.id, 4, "fill_blank",
        "Complete the sentence",
        "Tú ___ leche (You drink milk)", None,
        [
            {"text": "bebes", "is_correct": True, "position": 1},
            {"text": "bebo", "is_correct": False, "position": 2},
            {"text": "bebe", "is_correct": False, "position": 3},
        ],
        ["bebes", "Tú bebes leche"]
    )
    create_exercise(
        db, l2_2.id, 5, "type_answer",
        "Type 'Bread' in Spanish",
        "Bread", "bread_loaf",
        [],
        ["pan", "Pan", "el pan", "El pan"]
    )
    create_exercise(
        db, l2_2.id, 6, "select",
        "Select the translation for 'An apple'",
        "An apple", "red_apple",
        [
            {"text": "Una manzana", "is_correct": True, "position": 1},
            {"text": "Un pan", "is_correct": False, "position": 2},
            {"text": "Un agua", "is_correct": False, "position": 3},
        ],
        ["Una manzana", "una manzana"]
    )
    create_exercise(
        db, l2_2.id, 7, "translate",
        "Translate this sentence",
        "The woman drinks milk", None,
        [
            {"text": "La", "is_correct": True, "position": 1},
            {"text": "mujer", "is_correct": True, "position": 2},
            {"text": "bebe", "is_correct": True, "position": 3},
            {"text": "leche", "is_correct": True, "position": 4},
            {"text": "come", "is_correct": False, "position": 5},
        ],
        ["La mujer bebe leche", "la mujer bebe leche"]
    )
    create_exercise(
        db, l2_2.id, 8, "fill_blank",
        "Complete the sentence",
        "El niño ___ una manzana (The boy eats an apple)", None,
        [
            {"text": "come", "is_correct": True, "position": 1},
            {"text": "como", "is_correct": False, "position": 2},
            {"text": "comes", "is_correct": False, "position": 3},
        ],
        ["come", "El niño come una manzana"]
    )
    create_exercise(
        db, l2_2.id, 9, "select",
        "What does 'Yo bebo' mean?",
        "Yo bebo", None,
        [
            {"text": "I drink", "is_correct": True, "position": 1},
            {"text": "You drink", "is_correct": False, "position": 2},
            {"text": "He drinks", "is_correct": False, "position": 3},
        ],
        ["I drink", "i drink"]
    )
    create_exercise(
        db, l2_2.id, 10, "type_answer",
        "Type 'Water' in Spanish",
        "Water", "water_drop",
        [],
        ["agua", "Agua", "el agua", "El agua"]
    )

    # Lesson 2.3: Simple Sentences
    l2_3 = Lesson(skill_id=s2.id, position=3, title="Simple Sentences")
    db.add(l2_3)
    db.flush()

    create_exercise(
        db, l2_3.id, 1, "select",
        "Select the correct translation for 'You eat an apple'",
        "You eat an apple", "eating_apple",
        [
            {"text": "Tú comes una manzana", "is_correct": True, "position": 1},
            {"text": "Yo como una manzana", "is_correct": False, "position": 2},
            {"text": "Ella come pan", "is_correct": False, "position": 3},
        ],
        ["Tú comes una manzana", "tu comes una manzana"]
    )
    create_exercise(
        db, l2_3.id, 2, "translate",
        "Translate this sentence",
        "I am a woman", None,
        [
            {"text": "Yo", "is_correct": True, "position": 1},
            {"text": "soy", "is_correct": True, "position": 2},
            {"text": "una", "is_correct": True, "position": 3},
            {"text": "mujer", "is_correct": True, "position": 4},
            {"text": "un", "is_correct": False, "position": 5},
        ],
        ["Yo soy una mujer", "yo soy una mujer"]
    )
    create_exercise(
        db, l2_3.id, 3, "match_pairs",
        "Match verbs with forms",
        "Verb match", None,
        [
            {"text": "I eat", "pair_key": "p1", "side": "left", "position": 1},
            {"text": "You eat", "pair_key": "p2", "side": "left", "position": 2},
            {"text": "He eats", "pair_key": "p3", "side": "left", "position": 3},
            {"text": "I drink", "pair_key": "p4", "side": "left", "position": 4},
            {"text": "She drinks", "pair_key": "p5", "side": "left", "position": 5},
            {"text": "Yo como", "pair_key": "p1", "side": "right", "position": 1},
            {"text": "Tú comes", "pair_key": "p2", "side": "right", "position": 2},
            {"text": "Él come", "pair_key": "p3", "side": "right", "position": 3},
            {"text": "Yo bebo", "pair_key": "p4", "side": "right", "position": 4},
            {"text": "Ella bebe", "pair_key": "p5", "side": "right", "position": 5},
        ],
        ["All matched"]
    )
    create_exercise(
        db, l2_3.id, 4, "fill_blank",
        "Complete the sentence",
        "Ella ___ agua (She drinks water)", None,
        [
            {"text": "bebe", "is_correct": True, "position": 1},
            {"text": "bebo", "is_correct": False, "position": 2},
            {"text": "bebes", "is_correct": False, "position": 3},
        ],
        ["bebe", "Ella bebe agua"]
    )
    create_exercise(
        db, l2_3.id, 5, "type_answer",
        "Type 'Milk' in Spanish",
        "Milk", "milk_bottle",
        [],
        ["leche", "Leche", "la leche", "La leche"]
    )
    create_exercise(
        db, l2_3.id, 6, "select",
        "Select 'The girl eats bread'",
        "The girl eats bread", "girl_eating",
        [
            {"text": "La niña come pan", "is_correct": True, "position": 1},
            {"text": "El niño bebe agua", "is_correct": False, "position": 2},
            {"text": "La mujer come manzana", "is_correct": False, "position": 3},
        ],
        ["La niña come pan", "la nina come pan"]
    )
    create_exercise(
        db, l2_3.id, 7, "translate",
        "Translate this sentence",
        "The boy drinks water", None,
        [
            {"text": "El", "is_correct": True, "position": 1},
            {"text": "niño", "is_correct": True, "position": 2},
            {"text": "bebe", "is_correct": True, "position": 3},
            {"text": "agua", "is_correct": True, "position": 4},
            {"text": "leche", "is_correct": False, "position": 5},
        ],
        ["El niño bebe agua", "el nino bebe agua"]
    )
    create_exercise(
        db, l2_3.id, 8, "fill_blank",
        "Complete the sentence",
        "Yo ___ pan (I eat bread)", None,
        [
            {"text": "como", "is_correct": True, "position": 1},
            {"text": "comes", "is_correct": False, "position": 2},
            {"text": "come", "is_correct": False, "position": 3},
        ],
        ["como", "Yo como pan"]
    )
    create_exercise(
        db, l2_3.id, 9, "select",
        "What does 'Ella es una mujer' mean?",
        "Ella es una mujer", None,
        [
            {"text": "She is a woman", "is_correct": True, "position": 1},
            {"text": "He is a man", "is_correct": False, "position": 2},
            {"text": "I am a girl", "is_correct": False, "position": 3},
        ],
        ["She is a woman", "she is a woman"]
    )
    create_exercise(
        db, l2_3.id, 10, "type_answer",
        "Type 'I eat' in Spanish",
        "I eat", "cutlery",
        [],
        ["yo como", "como", "Yo como", "Como"]
    )

    # ----------------------------------------------------
    # SKILL 3: Basics 2 (3 Lessons x 10 Exercises = 30)
    # ----------------------------------------------------
    s3 = skills[2]

    # Lesson 3.1: Animals & Basics
    l3_1 = Lesson(skill_id=s3.id, position=1, title="Animals & Creatures")
    db.add(l3_1)
    db.flush()

    create_exercise(
        db, l3_1.id, 1, "select",
        "Select the correct translation for 'The dog'",
        "The dog", "dog_cute",
        [
            {"text": "El perro", "is_correct": True, "position": 1},
            {"text": "El gato", "is_correct": False, "position": 2},
            {"text": "El caballo", "is_correct": False, "position": 3},
        ],
        ["El perro", "el perro"]
    )
    create_exercise(
        db, l3_1.id, 2, "translate",
        "Translate this sentence",
        "The cat drinks milk", "cat_milk",
        [
            {"text": "El", "is_correct": True, "position": 1},
            {"text": "gato", "is_correct": True, "position": 2},
            {"text": "bebe", "is_correct": True, "position": 3},
            {"text": "leche", "is_correct": True, "position": 4},
            {"text": "perro", "is_correct": False, "position": 5},
        ],
        ["El gato bebe leche", "el gato bebe leche"]
    )
    create_exercise(
        db, l3_1.id, 3, "match_pairs",
        "Match the animal words",
        "Animal pairs", None,
        [
            {"text": "Dog", "pair_key": "p1", "side": "left", "position": 1},
            {"text": "Cat", "pair_key": "p2", "side": "left", "position": 2},
            {"text": "Horse", "pair_key": "p3", "side": "left", "position": 3},
            {"text": "Bird", "pair_key": "p4", "side": "left", "position": 4},
            {"text": "Duck", "pair_key": "p5", "side": "left", "position": 5},
            {"text": "Perro", "pair_key": "p1", "side": "right", "position": 1},
            {"text": "Gato", "pair_key": "p2", "side": "right", "position": 2},
            {"text": "Caballo", "pair_key": "p3", "side": "right", "position": 3},
            {"text": "Pájaro", "pair_key": "p4", "side": "right", "position": 4},
            {"text": "Pato", "pair_key": "p5", "side": "right", "position": 5},
        ],
        ["All matched"]
    )
    create_exercise(
        db, l3_1.id, 4, "fill_blank",
        "Complete the sentence",
        "El perro ___ pan (The dog eats bread)", None,
        [
            {"text": "come", "is_correct": True, "position": 1},
            {"text": "bebe", "is_correct": False, "position": 2},
            {"text": "soy", "is_correct": False, "position": 3},
        ],
        ["come", "El perro come pan"]
    )
    create_exercise(
        db, l3_1.id, 5, "type_answer",
        "Type 'The cat' in Spanish",
        "The cat", "cat_icon",
        [],
        ["el gato", "El gato"]
    )
    create_exercise(
        db, l3_1.id, 6, "select",
        "Select the translation for 'The horse'",
        "The horse", "horse_icon",
        [
            {"text": "El caballo", "is_correct": True, "position": 1},
            {"text": "El pájaro", "is_correct": False, "position": 2},
            {"text": "El pato", "is_correct": False, "position": 3},
        ],
        ["El caballo", "el caballo"]
    )
    create_exercise(
        db, l3_1.id, 7, "translate",
        "Translate this sentence",
        "The duck drinks water", None,
        [
            {"text": "El", "is_correct": True, "position": 1},
            {"text": "pato", "is_correct": True, "position": 2},
            {"text": "bebe", "is_correct": True, "position": 3},
            {"text": "agua", "is_correct": True, "position": 4},
            {"text": "come", "is_correct": False, "position": 5},
        ],
        ["El pato bebe agua", "el pato bebe agua"]
    )
    create_exercise(
        db, l3_1.id, 8, "fill_blank",
        "Complete the sentence",
        "El caballo bebe ___ (The horse drinks water)", None,
        [
            {"text": "agua", "is_correct": True, "position": 1},
            {"text": "manzana", "is_correct": False, "position": 2},
            {"text": "pan", "is_correct": False, "position": 3},
        ],
        ["agua", "El caballo bebe agua"]
    )
    create_exercise(
        db, l3_1.id, 9, "select",
        "What is 'Un pájaro'?",
        "Un pájaro", None,
        [
            {"text": "A bird", "is_correct": True, "position": 1},
            {"text": "A duck", "is_correct": False, "position": 2},
            {"text": "A dog", "is_correct": False, "position": 3},
        ],
        ["A bird", "a bird"]
    )
    create_exercise(
        db, l3_1.id, 10, "type_answer",
        "Type 'The duck' in Spanish",
        "The duck", "duck_icon",
        [],
        ["el pato", "El pato"]
    )

    # Lesson 3.2: Plurals
    l3_2 = Lesson(skill_id=s3.id, position=2, title="Plurals & Groups")
    db.add(l3_2)
    db.flush()

    create_exercise(
        db, l3_2.id, 1, "select",
        "Select 'The children / The boys'",
        "The children", "kids_group",
        [
            {"text": "Los niños", "is_correct": True, "position": 1},
            {"text": "Las niñas", "is_correct": False, "position": 2},
            {"text": "El niño", "is_correct": False, "position": 3},
        ],
        ["Los niños", "los ninos"]
    )
    create_exercise(
        db, l3_2.id, 2, "translate",
        "Translate this sentence",
        "We are women", None,
        [
            {"text": "Nosotras", "is_correct": True, "position": 1},
            {"text": "somos", "is_correct": True, "position": 2},
            {"text": "mujeres", "is_correct": True, "position": 3},
            {"text": "ellos", "is_correct": False, "position": 4},
        ],
        ["Nosotras somos mujeres", "nosotras somos mujeres", "Nosotros somos mujeres"]
    )
    create_exercise(
        db, l3_2.id, 3, "match_pairs",
        "Match singular and plural pronouns",
        "Pronouns match", None,
        [
            {"text": "We", "pair_key": "p1", "side": "left", "position": 1},
            {"text": "They (m)", "pair_key": "p2", "side": "left", "position": 2},
            {"text": "They (f)", "pair_key": "p3", "side": "left", "position": 3},
            {"text": "You all", "pair_key": "p4", "side": "left", "position": 4},
            {"text": "The (plural m)", "pair_key": "p5", "side": "left", "position": 5},
            {"text": "Nosotros", "pair_key": "p1", "side": "right", "position": 1},
            {"text": "Ellos", "pair_key": "p2", "side": "right", "position": 2},
            {"text": "Ellas", "pair_key": "p3", "side": "right", "position": 3},
            {"text": "Ustedes", "pair_key": "p4", "side": "right", "position": 4},
            {"text": "Los", "pair_key": "p5", "side": "right", "position": 5},
        ],
        ["All matched"]
    )
    create_exercise(
        db, l3_2.id, 4, "fill_blank",
        "Complete the sentence",
        "Ellos ___ pan (They eat bread)", None,
        [
            {"text": "comen", "is_correct": True, "position": 1},
            {"text": "come", "is_correct": False, "position": 2},
            {"text": "comemos", "is_correct": False, "position": 3},
        ],
        ["comen", "Ellos comen pan"]
    )
    create_exercise(
        db, l3_2.id, 5, "type_answer",
        "Type 'The dogs' in Spanish",
        "The dogs", "dogs_pack",
        [],
        ["los perros", "Los perros"]
    )
    create_exercise(
        db, l3_2.id, 6, "select",
        "Select the translation for 'The women'",
        "The women", "women_group",
        [
            {"text": "Las mujeres", "is_correct": True, "position": 1},
            {"text": "Los hombres", "is_correct": False, "position": 2},
            {"text": "Las niñas", "is_correct": False, "position": 3},
        ],
        ["Las mujeres", "las mujeres"]
    )
    create_exercise(
        db, l3_2.id, 7, "translate",
        "Translate this sentence",
        "They drink water", None,
        [
            {"text": "Ellos", "is_correct": True, "position": 1},
            {"text": "beben", "is_correct": True, "position": 2},
            {"text": "agua", "is_correct": True, "position": 3},
            {"text": "bebe", "is_correct": False, "position": 4},
        ],
        ["Ellos beben agua", "Ellas beben agua", "ellos beben agua"]
    )
    create_exercise(
        db, l3_2.id, 8, "fill_blank",
        "Complete the sentence",
        "Nosotros ___ leche (We drink milk)", None,
        [
            {"text": "bebemos", "is_correct": True, "position": 1},
            {"text": "beben", "is_correct": False, "position": 2},
            {"text": "bebo", "is_correct": False, "position": 3},
        ],
        ["bebemos", "Nosotros bebemos leche"]
    )
    create_exercise(
        db, l3_2.id, 9, "select",
        "What does 'Las manzanas' mean?",
        "Las manzanas", None,
        [
            {"text": "The apples", "is_correct": True, "position": 1},
            {"text": "The breads", "is_correct": False, "position": 2},
            {"text": "The waters", "is_correct": False, "position": 3},
        ],
        ["The apples", "the apples"]
    )
    create_exercise(
        db, l3_2.id, 10, "type_answer",
        "Type 'The cats' in Spanish",
        "The cats", "cats_group",
        [],
        ["los gatos", "Los gatos"]
    )

    # Lesson 3.3: Everyday Actions
    l3_3 = Lesson(skill_id=s3.id, position=3, title="Everyday Actions")
    db.add(l3_3)
    db.flush()

    create_exercise(
        db, l3_3.id, 1, "select",
        "Select 'The girl reads a book'",
        "The girl reads a book", "reading_girl",
        [
            {"text": "La niña lee un libro", "is_correct": True, "position": 1},
            {"text": "El niño come pan", "is_correct": False, "position": 2},
            {"text": "Yo tengo un perro", "is_correct": False, "position": 3},
        ],
        ["La niña lee un libro", "la nina lee un libro"]
    )
    create_exercise(
        db, l3_3.id, 2, "translate",
        "Translate this sentence",
        "I have an apple", None,
        [
            {"text": "Yo", "is_correct": True, "position": 1},
            {"text": "tengo", "is_correct": True, "position": 2},
            {"text": "una", "is_correct": True, "position": 3},
            {"text": "manzana", "is_correct": True, "position": 4},
            {"text": "tienes", "is_correct": False, "position": 5},
        ],
        ["Yo tengo una manzana", "Tengo una manzana", "yo tengo una manzana"]
    )
    create_exercise(
        db, l3_3.id, 3, "match_pairs",
        "Match the verbs and nouns",
        "Action match", None,
        [
            {"text": "Book", "pair_key": "p1", "side": "left", "position": 1},
            {"text": "Letter", "pair_key": "p2", "side": "left", "position": 2},
            {"text": "Read", "pair_key": "p3", "side": "left", "position": 3},
            {"text": "Write", "pair_key": "p4", "side": "left", "position": 4},
            {"text": "Have", "pair_key": "p5", "side": "left", "position": 5},
            {"text": "Libro", "pair_key": "p1", "side": "right", "position": 1},
            {"text": "Carta", "pair_key": "p2", "side": "right", "position": 2},
            {"text": "Leer", "pair_key": "p3", "side": "right", "position": 3},
            {"text": "Escribir", "pair_key": "p4", "side": "right", "position": 4},
            {"text": "Tener", "pair_key": "p5", "side": "right", "position": 5},
        ],
        ["All matched"]
    )
    create_exercise(
        db, l3_3.id, 4, "fill_blank",
        "Complete the sentence",
        "Tú ___ una carta (You write a letter)", None,
        [
            {"text": "escribes", "is_correct": True, "position": 1},
            {"text": "escribo", "is_correct": False, "position": 2},
            {"text": "escribe", "is_correct": False, "position": 3},
        ],
        ["escribes", "Tú escribes una carta"]
    )
    create_exercise(
        db, l3_3.id, 5, "type_answer",
        "Type 'A book' in Spanish",
        "A book", "book_icon",
        [],
        ["un libro", "Un libro"]
    )
    create_exercise(
        db, l3_3.id, 6, "select",
        "Select the translation for 'We write'",
        "We write", "writing_hand",
        [
            {"text": "Nosotros escribimos", "is_correct": True, "position": 1},
            {"text": "Ellos escriben", "is_correct": False, "position": 2},
            {"text": "Yo escribo", "is_correct": False, "position": 3},
        ],
        ["Nosotros escribimos", "nosotros escribimos"]
    )
    create_exercise(
        db, l3_3.id, 7, "translate",
        "Translate this sentence",
        "They read newspapers", None,
        [
            {"text": "Ellos", "is_correct": True, "position": 1},
            {"text": "leen", "is_correct": True, "position": 2},
            {"text": "periódicos", "is_correct": True, "position": 3},
            {"text": "libros", "is_correct": False, "position": 4},
        ],
        ["Ellos leen periódicos", "Ellos leen periodicos", "ellos leen periodicos"]
    )
    create_exercise(
        db, l3_3.id, 8, "fill_blank",
        "Complete the sentence",
        "Yo ___ un perro (I have a dog)", None,
        [
            {"text": "tengo", "is_correct": True, "position": 1},
            {"text": "tienes", "is_correct": False, "position": 2},
            {"text": "tiene", "is_correct": False, "position": 3},
        ],
        ["tengo", "Yo tengo un perro"]
    )
    create_exercise(
        db, l3_3.id, 9, "select",
        "What does 'Tú tienes un gato' mean?",
        "Tú tienes un gato", None,
        [
            {"text": "You have a cat", "is_correct": True, "position": 1},
            {"text": "I have a cat", "is_correct": False, "position": 2},
            {"text": "He has a cat", "is_correct": False, "position": 3},
        ],
        ["You have a cat", "you have a cat"]
    )
    create_exercise(
        db, l3_3.id, 10, "type_answer",
        "Type 'A letter' in Spanish",
        "A letter", "envelope",
        [],
        ["una carta", "Una carta"]
    )

    # ----------------------------------------------------
    # SKILL 4: Common Phrases (3 Lessons x 10 Exercises = 30)
    # ----------------------------------------------------
    s4 = skills[3]

    # Lesson 4.1: Questions
    l4_1 = Lesson(skill_id=s4.id, position=1, title="Essential Questions")
    db.add(l4_1)
    db.flush()

    create_exercise(
        db, l4_1.id, 1, "select",
        "Select 'What is this?'",
        "What is this?", "question_mark",
        [
            {"text": "¿Qué es esto?", "is_correct": True, "position": 1},
            {"text": "¿Dónde está?", "is_correct": False, "position": 2},
            {"text": "¿Quién es?", "is_correct": False, "position": 3},
        ],
        ["¿Qué es esto?", "Que es esto", "que es esto?"]
    )
    create_exercise(
        db, l4_1.id, 2, "translate",
        "Translate this sentence",
        "Where is the hotel?", None,
        [
            {"text": "¿Dónde", "is_correct": True, "position": 1},
            {"text": "está", "is_correct": True, "position": 2},
            {"text": "el", "is_correct": True, "position": 3},
            {"text": "hotel?", "is_correct": True, "position": 4},
            {"text": "quién", "is_correct": False, "position": 5},
        ],
        ["¿Dónde está el hotel?", "Donde esta el hotel", "donde esta el hotel?"]
    )
    create_exercise(
        db, l4_1.id, 3, "match_pairs",
        "Match question words",
        "Questions match", None,
        [
            {"text": "What", "pair_key": "p1", "side": "left", "position": 1},
            {"text": "Where", "pair_key": "p2", "side": "left", "position": 2},
            {"text": "Who", "pair_key": "p3", "side": "left", "position": 3},
            {"text": "When", "pair_key": "p4", "side": "left", "position": 4},
            {"text": "Why", "pair_key": "p5", "side": "left", "position": 5},
            {"text": "Qué", "pair_key": "p1", "side": "right", "position": 1},
            {"text": "Dónde", "pair_key": "p2", "side": "right", "position": 2},
            {"text": "Quién", "pair_key": "p3", "side": "right", "position": 3},
            {"text": "Cuándo", "pair_key": "p4", "side": "right", "position": 4},
            {"text": "Por qué", "pair_key": "p5", "side": "right", "position": 5},
        ],
        ["All matched"]
    )
    create_exercise(
        db, l4_1.id, 4, "fill_blank",
        "Complete the question",
        "¿___ es ella? (Who is she?)", None,
        [
            {"text": "Quién", "is_correct": True, "position": 1},
            {"text": "Qué", "is_correct": False, "position": 2},
            {"text": "Dónde", "is_correct": False, "position": 3},
        ],
        ["Quién", "Quien", "¿Quién es ella?"]
    )
    create_exercise(
        db, l4_1.id, 5, "type_answer",
        "Type 'Where' in Spanish",
        "Where", "compass",
        [],
        ["dónde", "donde", "Dónde", "Donde"]
    )
    create_exercise(
        db, l4_1.id, 6, "select",
        "Select 'How much does it cost?'",
        "How much does it cost?", "price_tag",
        [
            {"text": "¿Cuánto cuesta?", "is_correct": True, "position": 1},
            {"text": "¿Cuándo es?", "is_correct": False, "position": 2},
            {"text": "¿Cómo estás?", "is_correct": False, "position": 3},
        ],
        ["¿Cuánto cuesta?", "Cuanto cuesta", "cuanto cuesta?"]
    )
    create_exercise(
        db, l4_1.id, 7, "translate",
        "Translate this sentence",
        "Why not?", None,
        [
            {"text": "¿Por", "is_correct": True, "position": 1},
            {"text": "qué", "is_correct": True, "position": 2},
            {"text": "no?", "is_correct": True, "position": 3},
            {"text": "sí", "is_correct": False, "position": 4},
        ],
        ["¿Por qué no?", "Por que no", "por que no?"]
    )
    create_exercise(
        db, l4_1.id, 8, "fill_blank",
        "Complete the question",
        "¿___ está el baño? (Where is the bathroom?)", None,
        [
            {"text": "Dónde", "is_correct": True, "position": 1},
            {"text": "Cómo", "is_correct": False, "position": 2},
            {"text": "Quién", "is_correct": False, "position": 3},
        ],
        ["Dónde", "Donde"]
    )
    create_exercise(
        db, l4_1.id, 9, "select",
        "What does '¿Cuándo?' mean?",
        "¿Cuándo?", None,
        [
            {"text": "When?", "is_correct": True, "position": 1},
            {"text": "Where?", "is_correct": False, "position": 2},
            {"text": "Who?", "is_correct": False, "position": 3},
        ],
        ["When?", "When", "when"]
    )
    create_exercise(
        db, l4_1.id, 10, "type_answer",
        "Type 'What' in Spanish",
        "What", "lightbulb",
        [],
        ["qué", "que", "Qué", "Que"]
    )

    # Lesson 4.2: Politeness & Requests
    l4_2 = Lesson(skill_id=s4.id, position=2, title="Requests & Help")
    db.add(l4_2)
    db.flush()

    create_exercise(
        db, l4_2.id, 1, "select",
        "Select 'Excuse me / Pardon'",
        "Excuse me", "polite_bow",
        [
            {"text": "Disculpe", "is_correct": True, "position": 1},
            {"text": "Hola", "is_correct": False, "position": 2},
            {"text": "De nada", "is_correct": False, "position": 3},
        ],
        ["Disculpe", "disculpe", "Perdón", "perdon"]
    )
    create_exercise(
        db, l4_2.id, 2, "translate",
        "Translate this sentence",
        "I need help", "help_sign",
        [
            {"text": "Necesito", "is_correct": True, "position": 1},
            {"text": "ayuda", "is_correct": True, "position": 2},
            {"text": "gracias", "is_correct": False, "position": 3},
            {"text": "agua", "is_correct": False, "position": 4},
        ],
        ["Necesito ayuda", "necesito ayuda"]
    )
    create_exercise(
        db, l4_2.id, 3, "match_pairs",
        "Match polite expressions",
        "Polite expressions match", None,
        [
            {"text": "Sorry", "pair_key": "p1", "side": "left", "position": 1},
            {"text": "Help", "pair_key": "p2", "side": "left", "position": 2},
            {"text": "Yes", "pair_key": "p3", "side": "left", "position": 3},
            {"text": "No", "pair_key": "p4", "side": "left", "position": 4},
            {"text": "Excuse me", "pair_key": "p5", "side": "left", "position": 5},
            {"text": "Lo siento", "pair_key": "p1", "side": "right", "position": 1},
            {"text": "Ayuda", "pair_key": "p2", "side": "right", "position": 2},
            {"text": "Sí", "pair_key": "p3", "side": "right", "position": 3},
            {"text": "No", "pair_key": "p4", "side": "right", "position": 4},
            {"text": "Perdón", "pair_key": "p5", "side": "right", "position": 5},
        ],
        ["All matched"]
    )
    create_exercise(
        db, l4_2.id, 4, "fill_blank",
        "Complete the sentence",
        "Lo ___, no sé (I am sorry, I don't know)", None,
        [
            {"text": "siento", "is_correct": True, "position": 1},
            {"text": "sé", "is_correct": False, "position": 2},
            {"text": "tengo", "is_correct": False, "position": 3},
        ],
        ["siento", "Lo siento"]
    )
    create_exercise(
        db, l4_2.id, 5, "type_answer",
        "Type 'Help' in Spanish",
        "Help", "lifesaver",
        [],
        ["ayuda", "Ayuda", "la ayuda"]
    )
    create_exercise(
        db, l4_2.id, 6, "select",
        "Select 'I am sorry'",
        "I am sorry", "apology_face",
        [
            {"text": "Lo siento", "is_correct": True, "position": 1},
            {"text": "Mucho gusto", "is_correct": False, "position": 2},
            {"text": "Buenos días", "is_correct": False, "position": 3},
        ],
        ["Lo siento", "lo siento"]
    )
    create_exercise(
        db, l4_2.id, 7, "translate",
        "Translate this sentence",
        "Yes, please", None,
        [
            {"text": "Sí,", "is_correct": True, "position": 1},
            {"text": "por", "is_correct": True, "position": 2},
            {"text": "favor", "is_correct": True, "position": 3},
            {"text": "no", "is_correct": False, "position": 4},
        ],
        ["Sí, por favor", "Si por favor", "si, por favor"]
    )
    create_exercise(
        db, l4_2.id, 8, "fill_blank",
        "Complete the sentence",
        "No, ___ (No, thanks)", None,
        [
            {"text": "gracias", "is_correct": True, "position": 1},
            {"text": "favor", "is_correct": False, "position": 2},
            {"text": "hola", "is_correct": False, "position": 3},
        ],
        ["gracias", "No gracias"]
    )
    create_exercise(
        db, l4_2.id, 9, "select",
        "What does 'Perdón' mean?",
        "Perdón", None,
        [
            {"text": "Pardon / Excuse me", "is_correct": True, "position": 1},
            {"text": "Thank you", "is_correct": False, "position": 2},
            {"text": "Good luck", "is_correct": False, "position": 3},
        ],
        ["Pardon / Excuse me", "Pardon", "Excuse me"]
    )
    create_exercise(
        db, l4_2.id, 10, "type_answer",
        "Type 'Yes' in Spanish",
        "Yes", "check_icon",
        [],
        ["sí", "si", "Sí", "Si"]
    )

    # Lesson 4.3: Speaking Spanish
    l4_3 = Lesson(skill_id=s4.id, position=3, title="Speaking Spanish")
    db.add(l4_3)
    db.flush()

    create_exercise(
        db, l4_3.id, 1, "select",
        "Select 'Do you speak English?'",
        "Do you speak English?", "language_chat",
        [
            {"text": "¿Hablas inglés?", "is_correct": True, "position": 1},
            {"text": "¿Hablas español?", "is_correct": False, "position": 2},
            {"text": "¿Comes pan?", "is_correct": False, "position": 3},
        ],
        ["¿Hablas inglés?", "Hablas ingles", "hablas ingles?"]
    )
    create_exercise(
        db, l4_3.id, 2, "translate",
        "Translate this sentence",
        "I speak a little Spanish", None,
        [
            {"text": "Hablo", "is_correct": True, "position": 1},
            {"text": "un", "is_correct": True, "position": 2},
            {"text": "poco", "is_correct": True, "position": 3},
            {"text": "de", "is_correct": True, "position": 4},
            {"text": "español", "is_correct": True, "position": 5},
            {"text": "inglés", "is_correct": False, "position": 6},
        ],
        ["Hablo un poco de español", "Hablo un poco de espanol", "hablo un poco de espanol"]
    )
    create_exercise(
        db, l4_3.id, 3, "match_pairs",
        "Match language words",
        "Language match", None,
        [
            {"text": "Spanish", "pair_key": "p1", "side": "left", "position": 1},
            {"text": "English", "pair_key": "p2", "side": "left", "position": 2},
            {"text": "Speak", "pair_key": "p3", "side": "left", "position": 3},
            {"text": "Little", "pair_key": "p4", "side": "left", "position": 4},
            {"text": "Understand", "pair_key": "p5", "side": "left", "position": 5},
            {"text": "Español", "pair_key": "p1", "side": "right", "position": 1},
            {"text": "Inglés", "pair_key": "p2", "side": "right", "position": 2},
            {"text": "Hablar", "pair_key": "p3", "side": "right", "position": 3},
            {"text": "Poco", "pair_key": "p4", "side": "right", "position": 4},
            {"text": "Entender", "pair_key": "p5", "side": "right", "position": 5},
        ],
        ["All matched"]
    )
    create_exercise(
        db, l4_3.id, 4, "fill_blank",
        "Complete the sentence",
        "Yo no ___ español (I don't speak Spanish)", None,
        [
            {"text": "hablo", "is_correct": True, "position": 1},
            {"text": "hablas", "is_correct": False, "position": 2},
            {"text": "habla", "is_correct": False, "position": 3},
        ],
        ["hablo", "Yo no hablo español"]
    )
    create_exercise(
        db, l4_3.id, 5, "type_answer",
        "Type 'Spanish' in Spanish",
        "Spanish", "flag_spain",
        [],
        ["español", "espanol", "Español", "Espanol"]
    )
    create_exercise(
        db, l4_3.id, 6, "select",
        "Select 'I don't understand'",
        "I don't understand", "confused_face",
        [
            {"text": "No entiendo", "is_correct": True, "position": 1},
            {"text": "No hablo", "is_correct": False, "position": 2},
            {"text": "No tengo", "is_correct": False, "position": 3},
        ],
        ["No entiendo", "no entiendo"]
    )
    create_exercise(
        db, l4_3.id, 7, "translate",
        "Translate this sentence",
        "Do you speak Spanish?", None,
        [
            {"text": "¿Hablas", "is_correct": True, "position": 1},
            {"text": "español?", "is_correct": True, "position": 2},
            {"text": "inglés", "is_correct": False, "position": 3},
            {"text": "bebes", "is_correct": False, "position": 4},
        ],
        ["¿Hablas español?", "¿Hablas espanol?", "Hablas español", "hablas espanol"]
    )
    create_exercise(
        db, l4_3.id, 8, "fill_blank",
        "Complete the sentence",
        "Hablo un ___ (I speak a little)", None,
        [
            {"text": "poco", "is_correct": True, "position": 1},
            {"text": "mucho", "is_correct": False, "position": 2},
            {"text": "nada", "is_correct": False, "position": 3},
        ],
        ["poco", "Hablo un poco"]
    )
    create_exercise(
        db, l4_3.id, 9, "select",
        "What does 'Inglés' mean?",
        "Inglés", None,
        [
            {"text": "English", "is_correct": True, "position": 1},
            {"text": "Spanish", "is_correct": False, "position": 2},
            {"text": "French", "is_correct": False, "position": 3},
        ],
        ["English", "english"]
    )
    create_exercise(
        db, l4_3.id, 10, "type_answer",
        "Type 'I speak' in Spanish",
        "I speak", "speaking_bubble",
        [],
        ["yo hablo", "hablo", "Yo hablo", "Hablo"]
    )

    return skills


def seed_programmatic_units(db: Session, course: Course) -> None:
    """Seeds Unit 2 (Food & Drinks) and Unit 3 (People & Family) with 4 skills each and 1 functional lesson each."""
    units_def = [
        {
            "position": 2,
            "title": "Unit 2: Food & Drinks",
            "description": "Order food in restaurants, shop at local markets, and prepare dishes",
            "color": "#CE82FF",
            "skills": [
                {"name": "Restaurant", "icon": "fork_knife", "topic": "restaurant"},
                {"name": "Breakfast", "icon": "coffee_cup", "topic": "breakfast"},
                {"name": "Market", "icon": "shopping_cart", "topic": "market"},
                {"name": "Cooking", "icon": "chef_hat", "topic": "cooking"},
            ],
        },
        {
            "position": 3,
            "title": "Unit 3: People & Family",
            "description": "Describe relatives, talk about professions, and chat with friends",
            "color": "#FF9600",
            "skills": [
                {"name": "Family", "icon": "family_tree", "topic": "family"},
                {"name": "Descriptions", "icon": "mirror", "topic": "descriptions"},
                {"name": "Friends", "icon": "party", "topic": "friends"},
                {"name": "Occupations", "icon": "briefcase", "topic": "occupations"},
            ],
        },
    ]

    for u_def in units_def:
        unit = Unit(
            course_id=course.id,
            position=u_def["position"],
            title=u_def["title"],
            description=u_def["description"],
            color=u_def["color"],
        )
        db.add(unit)
        db.flush()

        for s_pos, s_def in enumerate(u_def["skills"], start=1):
            skill = Skill(
                unit_id=unit.id,
                position=s_pos,
                name=s_def["name"],
                icon=s_def["icon"],
                lesson_count=3,
            )
            db.add(skill)
            db.flush()

            # Seed 1 functional lesson per skill
            lesson = Lesson(
                skill_id=skill.id,
                position=1,
                title=f"Basics of {s_def['name']}",
            )
            db.add(lesson)
            db.flush()

            # Populate 5 rich exercises covering all types for the lesson
            topic = s_def["topic"]
            if topic == "restaurant":
                create_exercise(
                    db, lesson.id, 1, "select",
                    "Select 'A table for two, please'",
                    "A table for two, please", "restaurant_table",
                    [
                        {"text": "Una mesa para dos, por favor", "is_correct": True, "position": 1},
                        {"text": "La cuenta, por favor", "is_correct": False, "position": 2},
                        {"text": "Un vaso de agua", "is_correct": False, "position": 3},
                    ],
                    ["Una mesa para dos, por favor", "una mesa para dos, por favor"]
                )
                create_exercise(
                    db, lesson.id, 2, "translate",
                    "Translate 'The menu, please'",
                    "The menu, please", "menu_card",
                    [
                        {"text": "El", "is_correct": True, "position": 1},
                        {"text": "menú,", "is_correct": True, "position": 2},
                        {"text": "por", "is_correct": True, "position": 3},
                        {"text": "favor", "is_correct": True, "position": 4},
                        {"text": "cuenta", "is_correct": False, "position": 5},
                    ],
                    ["El menú, por favor", "El menu, por favor", "el menu por favor"]
                )
                create_exercise(
                    db, lesson.id, 3, "match_pairs",
                    "Match restaurant words",
                    "Restaurant match", None,
                    [
                        {"text": "Table", "pair_key": "p1", "side": "left", "position": 1},
                        {"text": "Waiter", "pair_key": "p2", "side": "left", "position": 2},
                        {"text": "Bill/Check", "pair_key": "p3", "side": "left", "position": 3},
                        {"text": "Glass", "pair_key": "p4", "side": "left", "position": 4},
                        {"text": "Plate", "pair_key": "p5", "side": "left", "position": 5},
                        {"text": "Mesa", "pair_key": "p1", "side": "right", "position": 1},
                        {"text": "Camarero", "pair_key": "p2", "side": "right", "position": 2},
                        {"text": "Cuenta", "pair_key": "p3", "side": "right", "position": 3},
                        {"text": "Vaso", "pair_key": "p4", "side": "right", "position": 4},
                        {"text": "Plato", "pair_key": "p5", "side": "right", "position": 5},
                    ],
                    ["All matched"]
                )
                create_exercise(
                    db, lesson.id, 4, "fill_blank",
                    "Complete the sentence",
                    "La ___, por favor (The bill, please)", None,
                    [
                        {"text": "cuenta", "is_correct": True, "position": 1},
                        {"text": "mesa", "is_correct": False, "position": 2},
                        {"text": "carta", "is_correct": False, "position": 3},
                    ],
                    ["cuenta", "La cuenta"]
                )
                create_exercise(
                    db, lesson.id, 5, "type_answer",
                    "Type 'The table' in Spanish",
                    "The table", "table_icon",
                    [],
                    ["la mesa", "La mesa"]
                )

            elif topic == "breakfast":
                create_exercise(
                    db, lesson.id, 1, "select",
                    "Select 'I drink coffee with milk'",
                    "I drink coffee with milk", "latte_cup",
                    [
                        {"text": "Tomo café con leche", "is_correct": True, "position": 1},
                        {"text": "Como pan con queso", "is_correct": False, "position": 2},
                        {"text": "Bebo jugo de naranja", "is_correct": False, "position": 3},
                    ],
                    ["Tomo café con leche", "tomo cafe con leche", "Bebo café con leche"]
                )
                create_exercise(
                    db, lesson.id, 2, "translate",
                    "Translate 'Toast and butter'",
                    "Toast and butter", "toast_plate",
                    [
                        {"text": "Tostadas", "is_correct": True, "position": 1},
                        {"text": "y", "is_correct": True, "position": 2},
                        {"text": "mantequilla", "is_correct": True, "position": 3},
                        {"text": "café", "is_correct": False, "position": 4},
                    ],
                    ["Tostadas y mantequilla", "tostadas y mantequilla"]
                )
                create_exercise(
                    db, lesson.id, 3, "match_pairs",
                    "Match breakfast terms",
                    "Breakfast match", None,
                    [
                        {"text": "Coffee", "pair_key": "p1", "side": "left", "position": 1},
                        {"text": "Tea", "pair_key": "p2", "side": "left", "position": 2},
                        {"text": "Sugar", "pair_key": "p3", "side": "left", "position": 3},
                        {"text": "Eggs", "pair_key": "p4", "side": "left", "position": 4},
                        {"text": "Juice", "pair_key": "p5", "side": "left", "position": 5},
                        {"text": "Café", "pair_key": "p1", "side": "right", "position": 1},
                        {"text": "Té", "pair_key": "p2", "side": "right", "position": 2},
                        {"text": "Azúcar", "pair_key": "p3", "side": "right", "position": 3},
                        {"text": "Huevos", "pair_key": "p4", "side": "right", "position": 4},
                        {"text": "Jugo", "pair_key": "p5", "side": "right", "position": 5},
                    ],
                    ["All matched"]
                )
                create_exercise(
                    db, lesson.id, 4, "fill_blank",
                    "Complete the sentence",
                    "Un café con ___ (Coffee with sugar)", None,
                    [
                        {"text": "azúcar", "is_correct": True, "position": 1},
                        {"text": "sal", "is_correct": False, "position": 2},
                        {"text": "agua", "is_correct": False, "position": 3},
                    ],
                    ["azúcar", "azucar"]
                )
                create_exercise(
                    db, lesson.id, 5, "type_answer",
                    "Type 'Coffee' in Spanish",
                    "Coffee", "coffee_beans",
                    [],
                    ["café", "cafe", "Café", "Cafe", "el café"]
                )

            elif topic == "family":
                create_exercise(
                    db, lesson.id, 1, "select",
                    "Select 'My mother and my father'",
                    "My mother and my father", "parents_icon",
                    [
                        {"text": "Mi madre y mi padre", "is_correct": True, "position": 1},
                        {"text": "Mi hermano y mi hermana", "is_correct": False, "position": 2},
                        {"text": "Mi abuelo y mi abuela", "is_correct": False, "position": 3},
                    ],
                    ["Mi madre y mi padre", "mi madre y mi padre"]
                )
                create_exercise(
                    db, lesson.id, 2, "translate",
                    "Translate 'My sister is tall'",
                    "My sister is tall", "tall_woman",
                    [
                        {"text": "Mi", "is_correct": True, "position": 1},
                        {"text": "hermana", "is_correct": True, "position": 2},
                        {"text": "es", "is_correct": True, "position": 3},
                        {"text": "alta", "is_correct": True, "position": 4},
                        {"text": "bajo", "is_correct": False, "position": 5},
                    ],
                    ["Mi hermana es alta", "mi hermana es alta"]
                )
                create_exercise(
                    db, lesson.id, 3, "match_pairs",
                    "Match family members",
                    "Family match", None,
                    [
                        {"text": "Father", "pair_key": "p1", "side": "left", "position": 1},
                        {"text": "Mother", "pair_key": "p2", "side": "left", "position": 2},
                        {"text": "Brother", "pair_key": "p3", "side": "left", "position": 3},
                        {"text": "Sister", "pair_key": "p4", "side": "left", "position": 4},
                        {"text": "Grandmother", "pair_key": "p5", "side": "left", "position": 5},
                        {"text": "Padre", "pair_key": "p1", "side": "right", "position": 1},
                        {"text": "Madre", "pair_key": "p2", "side": "right", "position": 2},
                        {"text": "Hermano", "pair_key": "p3", "side": "right", "position": 3},
                        {"text": "Hermana", "pair_key": "p4", "side": "right", "position": 4},
                        {"text": "Abuela", "pair_key": "p5", "side": "right", "position": 5},
                    ],
                    ["All matched"]
                )
                create_exercise(
                    db, lesson.id, 4, "fill_blank",
                    "Complete the sentence",
                    "Mi ___ es simpático (My brother is nice)", None,
                    [
                        {"text": "hermano", "is_correct": True, "position": 1},
                        {"text": "hermana", "is_correct": False, "position": 2},
                        {"text": "madre", "is_correct": False, "position": 3},
                    ],
                    ["hermano", "Mi hermano"]
                )
                create_exercise(
                    db, lesson.id, 5, "type_answer",
                    "Type 'Mother' in Spanish",
                    "Mother", "mother_icon",
                    [],
                    ["madre", "Madre", "la madre", "mamá", "mama"]
                )

            else:
                # Generic fallback programmatic functional exercises for other skills
                create_exercise(
                    db, lesson.id, 1, "select",
                    f"Select the term related to {s_def['name']}",
                    f"Concept: {s_def['name']}", None,
                    [
                        {"text": f"Palabra de {s_def['name']}", "is_correct": True, "position": 1},
                        {"text": "Opción incorrecta A", "is_correct": False, "position": 2},
                        {"text": "Opción incorrecta B", "is_correct": False, "position": 3},
                    ],
                    [f"Palabra de {s_def['name']}", s_def["name"].lower()]
                )
                create_exercise(
                    db, lesson.id, 2, "translate",
                    f"Translate the phrase for {s_def['name']}",
                    f"Learning {s_def['name']}", None,
                    [
                        {"text": "Aprendiendo", "is_correct": True, "position": 1},
                        {"text": s_def["name"], "is_correct": True, "position": 2},
                        {"text": "fácil", "is_correct": False, "position": 3},
                    ],
                    [f"Aprendiendo {s_def['name']}", f"aprendiendo {s_def['name'].lower()}"]
                )
                create_exercise(
                    db, lesson.id, 3, "match_pairs",
                    f"Match terms in {s_def['name']}",
                    f"{s_def['name']} vocabulary", None,
                    [
                        {"text": "Concept 1", "pair_key": "p1", "side": "left", "position": 1},
                        {"text": "Concept 2", "pair_key": "p2", "side": "left", "position": 2},
                        {"text": "Concept 3", "pair_key": "p3", "side": "left", "position": 3},
                        {"text": "Concept 4", "pair_key": "p4", "side": "left", "position": 4},
                        {"text": "Concept 5", "pair_key": "p5", "side": "left", "position": 5},
                        {"text": "Concepto 1", "pair_key": "p1", "side": "right", "position": 1},
                        {"text": "Concepto 2", "pair_key": "p2", "side": "right", "position": 2},
                        {"text": "Concepto 3", "pair_key": "p3", "side": "right", "position": 3},
                        {"text": "Concepto 4", "pair_key": "p4", "side": "right", "position": 4},
                        {"text": "Concepto 5", "pair_key": "p5", "side": "right", "position": 5},
                    ],
                    ["All matched"]
                )
                create_exercise(
                    db, lesson.id, 4, "fill_blank",
                    f"Complete the sentence in {s_def['name']}",
                    "El ___ es importante", None,
                    [
                        {"text": "estudio", "is_correct": True, "position": 1},
                        {"text": "gato", "is_correct": False, "position": 2},
                        {"text": "pan", "is_correct": False, "position": 3},
                    ],
                    ["estudio"]
                )
                create_exercise(
                    db, lesson.id, 5, "type_answer",
                    f"Type 'Good' in Spanish",
                    "Good", "thumbs_up",
                    [],
                    ["bueno", "buena", "bien", "Bueno", "Bien"]
                )


def seed_users_and_gamification(db: Session, course: Course, unit1_skills: list[Skill], bronze_league: League) -> User:
    """Pre-seeds primary user 'niso' and 29 realistic league bots."""
    now_utc = datetime.now(timezone.utc)
    yesterday_str = AppClock.yesterday_local_str("Asia/Kolkata", 0)
    two_days_ago_str = (datetime.now(timezone.utc) - timedelta(days=2)).strftime("%Y-%m-%d")
    three_days_ago_str = (datetime.now(timezone.utc) - timedelta(days=3)).strftime("%Y-%m-%d")

    # 1. Primary User "niso"
    niso = User(
        username="niso",
        display_name="Niso",
        avatar="owl_hero",
        timezone="Asia/Kolkata",
        active_course_id=course.id,
        xp_total=140,
        streak_count=3,
        last_active_date=yesterday_str,
        hearts=4,
        hearts_updated_at=now_utc,
        gems=820,
        daily_goal_xp=20,
        simulated_day_offset=0,
        sound_enabled=True,
        dark_mode=False,
        is_seeded_bot=False,
    )
    db.add(niso)
    db.flush()

    # Pre-seed niso skill progress:
    # First 2 skills completed (3/3), 3rd skill 1/3 lessons completed
    db.add(
        UserSkillProgress(
            user_id=niso.id,
            skill_id=unit1_skills[0].id,  # Greetings
            lessons_completed=3,
            completed_at=now_utc - timedelta(days=2),
        )
    )
    db.add(
        UserSkillProgress(
            user_id=niso.id,
            skill_id=unit1_skills[1].id,  # Basics 1
            lessons_completed=3,
            completed_at=now_utc - timedelta(days=1),
        )
    )
    db.add(
        UserSkillProgress(
            user_id=niso.id,
            skill_id=unit1_skills[2].id,  # Basics 2
            lessons_completed=1,
            completed_at=None,
        )
    )
    db.add(
        UserSkillProgress(
            user_id=niso.id,
            skill_id=unit1_skills[3].id,  # Common Phrases
            lessons_completed=0,
            completed_at=None,
        )
    )

    # Pre-seed niso Daily XP records for the past 3 days (total 140 XP)
    db.add(DailyXP(user_id=niso.id, date=three_days_ago_str, xp=45))
    db.add(DailyXP(user_id=niso.id, date=two_days_ago_str, xp=50))
    db.add(DailyXP(user_id=niso.id, date=yesterday_str, xp=45))

    # Add niso to Bronze League with 140 weekly XP
    db.add(
        LeagueMember(
            league_id=bronze_league.id,
            user_id=niso.id,
            weekly_xp=140,
            reached_at=now_utc - timedelta(days=3),
        )
    )

    # 2. Seed 29 Bot Users for the Bronze League
    bot_names = [
        ("mateo_dev", "Mateo Silva", "avatar_boy_1", 520),
        ("sofia_lingo", "Sofía Chen", "avatar_girl_1", 490),
        ("lucas_poly", "Lucas Rossi", "avatar_boy_2", 465),
        ("elena_polyglot", "Elena Vance", "avatar_girl_2", 440),
        ("alex_lang", "Alex Rivera", "avatar_boy_3", 415),
        ("maria_g", "María García", "avatar_girl_3", 390),
        ("kenji_t", "Kenji Takahashi", "avatar_boy_4", 370),
        ("chloe_b", "Chloé Dubois", "avatar_girl_4", 350),
        ("diego_m", "Diego Morales", "avatar_boy_5", 330),
        ("ananya_s", "Ananya Sharma", "avatar_girl_5", 310),
        ("liam_k", "Liam O'Connor", "avatar_boy_6", 290),
        ("zara_a", "Zara Ahmed", "avatar_girl_6", 270),
        ("lars_n", "Lars Nielsen", "avatar_boy_7", 250),
        ("camila_r", "Camila Rodriguez", "avatar_girl_7", 230),
        ("hugo_f", "Hugo Fernandez", "avatar_boy_8", 210),
        ("isabella_m", "Isabella Moretti", "avatar_girl_8", 195),
        ("noah_w", "Noah Weber", "avatar_boy_9", 180),
        ("valeria_p", "Valeria Popov", "avatar_girl_9", 160),
        ("ethan_h", "Ethan Hunt", "avatar_boy_10", 150),
        # (niso sits around 140 XP here)
        ("julian_b", "Julian Bauer", "avatar_boy_11", 130),
        ("olivia_c", "Olivia Clarke", "avatar_girl_10", 120),
        ("gabriel_s", "Gabriel Santos", "avatar_boy_12", 110),
        ("mia_j", "Mia Jensen", "avatar_girl_11", 100),
        ("santiago_l", "Santiago Lopez", "avatar_boy_13", 90),
        ("freja_l", "Freja Lind", "avatar_girl_12", 80),
        ("marcus_a", "Marcus Aurel", "avatar_boy_14", 70),
        ("nora_k", "Nora Kowalski", "avatar_girl_13", 60),
        ("felix_z", "Felix Zimmerman", "avatar_boy_15", 50),
        ("lina_b", "Lina Benali", "avatar_girl_14", 40),
    ]

    for username, display_name, avatar, weekly_xp in bot_names:
        bot = User(
            username=username,
            display_name=display_name,
            avatar=avatar,
            timezone="UTC",
            active_course_id=course.id,
            xp_total=weekly_xp,
            streak_count=weekly_xp // 50 + 1,
            last_active_date=yesterday_str,
            hearts=5,
            hearts_updated_at=now_utc,
            gems=500,
            daily_goal_xp=20,
            simulated_day_offset=0,
            sound_enabled=True,
            dark_mode=False,
            is_seeded_bot=True,
        )
        db.add(bot)
        db.flush()

        # Add bot to Bronze league
        db.add(
            LeagueMember(
                league_id=bronze_league.id,
                user_id=bot.id,
                weekly_xp=weekly_xp,
                reached_at=now_utc - timedelta(days=2),
            )
        )

    db.flush()
    return niso


def seed_database() -> None:
    print("🌱 Starting Duolingo database seeding...")
    db = SessionLocal()
    try:
        clean_database(db)
        print("✅ Database tables cleared and recreated.")

        # 1. Seed Leagues
        leagues = seed_leagues(db)
        bronze_league = leagues[0]
        print(f"✅ Seeded {len(leagues)} competitive leagues.")

        # 2. Seed Spanish Course
        course = Course(
            code="es-en",
            name="Spanish",
            from_language="en",
            to_language="es",
            flag="🇪🇸",
        )
        db.add(course)
        db.flush()
        print(f"✅ Seeded Course: {course.name} ({course.code})")

        # 3. Seed Unit 1: Basics
        unit1 = Unit(
            course_id=course.id,
            position=1,
            title="Unit 1: Basics",
            description="Get started with fundamental Spanish greetings, basic words, phrases, and grammar.",
            color="#58CC02",
        )
        db.add(unit1)
        db.flush()

        unit1_skills = seed_unit1_basics(db, unit1)
        print(f"✅ Seeded Unit 1 with {len(unit1_skills)} fully populated skills (120 exercises).")

        # 4. Seed Unit 2 & 3 Programmatically
        seed_programmatic_units(db, course)
        print("✅ Seeded Unit 2 & Unit 3 with 4 skills each and functional lessons.")

        # 5. Seed Primary User 'niso' and 29 Bots
        niso = seed_users_and_gamification(db, course, unit1_skills, bronze_league)
        print(f"✅ Pre-seeded user '{niso.username}' (id={niso.id}) with progress and streak.")
        print("✅ Pre-seeded 29 bot users in the Bronze league (total 30 league members).")

        db.commit()
        print("🎉 Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error during seeding: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
