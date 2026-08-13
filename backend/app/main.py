import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import user, courses, lessons, leaderboard, achievements
from .seed import seed_database, ensure_multilanguage_data

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Duolingo Clone API",
    description="Fullstack Duolingo API with Gamification Engine",
    version="1.0.0"
)

# CORS Configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(user.router)
app.include_router(courses.router)
app.include_router(lessons.router)
app.include_router(leaderboard.router)
app.include_router(achievements.router)

@app.on_event("startup")
def startup_db_seed():
    # Seed DB if empty or on startup
    try:
        from .database import SessionLocal
        from .models import User
        db = SessionLocal()
        u = db.query(User).first()
        if not u:
            print("Database empty. Seeding initial data...")
            seed_database()
        db.close()
        ensure_multilanguage_data()
    except Exception as e:
        print("Error during startup seed check:", e)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "Duolingo Clone API",
        "docs": "/docs"
    }

@app.post("/api/reset")
def reset_and_seed():
    seed_database()
    ensure_multilanguage_data()
    return {"message": "Database successfully reset and seeded!"}
