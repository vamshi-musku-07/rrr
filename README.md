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

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173` (proxies `/api` to the backend)
