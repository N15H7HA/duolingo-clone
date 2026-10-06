# Duolingo Web Clone — Full-Stack Gamified Language Learning Platform

[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20(WAL)-003B57?style=flat&logo=sqlite)](https://www.sqlite.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=flat)](https://github.com/pmndrs/zustand)

A production-grade, full-stack replica of **Duolingo's core learning experience**, featuring the iconic sine-wave learning path, 3D tactile micro-interactions, full-screen interactive lesson player with 5 exercise modalities, deterministic timezone-aware streak calculations, lazy heart regeneration, tiered competitive leagues, and developer time-travel sandbox controls.

- **Live Demo**: [https://duolingo-clone-demo.vercel.app](https://github.com/N15H7HA/duolingo-clone) *(Replace with deployment URL)*
- **GitHub Repository**: [https://github.com/N15H7HA/duolingo-clone](https://github.com/N15H7HA/duolingo-clone)

---

## 1. System Architecture

The application is structured into a modern decoupled architecture: a high-performance **FastAPI** backend with asynchronous request handling and an atomic SQLite WAL storage layer, alongside a responsive **Next.js App Router** frontend leveraging **Zustand** for transient lesson state and **TanStack Query** for server state synchronization.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER                                 │
│                      Next.js 14 (App Router)                             │
│                                                                          │
│  ┌───────────────────────┐                    ┌───────────────────────┐  │
│  │     Zustand Store     │                    │    TanStack Query     │  │
│  │  (useLessonStore.ts)  │                    │  (Server Cache/Sync)  │  │
│  │  - Exercise Queue     │                    │  - User Stats & Heart │  │
│  │  - Mistake Tracking   │                    │  - Curriculum Path    │  │
│  │  - Word Bank Tiles    │                    │  - Live Leaderboard   │  │
│  └───────────┬───────────┘                    └───────────┬───────────┘  │
│              │                                            │              │
│              └─────────────────────┬──────────────────────┘              │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │ JSON REST API (HTTP / CORS)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            BACKEND LAYER                                 │
│                        FastAPI (Python 3.11+)                            │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                         REST Routers                               │  │
│  │  /api/v1/me          /api/v1/path         /api/v1/lessons/start    │  │
│  │  /api/v1/attempts    /api/v1/hearts       /api/v1/leaderboard      │  │
│  └─────────────────────────────────┬──────────────────────────────────┘  │
│                                    │                                     │
│  ┌─────────────────────────────────┴──────────────────────────────────┐  │
│  │                       Domain Services                              │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────┐  │  │
│  │  │    Hearts    │  │    Streak    │  │  XP Engine   │  │ Progress│ │  │
│  │  │ (Lazy Regen) │  │  (Timezone)  │  │(Bonus Math)  │  │(Derived)│ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────┘  │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │ Lesson Engine (NFD Unicode Normalization & Anti-Cheat Stripping)│  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────┬──────────────────────────────────┘  │
│                                    │ SQLAlchemy 2.0 (ORM)                │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          PERSISTENCE LAYER                               │
│                         SQLite 3 Engine                                  │
│                                                                          │
│  - PRAGMA foreign_keys = ON (Enforced via connection listener)           │
│  - PRAGMA journal_mode = WAL (Write-Ahead Logging for high concurrency)  │
│  - PRAGMA synchronous = NORMAL                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Derived Skill States vs. Stored States**:
   - *Decision*: Skill progression states (`completed`, `active`, `locked`) are derived dynamically on read rather than mutated across database columns.
   - *Rationale*: Prevents invalid path states and synchronization anomalies. If a user completes Skill 1, Skill 2 becomes `active` without requiring a cascade update across multiple rows.
2. **Lazy Heart Regeneration vs. Cron Jobs**:
   - *Decision*: Heart recovery is calculated on-demand whenever user state is read or evaluated (`floor(elapsed_seconds / 18000)`).
   - *Rationale*: Eliminates external daemon workers, Celery/Redis dependencies, or serverless cron jobs. The database remains completely self-contained and deterministic with zero recurring idle overhead.
3. **Strict Server-Side Validation (Anti-Cheat Queue)**:
   - *Decision*: The `/api/v1/lessons/{id}/start` endpoint strips all `is_correct` booleans, answer keys, and pair solutions before sending the exercise queue to the client.
   - *Rationale*: Eliminates client-side inspection vulnerabilities (e.g. inspecting network payloads or React DevTools to find the correct answer).

---

## 2. Database Design & Relational Schema

The relational schema is mapped with **SQLAlchemy 2.0 Declarative Mappings** using strict foreign key relationships, cascade deletions, and compound unique constraints:

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   courses   │───<   │    units    │───<   │   skills    │
└─────────────┘       └─────────────┘       └─────────────┘
                                                   │
                                                   ▼
┌─────────────────────┐                     ┌─────────────┐
│ user_skill_progress │                     │   lessons   │
└─────────────────────┘                     └─────────────┘
                                                   │
                                                   ▼
┌──────────────────┐       ┌─────────────┐       ┌─────────────┐
│ exercise_answers │───<   │  exercises  │───<   │  options    │
└──────────────────┘       └─────────────┘       └─────────────┘
                                  │
                                  ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────┐
│  daily_xp       │       │ attempt_answers │───<   │  attempts   │
└─────────────────┘       └─────────────────┘       └─────────────┘
                                                           │
                                                           ▼
┌─────────────────┐                                 ┌─────────────┐
│ league_members  │────────────────────────────────>│    users    │
└─────────────────┘                                 └─────────────┘
```

### Table Definitions

| Table | Primary Columns & Constraints | Purpose |
| :--- | :--- | :--- |
| `users` | `id`, `username`, `display_name`, `avatar`, `timezone`, `xp_total`, `streak_count`, `last_active_date`, `hearts`, `hearts_updated_at`, `gems`, `daily_goal_xp`, `simulated_day_offset`, `sound_enabled`, `dark_mode`, `is_seeded_bot` | Core profile, gamification stats, preferences, and bot flags. |
| `courses` | `id`, `code` (UQ), `name`, `from_language`, `to_language`, `flag` | Language courses (e.g., Spanish `es-en` with `🇪🇸`). |
| `units` | `id`, `course_id` (FK), `position`, `title`, `description`, `color` | Themed sections on the path (`#58CC02`, `#CE82FF`, `#FF9600`). |
| `skills` | `id`, `unit_id` (FK), `position`, `name`, `icon`, `lesson_count` | Individual skill circles on the learning path. |
| `lessons` | `id`, `skill_id` (FK), `position`, `title` | Structured lesson modules (3 lessons per skill). |
| `exercises` | `id`, `lesson_id` (FK), `position`, `type`, `prompt`, `source_text`, `image_key` | 5 exercise formats: `select`, `translate`, `match_pairs`, `fill_blank`, `type_answer`. |
| `exercise_options`| `id`, `exercise_id` (FK), `text`, `is_correct`, `pair_key`, `side`, `position` | Options for multiple-choice, matching pairs, and word banks. |
| `exercise_answers`| `id`, `exercise_id` (FK), `answer_text` | Normalized acceptable variants for translations and typing. |
| `user_skill_progress` | `id`, `user_id` (FK), `skill_id` (FK), `lessons_completed`, `completed_at`, UQ(`user_id`, `skill_id`) | Skill mastery tracking and completion timestamps. |
| `lesson_attempts` | `id`, `user_id` (FK), `lesson_id` (FK), `status`, `mistakes`, `hearts_lost`, `xp_earned`, `started_at`, `finished_at` | Audit trail of sessions (`in_progress`, `completed`, `failed`). |
| `attempt_answers` | `id`, `attempt_id` (FK), `exercise_id` (FK), `submitted_answer`, `is_correct`, `is_retry`, `answered_at` | Granular per-exercise answer submissions. |
| `daily_xp` | `id`, `user_id` (FK), `date`, `xp`, UQ(`user_id`, `date`) | Historical daily XP logs for calendar streaks. |
| `leagues` & `league_members` | `id`, `league_id` (FK), `user_id` (FK), `weekly_xp`, `reached_at`, UQ(`league_id`, `user_id`) | 10 competitive divisions (Bronze to Diamond) and rankings. |

---

## 3. Core Business Logic Formulations

### 1. Experience Points (XP) Calculation
Standard lessons reward speed and precision:
$$\text{XP}_{\text{earned}} = 10 \text{ (base)} + (5 \text{ if mistakes} = 0) + (2 \text{ if duration} < 180\text{s})$$
- Perfect run under 3 minutes: **17 XP**
- Practice review mode: **5 XP** + **1 Heart Award**

### 2. Lazy Heart Regeneration Formula
Hearts regenerate at a fixed rate of **1 heart per 5 hours (18,000 seconds)** up to **5 hearts**:
$$\text{Gained Hearts} = \min\left(5 - \text{Hearts}_{\text{current}}, \left\lfloor \frac{\Delta t}{18000} \right\rfloor\right)$$
$$\text{hearts\_updated\_at}_{\text{new}} = \text{hearts\_updated\_at}_{\text{old}} + (\text{Gained Hearts} \times 18000\text{s})$$
When hearts are full ($5/5$), the anchor resets to the current timestamp.

### 3. Timezone-Aware Streak Engine
Calendar day transitions use the user's localized timezone (default: `Asia/Kolkata`) alongside the simulated day offset:
- If $\text{last\_active\_date} = \text{today}$: Practice logged today; streak maintained.
- If $\text{last\_active\_date} = \text{today} - 1$: Consecutive practice; $\text{streak} \leftarrow \text{streak} + 1$.
- If $\text{last\_active\_date} < \text{today} - 1$: Inactivity detected; display streak shows `0`, and the next completed session resets $\text{streak} \leftarrow 1$.

### 4. Answer Normalization & Unicode Accent Detection
User input is cleaned via regex to remove punctuation (`¿¡.,!?;:`) and lowercase text. Accents are decomposed using Unicode **NFD** (`unicodedata.normalize('NFD', text)`):
- If input matches exact accented solution: `correct: true`, `accent_warning: false`.
- If input matches accent-stripped solution (e.g. `"adios"` for `"adiós"`): `correct: true`, `accent_warning: true`.

---

## 4. Local Setup & Quickstart Guide

### Prerequisites
- **Python**: `3.11+` (tested on 3.11, 3.12, 3.14)
- **Node.js**: `18+` or `20+` (npm / npx)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run deterministic database seed (Populates 160 exercises, user 'niso', and 29 bots)
python seed/seed.py

# Start FastAPI development server on port 8000
uvicorn app.main:app --reload --port 8000
```
- API Swagger Docs: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Create environment configuration
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# Start Next.js App Router dev server
npm run dev
```
- Application Web App: [http://localhost:3000](http://localhost:3000)

### 3. Automated Test Suite

```bash
cd backend
.venv/bin/pytest tests/ -v
```
All **19 unit and integration tests** validate SQLite PRAGMA locks, heart recovery, streak calculation, anti-cheat queue stripping, and answer verification.

---

## 5. UI Features & Gamification Shell

| Feature | Description |
| :--- | :--- |
| **Sine-Wave Learning Path** | SVG/DOM offset sequence `[0, 40, 70, 40, 0, -40, -70, -40]` px with interactive active popovers and bouncing speech bubbles. |
| **3D Tactile Design System** | `border-b-4` 3D buttons with active `:active` press transforms (`translate-y-[4px] border-b-0`). |
| **Interactive Lesson Player** | Full-screen player supporting Multiple Choice, Word Bank sentence builder, Cloze gap fill, Matching Pairs, and Direct Typing with virtual accent keyboards. |
| **Animated Feedback Drawer** | 250ms slide-up tray with audio-visual positive/negative alerts, accent warnings, and `Enter` key progression. |
| **Confetti Celebration** | Multi-angle `canvas-confetti` explosion with 3D performance breakdown cards (XP, Accuracy, Time). |
| **Bronze League Tournament** | Real-time weekly tournament standings with Promotion (1-10), Safe (11-25), and Demotion (26-30) indicators. |
| **Developer Time Machine** | Floating `"🛠️ Demo Tools"` widget to advance time by +24 hours or reset demo seed data instantaneously. |

---

## 6. Technical Interview Q&A (Architecture & Scaling)

### Q1: Why use SQLite in Write-Ahead Logging (WAL) mode over standard rollback journal?
> **Answer**: Standard SQLite locks the entire database file during writes, creating contention between concurrent HTTP readers and writers. In WAL mode (`PRAGMA journal_mode = WAL`), readers do not block writers, and writers do not block readers. Reads execute concurrently against the snapshot while writes append to the `-wal` log file.

### Q2: How would you migrate this SQLite schema to PostgreSQL for multi-region scale?
> **Answer**: 
> 1. SQLAlchemy 2.0 handles the dialect abstraction; we replace the `DATABASE_URL` driver with `postgresql+asyncpg://`.
> 2. Replace SQLite integer boolean columns with native PostgreSQL `BOOLEAN`.
> 3. Implement connection pooling using PgBouncer or SQLAlchemy's `AsyncEngine` connection pool (`pool_size=20`, `max_overflow=10`).
> 4. Add database migrations using **Alembic** (`alembic revision --autogenerate`) to maintain versioned schema evolution in CI/CD.

### Q3: How do you handle timezone edge cases (e.g. DST transitions, midnight crossovers)?
> **Answer**: All database timestamps (`hearts_updated_at`, `started_at`, `finished_at`) are strictly stored in timezone-aware **UTC**. When evaluating calendar streaks, the user's IANA timezone identifier (e.g. `Asia/Kolkata` or `America/New_York`) is loaded via Python's standard `zoneinfo.ZoneInfo`, ensuring Daylight Saving Time transitions are accounted for automatically when deriving localized date strings (`YYYY-MM-DD`).

### Q4: Why does the backend strip `is_correct` in the lesson queue rather than evaluating client-side?
> **Answer**: Client-side validation requires delivering the answer key in the initial HTTP response, making cheat extensions or simple browser DevTools inspection trivial. By stripping answer keys and evaluating attempts via `POST /api/v1/attempts/{id}/answer`, answer keys remain securely guarded server-side.

### Q5: How would you support additional language pairs (e.g., French -> English, Japanese -> English)?
> **Answer**: 
> 1. The database is already normalized with `courses.from_language` and `courses.to_language`.
> 2. Adding a new language requires adding a new `Course` record and attaching new `Unit` $\rightarrow$ `Skill` $\rightarrow$ `Lesson` $\rightarrow$ `Exercise` trees.
> 3. For non-Latin scripts (e.g. Japanese Kanji/Hiragana or Arabic), the normalization engine can be extended with character segmentation (e.g. MeCab for Japanese word tokenization) and script-specific regex cleaners.

### Q6: How does the lazy heart regeneration handle server restarts or user dormancy?
> **Answer**: Because heart regeneration relies on the mathematical difference $\Delta t = \text{now} - \text{hearts\_updated\_at}$, the server can be restarted or shut down with zero loss of state. If a user is dormant for 3 days, $\Delta t = 259,200\text{s}$; on their next request, $\lfloor 259200 / 18000 \rfloor = 14 \ge 5$, capping their hearts at 5 and anchoring the timestamp to `now` with zero scheduled tasks needed during dormancy.

---

## 7. License & Credits

Built with ❤️ for advanced full-stack engineering demonstration. Inspired by Duolingo's world-class gamification architecture.
