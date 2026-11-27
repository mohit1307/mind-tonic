# 🧠 Mind Tonic

> **AI-Powered Personal Routine & Productivity Management Platform**  
> A full-stack, production-grade system designed for university students, developers, and professionals to eliminate schedule chaos, master academic syllabi, protect fixed commitments, and manage student finances.

---

## 🌟 Key Highlights & Engineering Features

1. **Deterministic 288-Slot Constraint Timetable Engine:**
   * Discretizes the 24-hour day into 288 contiguous 5-minute slots.
   * **Strict Fixed Commitment Protection:** College lectures, exams, and work shifts are **never automatically moved, collided with, or overwritten**.
   * Automatic sleep window locking (based on user sleep schedule) and recharge break insertion (15-min intervals after intensive focus blocks).
2. **Intelligent Missed-Task Rescheduling:**
   * Autonomous detection of missed flexible blocks past their scheduled time.
   * Scans remaining waking hours for candidate slots without violating fixed commitments or bedtime.
   * 1-Click quick reschedule banner and alternative slot picker modal.
3. **SuperMemo SM-2 Spaced Repetition Engine:**
   * Mathematical implementation of the SM-2 active recall algorithm:
     $$EF' = \max\left(1.3, EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))\right)$$
   * Automatically schedules future revision dates based on recall quality ($q \in [0, 5]$).
   * Active recall flashcard queue with question prompt, answer reveal, and interval calculation.
4. **Interactive Focus Study Timer:**
   * Built-in stopwatch focus timer logging study blocks directly into MongoDB subjects and topics with 1–5 star focus ratings.
5. **Document Vault & OCR Receipt Parser:**
   * Server-side text recognition powered by **Tesseract.js** and regex heuristic extractors.
   * Parses monetary totals (₹/$), merchant/university names, dates, and categories from uploaded receipt images (JPG, PNG, WebP) and PDF challans.
   * **1-Click Expense Creation:** Converts scanned receipt data into verified budget entries with bidirectional linking.
6. **Student Expenses & College Fee Tracker:**
   * Dedicated tracking for semester tuition, examination fees, and bank challan numbers.
   * Due date alerts, paid/pending toggles, and Recharts category spending breakdowns.
7. **Autonomous Background Cron Jobs (`node-cron`):**
   * Upcoming block notifications (runs every 15 minutes).
   * Evening habit streak warnings at 8:00 PM (*"Keep your streak alive!"*).
   * College fee due date alerts (runs daily at 9:00 AM).
8. **AI Personal Assistant & Web Speech Voice Engine:**
   * Natural language intent recognition with live MongoDB context injection.
   * **Safe Action Confirmation Pattern:** Read queries execute instantly; write mutations (e.g. creating tasks, generating routines, shifting sessions) require explicit user approval.
   * **Voice Assistant:** Native browser Speech-to-Text (STT) voice input via Web Speech API and Text-to-Speech (TTS) response readout.
9. **Holistic Productivity Analytics:**
   * Composite **Flow Score (0–100%)** combining task completion rate (40%), habit consistency (30%), and study hours (30%).
   * Recharts AreaChart visualizing 7-day focus study trends.
   * Contextual **AI Daily Performance Briefing** synthesized across all modules.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + Vite)                           │
│  Tailwind CSS v3 • React Router v6 • Axios Client • Recharts • Lucide Icons │
│                                                                             │
│  [ Dashboard ]  [ Routine ]  [ Tasks ]  [ Habits ]  [ AI Voice Assistant ]   │
│  [ Learning (SM-2) ]  [ Documents (OCR) ]  [ Expenses ]  [ Analytics ]      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST (Supabase Bearer JWT)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                         BACKEND (Node.js + Express)                         │
│                                                                             │
│  ├── Middleware: Supabase Auth JWT Verification, Joi, Multer, Error Handlers│
│  ├── Scheduling Engine: 288-Slot Timeline Constraint Algorithm              │
│  ├── Spaced Repetition Engine: SuperMemo SM-2 Formula Processor             │
│  ├── OCR Engine: Tesseract.js Text Recognition + Heuristic Regex Extractor  │
│  ├── AI Engine: Live Context Assembly + Structured Action Proposal Engine   │
│  ├── Cron Jobs: Node-Cron Reminders, Streak Preservers, Fee Due Alerts      │
│  └── Data Access: Supabase PostgreSQL Relational Adapter Layer              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ PostgreSQL 15 + RLS
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                  DATABASE & AUTH (Supabase Cloud Platform)                  │
│  Tables: profiles, user_preferences, tasks, schedules, schedule_events,    │
│          habits, habit_logs, study_subjects, study_sessions,                │
│          revision_schedules, notifications, documents, expenses,            │
│          ai_conversations                                                   │
│  Security: PostgreSQL Row Level Security (RLS) on all 14 tables             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v3, React Router v6, Axios, Recharts, Lucide React, Web Speech API |
| **Backend** | Node.js, Express 5, REST API Architecture, Joi, Multer, Node-Cron, Tesseract.js |
| **Database & Auth** | **Supabase PostgreSQL 15**, **Supabase Auth**, **Supabase Storage**, **PostgreSQL Row Level Security (RLS)** |
| **AI & NLP** | Intent Parsing Engine, Safe Action Proposals, Spaced Repetition SM-2, Heuristic OCR |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v3, React Router v6, Axios, Recharts, Lucide React, Web Speech API |
| **Backend** | Node.js, Express.js (REST API), JSON Web Tokens (Access + Refresh Rotation), bcryptjs, Joi, Multer |
| **Database** | MongoDB (Local / Atlas), Mongoose ODM with compound indexes |
| **Engines** | Deterministic 288-slot constraint scheduler, SM-2 Spaced Repetition algorithm, Tesseract.js OCR, Node-Cron background workers |

---

## 🚀 Step-by-Step Local Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
* **Node.js:** v18.0.0 or later (v20+ recommended)
* **npm:** v9.0.0 or later
* **MongoDB:** Local MongoDB community server running on port `27017` (or MongoDB Atlas connection string)
* **Git**

### 2. Clone and Navigate
```bash
cd "C:\Users\Mohit Jindal\.gemini\antigravity\scratch\mind-tonic"
```

### 3. Backend Configuration & Setup
1. Navigate to the `server` directory and install dependencies:
   ```bash
   cd server
   npm install
   ```
2. The environment variables are configured in `.env` (a template is provided in `.env.example`):
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mind-tonic
   JWT_SECRET=your_jwt_secret_key_mind_tonic_2026
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_mind_tonic_2026
   JWT_REFRESH_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=uploads
   ```
3. Start the backend development server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   *The API will start at `http://localhost:5000`. Background cron jobs will automatically initialize.*

### 4. Frontend Configuration & Setup
1. Open a new terminal window, navigate to the `client` directory:
   ```bash
   cd client
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will run at `http://localhost:5173`.*

---

## 🔑 Evaluator Demo Account

To facilitate rapid evaluation, the login page (`/login`) includes an instant **"Demo Account (Evaluator)"** button that automatically fills verified credentials:

| Field | Demo Credential |
|---|---|
| **Email** | `alex@example.com` |
| **Password** | `Password123!` |

*(Or register a new account on `/register` in 5 seconds with automatic password hashing and JWT token issuance).*

---

## 📚 REST API Reference Catalog

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Create account with routine preferences
* `POST /api/auth/login` — Authenticate and receive JWT access + refresh cookies
* `POST /api/auth/refresh` — Refresh expired access token
* `POST /api/auth/logout` — Invalidate session
* `GET /api/auth/me` — Get authenticated profile
* `PUT /api/auth/profile` — Update working hours and sleep window preferences

### Smart Timetable (`/api/schedule`)
* `GET /api/schedule/:date` — Get schedule for date
* `POST /api/schedule/generate` — Run 288-slot constraint algorithm
* `PUT /api/schedule/:date/blocks/:blockId` — Update block status (`scheduled`, `completed`)
* `GET /api/schedule/missed/detect` — Scan and detect missed flexible tasks
* `POST /api/schedule/missed/suggest` — Suggest collision-free alternative slots
* `POST /api/schedule/missed/apply` — Reschedule block with strict fixed commitment collision safety

### Tasks & Deliverables (`/api/tasks`)
* `GET /api/tasks` — List tasks with status/priority filtering
* `POST /api/tasks` — Create task (supports fixed commitment times `fixedStartTime` / `fixedEndTime`)
* `PUT /api/tasks/:id` — Update task details
* `PATCH /api/tasks/:id/complete` — Toggle task completion
* `DELETE /api/tasks/:id` — Remove task
* `GET /api/tasks/stats` — Task counts and completion metrics

### Habits (`/api/habits`)
* `GET /api/habits` — List active habits decorated with 7-day mini history
* `POST /api/habits` — Create new habit with reminder time & color
* `POST /api/habits/:id/toggle` — Check in today's habit (updates current & longest streaks)
* `GET /api/habits/stats` — Overall streak statistics

### AI Personal Assistant (`/api/ai`)
* `POST /api/ai/chat` — Conversational natural language query with live context injection
* `POST /api/ai/confirm-action` — Execute confirmed structured mutation
* `POST /api/ai/reject-action` — Cancel proposed mutation

### Learning & SM-2 Spaced Repetition (`/api/learning`)
* `GET /api/learning/subjects` — Get subjects with syllabus progress and study hours
* `POST /api/learning/subjects` — Create subject track
* `POST /api/learning/subjects/:id/topics` — Add topic to syllabus
* `POST /api/learning/subjects/:id/topics/:topicId/review` — Evaluate active recall rating (0 to 5) via SM-2
* `GET /api/learning/reviews/due` — Queue of review cards due today
* `POST /api/learning/sessions` — Log timed study session
* `GET /api/learning/stats` — Aggregated study analytics

### Documents & OCR Vault (`/api/documents`)
* `POST /api/documents/upload` — Multer upload with automatic Tesseract OCR extraction
* `GET /api/documents` — Search and filter documents by category
* `POST /api/documents/:id/ocr` — Reprocess OCR on document
* `DELETE /api/documents/:id` — Remove document and unlink disk file

### Expenses & College Fees (`/api/expenses`)
* `POST /api/expenses` — Create expense (supports college fees, semester, and receipt number)
* `POST /api/expenses/from-ocr` — 1-Click create expense from verified OCR receipt data
* `GET /api/expenses` — Filtered transactions
* `GET /api/expenses/stats` — Monthly totals, college fee totals, and category breakdown

### Notifications & Background Alerts (`/api/notifications`)
* `GET /api/notifications` — List notifications with unread counts
* `PUT /api/notifications/mark-all-read` — Mark all as read
* `PUT /api/notifications/:id/read` — Mark single as read

### Holistic Analytics (`/api/analytics`)
* `GET /api/analytics/overview` — Aggregates composite Productivity Score (0-100%), 7-day focus hours trend, task velocity, habit consistency, and daily AI summary

---

## 📁 Project Directory Structure

```
mind-tonic/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/             # ChatBubble, ActionCard, SuggestionChips
│   │   │   ├── analytics/      # ProductivityScoreCard, FocusTrendChart, AICoachCard
│   │   │   ├── common/         # Button, Input, Modal, Card, Loader, Badge
│   │   │   ├── documents/      # DocumentCard, DocumentUploadModal, OCRReviewModal
│   │   │   ├── expenses/       # ExpenseModal, ExpenseStats, ExpenseCategoryChart
│   │   │   ├── habits/         # HabitCard, HabitModal, HabitProgressChart
│   │   │   ├── layout/         # Sidebar, TopBar, AppLayout, NotificationDropdown
│   │   │   ├── learning/       # SubjectCard, SpacedReviewCard, StudyTimerModal
│   │   │   ├── routine/        # TimetableGrid, ScheduleBlockCard, MissedTaskAlert
│   │   │   └── tasks/          # TaskCard, TaskModal, TaskFilterBar, TaskStatsBar
│   │   ├── hooks/              # Custom React hooks (useAuth, useSchedule, useLearning...)
│   │   ├── pages/              # Route pages (Dashboard, Routine, Learning, Expenses...)
│   │   ├── services/           # Axios API clients for each backend domain
│   │   └── utils/              # Formatters, constants, helpers
│   ├── tailwind.config.js      # Custom theme colors, animations, shadows
│   └── vite.config.js          # Vite build config
│
├── server/                     # Express.js REST API Backend
│   ├── config/                 # Database connection & env variables
│   ├── controllers/            # Route controllers for all domains
│   ├── engines/
│   │   ├── scheduler.js        # 288-Slot Constraint Scheduling Algorithm
│   │   └── spacedRepetition.js # SuperMemo SM-2 Spaced Repetition Formula Engine
│   ├── jobs/                   # Node-cron background workers (reminders, streaks, fees)
│   ├── middleware/             # Auth, validation, Multer upload, error handling
│   ├── models/                 # Mongoose schemas (User, Task, Schedule, Habit...)
│   ├── routes/                 # Express API routes
│   ├── services/               # Core business logic services
│   ├── utils/                  # OCR processor, time utilities, API response helpers
│   ├── validators/             # Joi input validation schemas
│   ├── app.js                  # Express app setup and middleware pipeline
│   └── server.js               # Server entry point & graceful shutdown
│
└── PROGRESS.md                 # Granular phase-by-phase implementation log
```

---

## 🛡️ License & Author

* **Author:** Mohit Jindal
* **Project:** Mind Tonic
* **License:** MIT License
