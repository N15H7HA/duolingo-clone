from typing import List, Optional
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from app.models.course import Course, Unit, Skill, Lesson, Exercise
from app.models.user import UserSkillProgress
from app.schemas.course import CourseTreeResponse, UnitTreeResponse, SkillTreeResponse


class CourseService:
    @staticmethod
    def get_all_courses(db: Session) -> List[Course]:
        stmt = select(Course).order_by(Course.id)
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_course_by_id(db: Session, course_id: int) -> Optional[Course]:
        stmt = select(Course).where(Course.id == course_id)
        return db.scalar(stmt)

    @staticmethod
    def get_course_tree(db: Session, course_id: int, user_id: Optional[int] = None) -> Optional[CourseTreeResponse]:
        stmt = (
            select(Course)
            .where(Course.id == course_id)
            .options(
                selectinload(Course.units)
                .selectinload(Unit.skills)
                .selectinload(Skill.lessons)
            )
        )
        course = db.scalar(stmt)
        if not course:
            return None

        # Fetch user progress if user_id is provided
        user_progress_map = {}
        if user_id:
            prog_stmt = select(UserSkillProgress).where(UserSkillProgress.user_id == user_id)
            progress_records = db.scalars(prog_stmt).all()
            for prog in progress_records:
                user_progress_map[prog.skill_id] = prog

        units_tree: List[UnitTreeResponse] = []
        is_previous_skill_completed = True  # First skill is always unlocked

        for unit in sorted(course.units, key=lambda u: u.position):
            skills_tree: List[SkillTreeResponse] = []
            for skill in sorted(unit.skills, key=lambda s: s.position):
                prog = user_progress_map.get(skill.id)
                lessons_completed = prog.lessons_completed if prog else 0
                is_completed = lessons_completed >= skill.lesson_count
                is_unlocked = is_previous_skill_completed

                skills_tree.append(
                    SkillTreeResponse(
                        id=skill.id,
                        unit_id=skill.unit_id,
                        position=skill.position,
                        name=skill.name,
                        icon=skill.icon,
                        lesson_count=skill.lesson_count,
                        lessons=[
                            {
                                "id": l.id,
                                "skill_id": l.skill_id,
                                "position": l.position,
                                "title": l.title,
                            }
                            for l in sorted(skill.lessons, key=lambda l: l.position)
                        ],
                        lessons_completed=lessons_completed,
                        is_completed=is_completed,
                        is_unlocked=is_unlocked,
                    )
                )
                # Next skill in tree requires this skill to be completed
                is_previous_skill_completed = is_completed

            units_tree.append(
                UnitTreeResponse(
                    id=unit.id,
                    course_id=unit.course_id,
                    position=unit.position,
                    title=unit.title,
                    description=unit.description,
                    color=unit.color,
                    skills=skills_tree,
                )
            )

        return CourseTreeResponse(
            id=course.id,
            code=course.code,
            name=course.name,
            from_language=course.from_language,
            to_language=course.to_language,
            flag=course.flag,
            units=units_tree,
        )

    @staticmethod
    def get_lesson_with_exercises(db: Session, lesson_id: int) -> Optional[Lesson]:
        stmt = (
            select(Lesson)
            .where(Lesson.id == lesson_id)
            .options(
                selectinload(Lesson.exercises).selectinload(Exercise.options),
                selectinload(Lesson.exercises).selectinload(Exercise.answers),
            )
        )
        return db.scalar(stmt)
