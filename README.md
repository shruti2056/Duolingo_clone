# Duolingo Web App Clone (Fullstack SDE Assignment)

A functional, modern clone of the Duolingo web application built with **Next.js (TypeScript)**, **Python FastAPI**, and **SQLite**. Recreates Duolingo's signature serpentine learning path, interactive lesson player, 5 exercise types, audio synthesis, speech TTS, and gamification mechanics (XP, daily streak, hearts depletion/refill, leaderboard, shop, and achievements).

![Duolingo Clone Banner](https://img.shields.io/badge/Duolingo-Fullstack%20Clone-58cc02?style=for-the-badge&logo=duolingo)
![Next.js](https://img.shields.io/badge/Next.js-14+-000000?style=for-the-badge&logo=nextdotjs)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite)

---

## 🚀 Key Features

### 1. Learning Path / Skill Tree (`/learn`)
- **Serpentine Path Visualizer**: Winding unit path with floating interactive skill nodes.
- **Node States**: Locked (padlock), Available/In-progress (vibrant pulse with SVG circular progress rings), Completed (gold crown), and Legendary states.
- **Top Navigation Bar**: Selected language flag, streak fire counter, gem wallet, and heart status.

### 2. Interactive Lesson Player (Core Loop)
- **5 Exercise Types**:
  1. `TRANSLATE_TAP`: Tap-the-word bank translation with audio speech bubble.
  2. `MULTIPLE_CHOICE`: Visual option cards with shortcut key indicators.
  3. `MATCH_PAIRS`: 2-column instant matching with green/red visual response.
  4. `FILL_BLANK`: Sentence completion with missing word slots.
  5. `TRANSLATE_TYPE`: Freeform text translation keyboard input.
- **Signature Bottom Feedback Bar**: Sliding green ("Awesome!") and red ("Correct solution:") feedback bar with explanation notes.
- **Web Audio API Sound Effects**: Custom synthesized audio for correct ping, wrong buzz, fanfare victory, and button pops.
- **Web Speech API TTS**: Native text-to-speech pronunciation for target sentences.
- **Lesson Complete Celebration**: Confetti explosion, XP earned breakdown, accuracy calculation, and streak flame update.

### 3. Gamification Mechanics
- **Daily Streak Engine**: Automatically tracks daily activity and updates streaks.
- **Hearts System**: Lose 1 heart on incorrect answers; hearts can be refilled with gems (100 gems -> 5 hearts) or earned through practice lessons.
- **Weekly Leaderboard (`/leaderboard`)**: League podiums (Bronze -> Diamond) with top 3 crowns and user rankings.
- **Quests & Achievements (`/quests`)**: Daily XP goals and badges (Wildfire, Sage, Scholar, Sharpshooter).
- **Duo Shop (`/shop`)**: Heart refills, streak freeze, and gem wagers.

---

## 📁 Repository Structure

```
duolingo-clone/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entrypoint with CORS
│   │   ├── database.py          # SQLite database connection & session setup
│   │   ├── models.py            # SQLAlchemy database schemas
│   │   ├── schemas.py           # Pydantic request/response validation
│   │   ├── seed.py              # Initial database seed script
│   │   └── routers/             # API Router modules
│   │       ├── user.py          # User profile, hearts refill, streak check
│   │       ├── courses.py       # Course learning path & unit skills
│   │       ├── lessons.py       # Lesson exercises & completion engine
│   │       ├── leaderboard.py   # Weekly league rankings
│   │       └── achievements.py  # Badges & quests status
│   └── requirements.txt         # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── learn/           # Learning path page
│   │   │   ├── leaderboard/     # Leaderboard page
│   │   │   ├── quests/          # Quests & achievements page
│   │   │   ├── shop/            # Duo shop page
│   │   │   └── profile/         # Learner profile page
│   │   ├── components/          # Reusable UI components
│   │   │   ├── layout/          # Sidebar, TopNav
│   │   │   ├── path/            # UnitHeader, SkillNode
│   │   │   ├── lesson/          # LessonPlayer, Exercise components, BottomFeedbackBar
│   │   │   └── modals/          # OutOfHeartsModal
│   │   ├── lib/                 # Audio synthesizer, API client
│   │   └── types/               # TypeScript interfaces
│   └── package.json
└── README.md
```

---

## 🛠️ Setup & Installation Instructions

### Prerequisites
- **Node.js**: v18 or later (`node -v`)
- **Python**: v3.10 or later (`python --version`)

### 1. Run Backend Server (FastAPI + SQLite)
```bash
# Navigate to project directory
cd duolingo-clone

# Install backend dependencies
pip install -r backend/requirements.txt

# Seed SQLite Database (optional - runs automatically on startup if empty)
python -m backend.app.seed

# Start FastAPI server on port 8000
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be live at: `http://127.0.0.1:8000` (Interactive API docs at `http://127.0.0.1:8000/docs`).

### 2. Run Frontend Server (Next.js TypeScript)
```bash
# Open a new terminal and navigate to frontend
cd duolingo-clone/frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🗄️ Database Schema Design

SQLite Database (`backend/duolingo.db`):

| Table Name | Description | Key Fields |
| :--- | :--- | :--- |
| `users` | Learner profile and state | `id`, `streak`, `xp`, `gems`, `hearts`, `current_language_id` |
| `languages` | Supported course languages | `id`, `code`, `name`, `flag_icon` |
| `units` | Course units | `id`, `language_id`, `order`, `title`, `color_hex` |
| `skills` | Skill nodes within units | `id`, `unit_id`, `order`, `title`, `icon`, `total_lessons` |
| `lessons` | Skill lesson modules | `id`, `skill_id`, `order`, `title`, `xp_reward` |
| `exercises` | Interactive exercises | `id`, `lesson_id`, `type`, `prompt`, `options_json`, `correct_answer_json` |
| `user_progress` | Skill completion & crowns | `id`, `user_id`, `skill_id`, `lessons_completed`, `is_completed`, `crown_level` |
| `achievements` | Badges system | `id`, `code`, `title`, `description`, `max_progress` |
| `user_achievements`| Learner achievement unlocks| `id`, `user_id`, `achievement_id`, `current_progress`, `is_unlocked` |
| `leaderboard_users`| Seeded weekly leaderboard | `id`, `name`, `avatar_url`, `weekly_xp`, `league` |

---

## 🌐 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/user/me` | Fetch active user state (streak, XP, hearts, gems) |
| `POST` | `/api/user/hearts/refill` | Refill hearts via gems or practice lesson |
| `GET` | `/api/courses/current` | Fetch active course units, skills, and learner progress |
| `GET` | `/api/lessons/{id}` | Fetch lesson exercises payload |
| `POST` | `/api/exercises/check` | Evaluate exercise answer instantly |
| `POST` | `/api/lessons/{id}/complete` | Submit lesson completion, award XP, and update progress |
| `GET` | `/api/leaderboard` | Get weekly league standings |
| `GET` | `/api/achievements` | Get user achievement progress |
| `POST` | `/api/reset` | Reset and re-seed database to initial state |

---

## 🎨 UI & Design Highlights
- **Vibrant Color System**: Duolingo Green (`#58cc02`), Sky Blue (`#1cb0f6`), Warm Yellow (`#ffc800`), Coral Red (`#ff4b4b`), and Purple (`#ce82ff`).
- **Tactile 3D Buttons**: Custom CSS depth classes (`border-b-4 active:translate-y-1`).
- **Dark Mode Support**: Seamless toggle between light and dark themes.
- **Audio Synthesizer**: Native Web Audio API sound synthesis without external audio file dependencies.
