import datetime, base64, hashlib, hmac, os
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db
from ..models import User, Language, UserProgress
from ..schemas import UserSchema, HeartRefillResponse

router = APIRouter(prefix="/api/user", tags=["user"])
AUTH_SECRET = os.getenv("AUTH_SECRET", "duolingo-clone-local-secret")

def _token_for(user: User) -> str:
    raw = f"{user.id}:{user.username}"
    sig = hmac.new(AUTH_SECRET.encode(), raw.encode(), hashlib.sha256).hexdigest()[:32]
    return base64.urlsafe_b64encode(f"{raw}:{sig}".encode()).decode()

def _user_from_token(token: str, db: Session):
    try:
        raw = base64.urlsafe_b64decode(token.encode()).decode()
        uid, username, sig = raw.split(":", 2)
        expected = hmac.new(AUTH_SECRET.encode(), f"{uid}:{username}".encode(), hashlib.sha256).hexdigest()[:32]
        if not hmac.compare_digest(sig, expected):
            return None
        return db.query(User).filter(User.id == int(uid), User.username == username).first()
    except Exception:
        return None

def get_current_user(db: Session = Depends(get_db), authorization: str | None = Header(default=None)):
    # Keep the original demo behavior for users who haven't logged in yet.
    if authorization and authorization.lower().startswith("bearer "):
        user = _user_from_token(authorization.split(" ", 1)[1].strip(), db)
        if user:
            return user
        raise HTTPException(status_code=401, detail="Invalid or expired login token")
    user = db.query(User).filter(User.username == "learner").first()
    if not user:
        raise HTTPException(status_code=404, detail="Default user not found")
    return user

def _hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120000)
    return salt.hex() + ":" + digest.hex()

def _verify_password(password: str, stored: str | None) -> bool:
    if not stored or ":" not in stored: return False
    salt_hex, digest_hex = stored.split(":", 1)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), 120000)
    return hmac.compare_digest(digest.hex(), digest_hex)

def _ensure_password_column(db):
    cols = [r[1] for r in db.execute(text("PRAGMA table_info(users)")).fetchall()]
    if "password_hash" not in cols:
        db.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR"))
        db.commit()

@router.post("/signup")
def signup(payload: dict, db: Session = Depends(get_db)):
    _ensure_password_column(db)
    username = str(payload.get("username","")).strip()
    name = str(payload.get("name") or username).strip()
    email = str(payload.get("email","")).strip()
    password = str(payload.get("password",""))
    if len(username) < 3 or len(password) < 6:
        raise HTTPException(status_code=400, detail="Username must be 3+ characters and password 6+ characters")
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=409, detail="Username already exists")
    if email and db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Email already exists")
    lang = db.query(Language).filter(Language.code == "es").first() or db.query(Language).first()
    user = User(username=username, name=name, email=email, password_hash=_hash_password(password),
                avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={username}",
                streak=0, xp=0, gems=500, hearts=5, max_hearts=5,
                current_language_id=lang.id if lang else None)
    db.add(user); db.flush()
    if lang:
        skills = [s for u in sorted(lang.units, key=lambda x:x.order) for s in sorted(u.skills, key=lambda x:x.order)]
        for i, skill in enumerate(skills):
            db.add(UserProgress(user_id=user.id, skill_id=skill.id, is_unlocked=(i==0)))
    db.commit(); db.refresh(user)
    return {"token": _token_for(user), "user": user}

@router.post("/login")
def login(payload: dict, db: Session = Depends(get_db)):
    _ensure_password_column(db)
    identifier = str(payload.get("identifier") or payload.get("username") or payload.get("email") or "").strip()
    password = str(payload.get("password",""))
    user = db.query(User).filter((User.username == identifier) | (User.email == identifier)).first()
    if not user or not _verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")
    return {"token": _token_for(user), "user": user}

@router.post("/logout")
def logout():
    return {"success": True}

@router.post("/language/{language_id}")
def switch_language(language_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    lang = db.query(Language).filter(Language.id == language_id).first()
    if not lang: raise HTTPException(status_code=404, detail="Language not found")
    user.current_language_id = lang.id
    for skill in [s for u in lang.units for s in u.skills]:
        if not db.query(UserProgress).filter(UserProgress.user_id==user.id, UserProgress.skill_id==skill.id).first():
            db.add(UserProgress(user_id=user.id, skill_id=skill.id, is_unlocked=(skill.order==1 and skill.unit.order==1)))
    db.commit(); db.refresh(user)
    return user

@router.get("/languages")
def languages(db: Session = Depends(get_db)):
    return db.query(Language).order_by(Language.id).all()

@router.get("/me", response_model=UserSchema)
def get_user_profile(user: User = Depends(get_current_user)):
    return user

@router.post("/hearts/refill", response_model=HeartRefillResponse)
def refill_hearts(method: str = "gems", db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.hearts >= user.max_hearts:
        return HeartRefillResponse(success=True, message="Hearts are already full!", hearts=user.hearts, gems=user.gems)
    if method == "gems":
        cost = 100
        if user.gems < cost:
            return HeartRefillResponse(success=False, message="Not enough gems!", hearts=user.hearts, gems=user.gems)
        user.gems -= cost; user.hearts = user.max_hearts
    elif method == "practice":
        user.hearts = min(user.max_hearts, user.hearts + 1)
    else:
        raise HTTPException(status_code=400, detail="Invalid refill method")
    db.commit(); db.refresh(user)
    return HeartRefillResponse(success=True, message="Hearts refilled!", hearts=user.hearts, gems=user.gems)

@router.post("/streak/check")
def check_streak(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    today_str = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    yesterday_str = (datetime.datetime.utcnow() - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    if user.last_active_date == today_str: return {"streak": user.streak, "updated": False, "message": "Already active today"}
    if user.last_active_date == yesterday_str: user.streak += 1
    else: user.streak = 1
    user.last_active_date = today_str; db.commit()
    return {"streak": user.streak, "updated": True, "message": "Streak updated"}

@router.post("/hearts/decrement")
def decrement_heart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.hearts > 0: user.hearts -= 1; db.commit(); db.refresh(user)
    return {"hearts": user.hearts}
