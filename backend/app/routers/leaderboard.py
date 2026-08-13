from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import LeaderboardUser
from ..schemas import LeaderboardUserSchema

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

@router.get("", response_model=List[LeaderboardUserSchema])
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(LeaderboardUser).order_by(LeaderboardUser.weekly_xp.desc()).all()
    return users
