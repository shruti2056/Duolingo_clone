from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Language, Unit, Skill, UserProgress, User, Lesson
from ..schemas import UnitSchema, SkillSchema
from .user import get_current_user

router = APIRouter(prefix="/api/courses", tags=["courses"])

@router.get("/current")
def get_current_course_path(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    lang_id = user.current_language_id
    if not lang_id:
        lang = db.query(Language).first()
        lang_id = lang.id if lang else 1

    units = db.query(Unit).filter(Unit.language_id == lang_id).order_by(Unit.order).all()
    user_progress_map = {
        p.skill_id: p for p in db.query(UserProgress).filter(UserProgress.user_id == user.id).all()
    }

    result_units = []
    for u in units:
        skills = db.query(Skill).filter(Skill.unit_id == u.id).order_by(Skill.order).all()
        skill_schemas = []
        for s in skills:
            prog = user_progress_map.get(s.id)
            lessons_comp = prog.lessons_completed if prog else 0
            is_comp = prog.is_completed if prog else False
            is_unlocked = prog.is_unlocked if prog else False
            crown_lvl = prog.crown_level if prog else 0
            is_leg = prog.is_legendary if prog else False

            skill_schemas.append(SkillSchema(
                id=s.id,
                unit_id=s.unit_id,
                order=s.order,
                title=s.title,
                description=s.description,
                icon=s.icon,
                total_lessons=s.total_lessons,
                lessons_completed=lessons_comp,
                is_completed=is_comp,
                is_unlocked=is_unlocked,
                crown_level=crown_lvl,
                is_legendary=is_leg
            ))

        result_units.append({
            "id": u.id,
            "language_id": u.language_id,
            "order": u.order,
            "title": u.title,
            "description": u.description,
            "color_hex": u.color_hex,
            "skills": skill_schemas
        })

    return {
        "language_id": lang_id,
        "units": result_units
    }

@router.get("/skill/{skill_id}/next-lesson")
def get_next_lesson(skill_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    lessons = db.query(Lesson).filter(Lesson.skill_id == skill_id).order_by(Lesson.order).all()
    if not lessons:
        raise HTTPException(status_code=404, detail="No lessons found for this skill")
    prog = db.query(UserProgress).filter(UserProgress.user_id == user.id, UserProgress.skill_id == skill_id).first()
    index = min(prog.lessons_completed if prog else 0, len(lessons)-1)
    return {"lesson_id": lessons[index].id}
