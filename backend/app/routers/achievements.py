from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Achievement, UserAchievement, User
from ..schemas import AchievementSchema
from .user import get_current_user

router = APIRouter(prefix="/api/achievements", tags=["achievements"])

@router.get("", response_model=List[AchievementSchema])
def get_achievements(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    achievements = db.query(Achievement).all()
    user_ach_map = {
        ua.achievement_id: ua for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user.id).all()
    }

    results = []
    for ach in achievements:
        ua = user_ach_map.get(ach.id)
        prog = ua.current_progress if ua else 0
        unlocked = ua.is_unlocked if ua else False

        results.append(AchievementSchema(
            id=ach.id,
            code=ach.code,
            title=ach.title,
            description=ach.description,
            icon=ach.icon,
            max_progress=ach.max_progress,
            current_progress=prog,
            is_unlocked=unlocked
        ))

    return results
