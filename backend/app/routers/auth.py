import hashlib
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models import User, Language, Skill, UserProgress
from ..schemas import UserRegisterRequest, UserLoginRequest, AuthResponse, UserSchema

router = APIRouter(prefix="/api/auth", tags=["auth"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def get_current_user_from_token(
    authorization: Optional[str] = Header(None),
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
) -> User:
    if authorization and authorization.startswith("Bearer user_"):
        try:
            uid = int(authorization.split("user_")[1])
            user = db.query(User).filter(User.id == uid).first()
            if user:
                return user
        except Exception:
            pass

    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return user

    # Fallback to default user
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No users found in database")
    return user

@router.post("/register", response_model=AuthResponse)
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == req.username.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username is already taken")

    default_lang = db.query(Language).filter(Language.code == "es").first()
    lang_id = default_lang.id if default_lang else 1

    new_user = User(
        username=req.username.strip().lower(),
        name=req.name.strip(),
        email=req.email.strip().lower(),
        password_hash=hash_password(req.password),
        avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={req.username}",
        streak=1,
        xp=0,
        gems=500,
        hearts=5,
        max_hearts=5,
        current_language_id=lang_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize user progress for skills in default language
    skills = db.query(Skill).all()
    for idx, sk in enumerate(skills):
        is_first = (idx == 0)
        prog = UserProgress(
            user_id=new_user.id,
            skill_id=sk.id,
            lessons_completed=0,
            is_completed=False,
            is_unlocked=is_first,
            crown_level=0
        )
        db.add(prog)
    db.commit()

    token = f"user_{new_user.id}"
    return AuthResponse(token=token, user=UserSchema.from_orm(new_user))

@router.post("/login", response_model=AuthResponse)
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username.strip().lower()).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid username or password")

    if user.password_hash and user.password_hash != hash_password(req.password):
        raise HTTPException(status_code=400, detail="Invalid username or password")

    token = f"user_{user.id}"
    return AuthResponse(token=token, user=UserSchema.from_orm(user))

@router.get("/me", response_model=UserSchema)
def get_auth_me(user: User = Depends(get_current_user_from_token)):
    return user
