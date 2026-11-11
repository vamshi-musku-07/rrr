# Tic Tac Toe

Simple two-player tic-tac-toe with a React + Tailwind frontend and an Express + MongoDB backend that stores finished games.

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`)

## Backend

```bash
cd backend
npm install
npm run dev
```

API: `http://localhost:5000`

## Frontend

Create `frontend/.env` (already included locally):

```
VITE_API_URL=http://localhost:5000
```

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173` — talks to the backend via `VITE_API_URL`.
