from typing import List, Dict, Any
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from app.models.course import Course, Unit, Skill, Lesson
from app.models.user import User, UserSkillProgress


class ProgressService:
    @staticmethod
    def get_user_path(db: Session, user: User) -> Dict[str, Any]:
        """
        Builds the complete curriculum path for the user's active course with dynamically
        computed skill states: 'completed', 'active', or 'locked', and ring progress values.
        """
        course_id = user.active_course_id or 1
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
            return {"units": []}

        # Fetch all progress for user
        prog_stmt = select(UserSkillProgress).where(UserSkillProgress.user_id == user.id)
        user_progress = {p.skill_id: p for p in db.scalars(prog_stmt).all()}

        units_output = []
        found_active_skill = False

        # Sort units and skills deterministically
        sorted_units = sorted(course.units, key=lambda u: u.position)

        for unit in sorted_units:
            skills_output = []
            sorted_skills = sorted(unit.skills, key=lambda s: s.position)

            for skill in sorted_skills:
                prog = user_progress.get(skill.id)
                lessons_completed = prog.lessons_completed if prog else 0
                lesson_count = skill.lesson_count or max(1, len(skill.lessons))

                # Ring progress (0.0 to 1.0 and 0% to 100%)
                ratio = min(1.0, max(0.0, lessons_completed / lesson_count))
                progress_percentage = int(round(ratio * 100))

                # Status derivation
                if lessons_completed >= lesson_count:
                    status = "completed"
                elif not found_active_skill:
                    status = "active"
                    found_active_skill = True
                else:
                    status = "locked"

                skills_output.append({
                    "id": skill.id,
                    "unit_id": skill.unit_id,
                    "position": skill.position,
                    "name": skill.name,
                    "icon": skill.icon,
                    "lesson_count": lesson_count,
                    "lessons_completed": lessons_completed,
                    "progress_percentage": progress_percentage,
                    "progress_ratio": ratio,
                    "status": status,
                    "lessons": [
                        {
                            "id": l.id,
                            "skill_id": l.skill_id,
                            "position": l.position,
                            "title": l.title,
                            "is_completed": l.position <= lessons_completed,
                        }
                        for l in sorted(skill.lessons, key=lambda l: l.position)
                    ],
                })

            units_output.append({
                "id": unit.id,
                "course_id": unit.course_id,
                "position": unit.position,
                "title": unit.title,
                "description": unit.description,
                "color": unit.color,
                "skills": skills_output,
            })

        return {
            "course": {
                "id": course.id,
                "code": course.code,
                "name": course.name,
                "flag": course.flag,
            },
            "units": units_output,
        }
