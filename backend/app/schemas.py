from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

class UserBase(BaseModel):
    username: str
    name: str
    email: str
    avatar_url: str

class UserSchema(UserBase):
    id: int
    streak: int
    last_active_date: str
    xp: int
    gems: int
    hearts: int
    max_hearts: int
    current_language_id: Optional[int] = None

    class Config:
        from_attributes = True

class ExerciseSchema(BaseModel):
    id: int
    lesson_id: int
    order: int
    type: str
    prompt: str
    question: str
    audio_text: Optional[str] = None
    options: Any # parsed JSON
    correct_answer: Any # parsed JSON
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

class LessonSchema(BaseModel):
    id: int
    skill_id: int
    order: int
    title: str
    xp_reward: int
    exercises: List[ExerciseSchema] = []

    class Config:
        from_attributes = True

class SkillSchema(BaseModel):
    id: int
    unit_id: int
    order: int
    title: str
    description: str
    icon: str
    total_lessons: int
    lessons_completed: int = 0
    is_completed: bool = False
    is_unlocked: bool = False
    crown_level: int = 0
    is_legendary: bool = False

    class Config:
        from_attributes = True

class UnitSchema(BaseModel):
    id: int
    language_id: int
    order: int
    title: str
    description: str
    color_hex: str
    skills: List[SkillSchema] = []

    class Config:
        from_attributes = True

class LanguageSchema(BaseModel):
    id: int
    code: str
    name: str
    flag_icon: str
    description: str

    class Config:
        from_attributes = True

class LessonCompletionRequest(BaseModel):
    xp_earned: int
    accuracy: float
    mistakes_count: int

class ExerciseCheckRequest(BaseModel):
    exercise_id: int
    user_answer: Any

class ExerciseCheckResponse(BaseModel):
    is_correct: bool
    correct_answer: Any
    explanation: Optional[str] = None

class HeartRefillResponse(BaseModel):
    success: bool
    message: str
    hearts: int
    gems: int

class LeaderboardUserSchema(BaseModel):
    id: int
    name: str
    avatar_url: str
    weekly_xp: int
    league: str
    is_current_user: bool

    class Config:
        from_attributes = True

class AchievementSchema(BaseModel):
    id: int
    code: str
    title: str
    description: str
    icon: str
    max_progress: int
    current_progress: int = 0
    is_unlocked: bool = False

    class Config:
        from_attributes = True
