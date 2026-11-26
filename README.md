# 🧠 Mind Tonic

**AI-Powered Personal Routine & Productivity Management System**

Mind Tonic is a full-stack web application that helps users manage their daily schedules, tasks, habits, learning goals, reminders, documents, and expenses — all powered by AI.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React.js, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js, REST API, JWT Auth, bcrypt |
| **Database** | MongoDB, Mongoose |
| **AI** | LLM API Integration (OpenAI / Gemini) |

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Git

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd mind-tonic

# Setup environment
cp .env.example .env
# Edit .env with your settings

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Development

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## Project Structure

```
mind-tonic/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level pages
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API client modules
│   │   └── utils/       # Utilities
│   └── ...
├── server/          # Express backend
│   ├── config/      # DB, env, CORS config
│   ├── middleware/   # Auth, validation, error handling
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API routes
│   ├── controllers/ # Request handlers
│   ├── services/    # Business logic
│   ├── engines/     # Scheduling & spaced-repetition algorithms
│   └── utils/       # Helpers
└── ...
```

## License

MIT
