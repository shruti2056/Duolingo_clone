from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    name = Column(String)
    email = Column(String)
    password_hash = Column(String, nullable=True)
    avatar_url = Column(String)
    streak = Column(Integer, default=1)
    last_active_date = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    xp = Column(Integer, default=0)
    gems = Column(Integer, default=500)
    hearts = Column(Integer, default=5)
    max_hearts = Column(Integer, default=5)
    hearts_last_refilled_at = Column(DateTime, default=datetime.utcnow)
    current_language_id = Column(Integer, ForeignKey("languages.id"), nullable=True)

    language = relationship("Language")

class Language(Base):
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True) # e.g. 'es'
    name = Column(String) # e.g. 'Spanish'
    flag_icon = Column(String) # e.g. '🇪🇸'
    description = Column(String)

    units = relationship("Unit", back_populates="language", cascade="all, delete-orphan")

class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    language_id = Column(Integer, ForeignKey("languages.id"))
    order = Column(Integer, index=True)
    title = Column(String)
    description = Column(String)
    color_hex = Column(String, default="#58cc02")

    language = relationship("Language", back_populates="units")
    skills = relationship("Skill", back_populates="unit", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"))
    order = Column(Integer, index=True)
    title = Column(String)
    description = Column(String)
    icon = Column(String) # e.g. 'book', 'coffee', 'plane', 'message-circle'
    total_lessons = Column(Integer, default=3)

    unit = relationship("Unit", back_populates="skills")
    lessons = relationship("Lesson", back_populates="skill", cascade="all, delete-orphan")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"))
    order = Column(Integer, index=True)
    title = Column(String)
    xp_reward = Column(Integer, default=15)

    skill = relationship("Skill", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson", cascade="all, delete-orphan")

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    order = Column(Integer, index=True)
    type = Column(String) # MULTIPLE_CHOICE, TRANSLATE_TAP, TRANSLATE_TYPE, MATCH_PAIRS, FILL_BLANK
    prompt = Column(String)
    question = Column(String)
    audio_text = Column(String, nullable=True)
    options_json = Column(Text) # JSON serialized array/dict of choices
    correct_answer_json = Column(Text) # JSON serialized correct answer
    explanation = Column(String, nullable=True)

    lesson = relationship("Lesson", back_populates="exercises")

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    lessons_completed = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    is_unlocked = Column(Boolean, default=False)
    crown_level = Column(Integer, default=0)
    is_legendary = Column(Boolean, default=False)

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    title = Column(String)
    description = Column(String)
    icon = Column(String)
    max_progress = Column(Integer)

class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    current_progress = Column(Integer, default=0)
    is_unlocked = Column(Boolean, default=False)
    unlocked_at = Column(DateTime, nullable=True)

class LeaderboardUser(Base):
    __tablename__ = "leaderboard_users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    avatar_url = Column(String)
    weekly_xp = Column(Integer)
    league = Column(String, default="Bronze")
    is_current_user = Column(Boolean, default=False)
