import json
from sqlalchemy.orm import Session
from sqlalchemy import text
import os, hashlib
from .database import engine, Base, SessionLocal
from .models import (
    User, Language, Unit, Skill, Lesson, Exercise,
    UserProgress, Achievement, UserAchievement, LeaderboardUser
)

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        # 1. Seed Spanish Language
        spanish = Language(
            code="es",
            name="Spanish",
            flag_icon="🇪🇸",
            description="Master everyday Spanish conversations with Duo!"
        )
        db.add(spanish)
        db.flush()

        # 2. Seed Default User
        user = User(
            username="learner",
            name="Duo Learner",
            email="learner@duolingo.clone",
            avatar_url="https://api.dicebear.com/7.x/bottts/svg?seed=duo",
            streak=3,
            xp=120,
            gems=450,
            hearts=5,
            max_hearts=5,
            current_language_id=spanish.id,
            password_hash=_hash_password("learner123")
        )
        db.add(user)
        db.flush()

        # 3. Seed Units & Skills
        unit1 = Unit(
            language_id=spanish.id,
            order=1,
            title="Unit 1: Form basic sentences",
            description="Order coffee, greet friends, and make simple statements",
            color_hex="#58cc02"
        )
        unit2 = Unit(
            language_id=spanish.id,
            order=2,
            title="Unit 2: Express greetings & family",
            description="Describe family members, daily activities, and places",
            color_hex="#1cb0f6"
        )
        unit3 = Unit(
            language_id=spanish.id,
            order=3,
            title="Unit 3: Shopping & Places",
            description="Ask for prices, describe city spots, and buy items",
            color_hex="#ff9600"
        )
        db.add_all([unit1, unit2, unit3])
        db.flush()

        # Skills for Unit 1
        skill1 = Skill(unit_id=unit1.id, order=1, title="Basics 1", description="Essential words & pronouns", icon="book", total_lessons=3)
        skill2 = Skill(unit_id=unit1.id, order=2, title="Phrases", description="Common Spanish greetings", icon="coffee", total_lessons=3)
        skill3 = Skill(unit_id=unit1.id, order=3, title="Food", description="Order drinks & food", icon="utensils", total_lessons=3)

        # Skills for Unit 2
        skill4 = Skill(unit_id=unit2.id, order=1, title="Greetings", description="Introduce yourself & others", icon="message-circle", total_lessons=3)
        skill5 = Skill(unit_id=unit2.id, order=2, title="Family", description="Talk about your relatives", icon="users", total_lessons=3)

        # Skills for Unit 3
        skill6 = Skill(unit_id=unit3.id, order=1, title="Shopping", description="Prices and stores", icon="shopping-bag", total_lessons=3)

        db.add_all([skill1, skill2, skill3, skill4, skill5, skill6])
        db.flush()

        # 4. Seed Lessons & Exercises

        # --- Skill 1: Basics 1 ---
        # Lesson 1.1
        l1_1 = Lesson(skill_id=skill1.id, order=1, title="Lesson 1 of 3", xp_reward=15)
        db.add(l1_1)
        db.flush()

        ex1 = Exercise(
            lesson_id=l1_1.id,
            order=1,
            type="TRANSLATE_TAP",
            prompt="Translate this sentence",
            question="Hola, soy un hombre.",
            audio_text="Hola, soy un hombre.",
            options_json=json.dumps(["Hello", "I", "am", "a", "man", "woman", "boy", "girl"]),
            correct_answer_json=json.dumps(["Hello", "I", "am", "a", "man"]),
            explanation="'Hola' means 'Hello', 'soy' means 'I am', and 'un hombre' means 'a man'."
        )
        ex2 = Exercise(
            lesson_id=l1_1.id,
            order=2,
            type="MULTIPLE_CHOICE",
            prompt="Which of these is 'the boy'?",
            question="the boy",
            audio_text="el niño",
            options_json=json.dumps([
                {"text": "El niño", "subtext": "the boy", "icon": "boy"},
                {"text": "La niña", "subtext": "the girl", "icon": "girl"},
                {"text": "El hombre", "subtext": "the man", "icon": "man"}
            ]),
            correct_answer_json=json.dumps("El niño"),
            explanation="'El niño' translates to 'the boy'."
        )
        ex3 = Exercise(
            lesson_id=l1_1.id,
            order=3,
            type="MATCH_PAIRS",
            prompt="Tap the matching pairs",
            question="Match the Spanish and English words",
            options_json=json.dumps([
                {"spanish": "hombre", "english": "man"},
                {"spanish": "mujer", "english": "woman"},
                {"spanish": "niño", "english": "boy"},
                {"spanish": "niña", "english": "girl"}
            ]),
            correct_answer_json=json.dumps([
                {"spanish": "hombre", "english": "man"},
                {"spanish": "mujer", "english": "woman"},
                {"spanish": "niño", "english": "boy"},
                {"spanish": "niña", "english": "girl"}
            ]),
            explanation="Great job matching all pairs!"
        )
        ex4 = Exercise(
            lesson_id=l1_1.id,
            order=4,
            type="FILL_BLANK",
            prompt="Complete the sentence",
            question="Yo ___ una mujer.",
            audio_text="Yo soy una mujer.",
            options_json=json.dumps(["soy", "eres", "es"]),
            correct_answer_json=json.dumps("soy"),
            explanation="'Yo soy' is used for 'I am'."
        )
        ex5 = Exercise(
            lesson_id=l1_1.id,
            order=5,
            type="TRANSLATE_TYPE",
            prompt="Write this in Spanish",
            question="I am a girl.",
            audio_text="Yo soy una niña.",
            options_json=json.dumps([]),
            correct_answer_json=json.dumps(["Yo soy una niña", "Soy una niña", "Yo soy una nina"]),
            explanation="Both 'Yo soy una niña' and 'Soy una niña' are correct."
        )
        db.add_all([ex1, ex2, ex3, ex4, ex5])

        # Lesson 1.2
        l1_2 = Lesson(skill_id=skill1.id, order=2, title="Lesson 2 of 3", xp_reward=15)
        db.add(l1_2)
        db.flush()

        l1_2_e1 = Exercise(
            lesson_id=l1_2.id, order=1, type="TRANSLATE_TAP",
            prompt="Translate this sentence", question="Una mujer y un hombre.",
            audio_text="Una mujer y un hombre.",
            options_json=json.dumps(["A", "woman", "and", "a", "man", "boy", "cat", "dog"]),
            correct_answer_json=json.dumps(["A", "woman", "and", "a", "man"]),
            explanation="'Una mujer' = A woman, 'y' = and, 'un hombre' = a man."
        )
        l1_2_e2 = Exercise(
            lesson_id=l1_2.id, order=2, type="MULTIPLE_CHOICE",
            prompt="Which of these is 'the apple'?", question="the apple",
            audio_text="la manzana",
            options_json=json.dumps([
                {"text": "La manzana", "subtext": "the apple", "icon": "apple"},
                {"text": "El agua", "subtext": "the water", "icon": "water"},
                {"text": "El pan", "subtext": "the bread", "icon": "bread"}
            ]),
            correct_answer_json=json.dumps("La manzana"),
            explanation="'La manzana' means 'the apple'."
        )
        l1_2_e3 = Exercise(
            lesson_id=l1_2.id, order=3, type="TRANSLATE_TYPE",
            prompt="Write this in English", question="Yo como pan.",
            audio_text="Yo como pan.",
            options_json=json.dumps([]),
            correct_answer_json=json.dumps(["I eat bread", "I am eating bread"]),
            explanation="'como' comes from 'comer' (to eat)."
        )
        db.add_all([l1_2_e1, l1_2_e2, l1_2_e3])

        # Lesson 1.3
        l1_3 = Lesson(skill_id=skill1.id, order=3, title="Lesson 3 of 3", xp_reward=15)
        db.add(l1_3)
        db.flush()

        l1_3_e1 = Exercise(
            lesson_id=l1_3.id, order=1, type="MATCH_PAIRS",
            prompt="Tap the matching pairs", question="Match the food & drink terms",
            options_json=json.dumps([
                {"spanish": "manzana", "english": "apple"},
                {"spanish": "pan", "english": "bread"},
                {"spanish": "agua", "english": "water"},
                {"spanish": "como", "english": "eat"}
            ]),
            correct_answer_json=json.dumps([
                {"spanish": "manzana", "english": "apple"},
                {"spanish": "pan", "english": "bread"},
                {"spanish": "agua", "english": "water"},
                {"spanish": "como", "english": "eat"}
            ]),
            explanation="Pairs matched perfectly!"
        )
        db.add(l1_3_e1)

        # --- Skill 2: Phrases ---
        l2_1 = Lesson(skill_id=skill2.id, order=1, title="Lesson 1 of 3", xp_reward=15)
        db.add(l2_1)
        db.flush()

        l2_e1 = Exercise(
            lesson_id=l2_1.id, order=1, type="TRANSLATE_TAP",
            prompt="Translate this sentence", question="¡Mucho gusto!",
            audio_text="¡Mucho gusto!",
            options_json=json.dumps(["Nice", "to", "meet", "you", "Hello", "Thanks", "Bye"]),
            correct_answer_json=json.dumps(["Nice", "to", "meet", "you"]),
            explanation="'¡Mucho gusto!' is used when meeting someone."
        )
        l2_e2 = Exercise(
            lesson_id=l2_1.id, order=2, type="TRANSLATE_TYPE",
            prompt="Write this in Spanish", question="Thank you very much!",
            audio_text="¡Muchas gracias!",
            options_json=json.dumps([]),
            correct_answer_json=json.dumps(["Muchas gracias", "¡Muchas gracias!", "Muchas gracias!"]),
            explanation="'Muchas gracias' means 'Thank you very much'."
        )
        db.add_all([l2_e1, l2_e2])

        # --- Skill 3: Food ---
        l3_1 = Lesson(skill_id=skill3.id, order=1, title="Lesson 1 of 3", xp_reward=15)
        db.add(l3_1)
        db.flush()

        l3_e1 = Exercise(
            lesson_id=l3_1.id, order=1, type="TRANSLATE_TAP",
            prompt="Translate this sentence", question="Un café, por favor.",
            audio_text="Un café, por favor.",
            options_json=json.dumps(["A", "coffee", "please", "tea", "water", "thanks"]),
            correct_answer_json=json.dumps(["A", "coffee", "please"]),
            explanation="'café' = coffee, 'por favor' = please."
        )
        db.add(l3_e1)

        # Seed lessons for skill 4, 5, 6 for path rendering completeness
        for sk in [skill4, skill5, skill6]:
            les = Lesson(skill_id=sk.id, order=1, title="Lesson 1 of 3", xp_reward=15)
            db.add(les)
            db.flush()
            ex = Exercise(
                lesson_id=les.id, order=1, type="TRANSLATE_TAP",
                prompt="Translate this sentence", question="Hola, ¿cómo estás?",
                audio_text="Hola, ¿cómo estás?",
                options_json=json.dumps(["Hello", "how", "are", "you", "thanks", "fine"]),
                correct_answer_json=json.dumps(["Hello", "how", "are", "you"]),
                explanation="Standard polite greeting."
            )
            db.add(ex)

        db.flush()

        # 5. Seed User Progress
        # Skill 1: In progress (1 lesson completed)
        p1 = UserProgress(user_id=user.id, skill_id=skill1.id, lessons_completed=1, is_completed=False, is_unlocked=True, crown_level=0)
        # Skill 2: Unlocked
        p2 = UserProgress(user_id=user.id, skill_id=skill2.id, lessons_completed=0, is_completed=False, is_unlocked=True, crown_level=0)
        # Skill 3: Unlocked
        p3 = UserProgress(user_id=user.id, skill_id=skill3.id, lessons_completed=0, is_completed=False, is_unlocked=True, crown_level=0)
        # Skill 4, 5, 6: Locked
        p4 = UserProgress(user_id=user.id, skill_id=skill4.id, lessons_completed=0, is_completed=False, is_unlocked=False, crown_level=0)
        p5 = UserProgress(user_id=user.id, skill_id=skill5.id, lessons_completed=0, is_completed=False, is_unlocked=False, crown_level=0)
        p6 = UserProgress(user_id=user.id, skill_id=skill6.id, lessons_completed=0, is_completed=False, is_unlocked=False, crown_level=0)

        db.add_all([p1, p2, p3, p4, p5, p6])
        db.flush()

        # 6. Seed Achievements
        ach1 = Achievement(code="WILDFIRE", title="Wildfire", description="Maintain a 3-day streak", icon="flame", max_progress=3)
        ach2 = Achievement(code="SAGE", title="Sage", description="Earn 200 total XP", icon="zap", max_progress=200)
        ach3 = Achievement(code="SCHOLAR", title="Scholar", description="Complete 5 lessons", icon="book-open", max_progress=5)
        ach4 = Achievement(code="SHARPSHOOTER", title="Sharpshooter", description="Complete a lesson with 100% accuracy", icon="target", max_progress=1)

        db.add_all([ach1, ach2, ach3, ach4])
        db.flush()

        ua1 = UserAchievement(user_id=user.id, achievement_id=ach1.id, current_progress=3, is_unlocked=True)
        ua2 = UserAchievement(user_id=user.id, achievement_id=ach2.id, current_progress=120, is_unlocked=False)
        ua3 = UserAchievement(user_id=user.id, achievement_id=ach3.id, current_progress=1, is_unlocked=False)
        ua4 = UserAchievement(user_id=user.id, achievement_id=ach4.id, current_progress=1, is_unlocked=True)

        db.add_all([ua1, ua2, ua3, ua4])

        # 7. Seed Leaderboard Users
        board_users = [
            LeaderboardUser(name="Sofia Rodriguez", avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia", weekly_xp=450, league="Bronze", is_current_user=False),
            LeaderboardUser(name="Mateo Silva", avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Mateo", weekly_xp=380, league="Bronze", is_current_user=False),
            LeaderboardUser(name="Duo Learner (You)", avatar_url="https://api.dicebear.com/7.x/bottts/svg?seed=duo", weekly_xp=120, league="Bronze", is_current_user=True),
            LeaderboardUser(name="Lucas Chen", avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas", weekly_xp=110, league="Bronze", is_current_user=False),
            LeaderboardUser(name="Emma Watson", avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", weekly_xp=95, league="Bronze", is_current_user=False),
            LeaderboardUser(name="Carlos Gomez", avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos", weekly_xp=80, league="Bronze", is_current_user=False),
            LeaderboardUser(name="Aria Montgomery", avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Aria", weekly_xp=60, league="Bronze", is_current_user=False),
        ]
        db.add_all(board_users)

        db.commit()
        print("Successfully seeded SQLite database with Spanish course, user progress, achievements, and leaderboard!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()


def _hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120000)
    return salt.hex() + ":" + digest.hex()

def ensure_multilanguage_data():
    """Add languages/courses to an existing database without deleting the original Spanish course."""
    from .models import User, Language, Unit, Skill, Lesson, Exercise, UserProgress
    db = SessionLocal()
    try:
        # Safe SQLite migration for databases created before authentication.
        cols = [r[1] for r in db.execute(text("PRAGMA table_info(users)")).fetchall()]
        if "password_hash" not in cols:
            db.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR"))
            db.commit()

        learner = db.query(User).filter(User.username == "learner").first()
        if learner and not learner.password_hash:
            learner.password_hash = _hash_password("learner123")
            db.commit()

        language_data = [
            ("fr","French","🇫🇷","Learn useful French for everyday conversations."),
            ("de","German","🇩🇪","Build practical German vocabulary and phrases."),
            ("it","Italian","🇮🇹","Learn friendly Italian for everyday situations."),
            ("pt","Portuguese","🇵🇹","Practice practical Portuguese conversations."),
            ("ja","Japanese","🇯🇵","Start speaking useful Japanese step by step."),
            ("ko","Korean","🇰🇷","Learn everyday Korean expressions."),
        ]
        lessons = {
            "fr":[("Basics","Bonjour","Hello"),("Phrases","Merci","Thank you"),("Food","Je voudrais un café","I would like a coffee")],
            "de":[("Basics","Hallo","Hello"),("Phrases","Danke","Thank you"),("Food","Ich möchte einen Kaffee","I would like a coffee")],
            "it":[("Basics","Ciao","Hello"),("Phrases","Grazie","Thank you"),("Food","Vorrei un caffè","I would like a coffee")],
            "pt":[("Basics","Olá","Hello"),("Phrases","Obrigado","Thank you"),("Food","Eu quero um café","I want a coffee")],
            "ja":[("Basics","こんにちは","Hello"),("Phrases","ありがとう","Thank you"),("Food","コーヒーをください","Coffee, please")],
            "ko":[("Basics","안녕하세요","Hello"),("Phrases","감사합니다","Thank you"),("Food","커피 주세요","Coffee, please")],
        }
        for code,name,flag,desc in language_data:
            lang = db.query(Language).filter(Language.code == code).first()
            if lang:
                continue
            lang = Language(code=code,name=name,flag_icon=flag,description=desc)
            db.add(lang); db.flush()
            unit = Unit(language_id=lang.id, order=1, title=f"Unit 1: {name} basics",
                        description=f"Build your first {name} sentences and everyday phrases.",
                        color_hex="#58cc02")
            db.add(unit); db.flush()
            for idx,(title, native, english) in enumerate(lessons[code],1):
                skill=Skill(unit_id=unit.id,order=idx,title=title,description=f"Practice {title.lower()} in {name}.",
                            icon=["book","message-circle","coffee"][idx-1],total_lessons=3)
                db.add(skill); db.flush()
                for lesson_order in range(1,4):
                    lesson=Lesson(skill_id=skill.id,order=lesson_order,title=f"Lesson {lesson_order} of 3",xp_reward=15)
                    db.add(lesson); db.flush()
                    if lesson_order == 1:
                        opts=[english,"Goodbye","Please","Sorry"]
                        ex=Exercise(lesson_id=lesson.id,order=1,type="MULTIPLE_CHOICE",
                                    prompt=f"What does this mean in English?",question=native,audio_text=native,
                                    options_json=json.dumps(opts),correct_answer_json=json.dumps(english),
                                    explanation=f"{native} means {english}.")
                    elif lesson_order == 2:
                        ex=Exercise(lesson_id=lesson.id,order=1,type="TRANSLATE_TYPE",
                                    prompt=f"Write this in {name}",question=english,audio_text=native,
                                    options_json=json.dumps([]),correct_answer_json=json.dumps([native]),
                                    explanation=f"{native} is the {name} translation.")
                    else:
                        ex=Exercise(lesson_id=lesson.id,order=1,type="TRANSLATE_TYPE",
                                    prompt="Translate this",question=native,audio_text=english,
                                    options_json=json.dumps([]),correct_answer_json=json.dumps([english]),
                                    explanation=f"{native} means {english}.")
                    db.add(ex)
            db.flush()
            if learner:
                skills=[x for x in unit.skills]
                for i,skill in enumerate(skills):
                    db.add(UserProgress(user_id=learner.id,skill_id=skill.id,is_unlocked=(i==0)))
        db.commit()
    finally:
        db.close()
