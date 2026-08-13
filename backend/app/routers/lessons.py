import json
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Lesson, Exercise, UserProgress, User, Skill, LeaderboardUser, UserAchievement, Achievement
from ..schemas import LessonSchema, ExerciseSchema, ExerciseCheckRequest, ExerciseCheckResponse, LessonCompletionRequest
from .user import get_current_user

router = APIRouter(prefix="/api", tags=["lessons"])

@router.get("/lessons/{lesson_id}", response_model=LessonSchema)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    exercises = db.query(Exercise).filter(Exercise.lesson_id == lesson_id).order_by(Exercise.order).all()
    ex_schemas = []
    for ex in exercises:
        parsed_options = json.loads(ex.options_json) if ex.options_json else []
        parsed_correct = json.loads(ex.correct_answer_json) if ex.correct_answer_json else None
        ex_schemas.append(ExerciseSchema(
            id=ex.id,
            lesson_id=ex.lesson_id,
            order=ex.order,
            type=ex.type,
            prompt=ex.prompt,
            question=ex.question,
            audio_text=ex.audio_text,
            options=parsed_options,
            correct_answer=parsed_correct,
            explanation=ex.explanation
        ))

    return LessonSchema(
        id=lesson.id,
        skill_id=lesson.skill_id,
        order=lesson.order,
        title=lesson.title,
        xp_reward=lesson.xp_reward,
        exercises=ex_schemas
    )

@router.post("/exercises/check", response_model=ExerciseCheckResponse)
def check_exercise(req: ExerciseCheckRequest, db: Session = Depends(get_db)):
    ex = db.query(Exercise).filter(Exercise.id == req.exercise_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")

    correct_ans = json.loads(ex.correct_answer_json) if ex.correct_answer_json else None
    user_ans = req.user_answer

    is_correct = False
    if ex.type in ["MULTIPLE_CHOICE", "FILL_BLANK"]:
        if isinstance(user_ans, str) and isinstance(correct_ans, str):
            is_correct = user_ans.strip().lower() == correct_ans.strip().lower()
        else:
            is_correct = user_ans == correct_ans

    elif ex.type == "TRANSLATE_TAP":
        if isinstance(user_ans, list) and isinstance(correct_ans, list):
            # Normalize array of words
            u_clean = " ".join([str(w).strip().lower() for w in user_ans])
            c_clean = " ".join([str(w).strip().lower() for w in correct_ans])
            is_correct = u_clean == c_clean

    elif ex.type == "TRANSLATE_TYPE":
        if isinstance(user_ans, str):
            user_clean = user_ans.strip().lower().replace("¡", "").replace("!", "").replace(".", "").replace(",", "")
            if isinstance(correct_ans, list):
                correct_cleans = [str(c).strip().lower().replace("¡", "").replace("!", "").replace(".", "").replace(",", "") for c in correct_ans]
                is_correct = user_clean in correct_cleans
            else:
                c_clean = str(correct_ans).strip().lower().replace("¡", "").replace("!", "").replace(".", "").replace(",", "")
                is_correct = user_clean == c_clean

    elif ex.type == "MATCH_PAIRS":
        # Check if all pair mappings match
        if isinstance(user_ans, list) and isinstance(correct_ans, list):
            is_correct = len(user_ans) == len(correct_ans)

    return ExerciseCheckResponse(
        is_correct=is_correct,
        correct_answer=correct_ans,
        explanation=ex.explanation
    )

@router.post("/lessons/{lesson_id}/complete")
def complete_lesson(lesson_id: int, req: LessonCompletionRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    skill = db.query(Skill).filter(Skill.id == lesson.skill_id).first()

    # Update User XP and Gems
    xp_gained = req.xp_earned or lesson.xp_reward
    user.xp += xp_gained
    user.gems += 10 # Reward gems on lesson finish

    # Update User Streak
    today_str = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    yesterday_str = (datetime.datetime.utcnow() - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    if user.last_active_date != today_str:
        if user.last_active_date == yesterday_str or user.streak == 0:
            user.streak += 1
        user.last_active_date = today_str

    # Update Leaderboard User entry
    lb_user = db.query(LeaderboardUser).filter(LeaderboardUser.is_current_user == True).first()
    if lb_user:
        lb_user.weekly_xp += xp_gained

    # Update User Progress for this Skill
    prog = db.query(UserProgress).filter(UserProgress.user_id == user.id, UserProgress.skill_id == skill.id).first()
    if not prog:
        prog = UserProgress(user_id=user.id, skill_id=skill.id, lessons_completed=1, is_unlocked=True)
        db.add(prog)
    else:
        prog.lessons_completed += 1

    if skill and prog.lessons_completed >= skill.total_lessons:
        prog.is_completed = True
        prog.crown_level += 1

        # Unlock next skill in unit/course!
        next_skill = db.query(Skill).filter(Skill.unit_id == skill.unit_id, Skill.order == skill.order + 1).first()
        if not next_skill:
            # Check next unit
            next_unit_skills = db.query(Skill).filter(Skill.unit_id > skill.unit_id).order_by(Skill.unit_id, Skill.order).all()
            if next_unit_skills:
                next_skill = next_unit_skills[0]

        if next_skill:
            next_prog = db.query(UserProgress).filter(UserProgress.user_id == user.id, UserProgress.skill_id == next_skill.id).first()
            if not next_prog:
                next_prog = UserProgress(user_id=user.id, skill_id=next_skill.id, lessons_completed=0, is_unlocked=True)
                db.add(next_prog)
            else:
                next_prog.is_unlocked = True

    # Update Achievements
    # Sage (XP)
    sage_ach = db.query(Achievement).filter(Achievement.code == "SAGE").first()
    if sage_ach:
        u_sage = db.query(UserAchievement).filter(UserAchievement.user_id == user.id, UserAchievement.achievement_id == sage_ach.id).first()
        if u_sage:
            u_sage.current_progress = user.xp
            if u_sage.current_progress >= sage_ach.max_progress:
                u_sage.is_unlocked = True

    # Scholar (Lessons completed)
    scholar_ach = db.query(Achievement).filter(Achievement.code == "SCHOLAR").first()
    if scholar_ach:
        u_sch = db.query(UserAchievement).filter(UserAchievement.user_id == user.id, UserAchievement.achievement_id == scholar_ach.id).first()
        if u_sch:
            u_sch.current_progress += 1
            if u_sch.current_progress >= scholar_ach.max_progress:
                u_sch.is_unlocked = True

    # Sharpshooter (100% accuracy)
    if req.accuracy >= 1.0:
        sharp_ach = db.query(Achievement).filter(Achievement.code == "SHARPSHOOTER").first()
        if sharp_ach:
            u_sharp = db.query(UserAchievement).filter(UserAchievement.user_id == user.id, UserAchievement.achievement_id == sharp_ach.id).first()
            if u_sharp:
                u_sharp.current_progress = 1
                u_sharp.is_unlocked = True

    db.commit()

    return {
        "success": True,
        "xp_earned": xp_gained,
        "new_total_xp": user.xp,
        "streak": user.streak,
        "gems": user.gems,
        "skill_completed": prog.is_completed if prog else False
    }

@router.post("/user/hearts/decrement")
def decrement_heart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.hearts > 0:
        user.hearts -= 1
        db.commit()
        db.refresh(user)
    return {"hearts": user.hearts}
