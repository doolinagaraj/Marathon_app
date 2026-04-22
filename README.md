## Evenroth Running Club - Event Management System

Monorepo:
- `backend/`: Node.js + Express + MongoDB REST API (JWT auth, roles, tracking)
- `frontend/`: React + Material UI

### Quick start (Docker)

1) Copy env templates:
- `backend/.env.example` → `backend/.env`
- `frontend/.env.example` → `frontend/.env`

2) Start:

```bash
docker compose up --build
```

3) Open:
- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:4000/health`

### Frontend + backend connection notes (important)
- Set `frontend/.env` with a fully-qualified backend URL:
  - `VITE_API_BASE_URL=https://marathonapp-production.up.railway.app`
- Set `backend/.env` with your frontend origin:
  - `FRONTEND_ORIGIN=https://doolinagaraj.github.io`
- If you deploy multiple frontend origins, use:
  - `FRONTEND_ORIGINS=https://doolinagaraj.github.io,http://localhost:5173`
- In Railway backend variables, keep `NODE_ENV=production` and set:
  - `FRONTEND_ORIGIN=https://doolinagaraj.github.io`
  - `FRONTEND_ORIGINS=https://doolinagaraj.github.io`
- Never commit real credentials (SMTP passwords, admin seed passwords, JWT secrets); keep them only in `.env`/deployment secrets.


### Default behavior
- First registered user can be made admin by setting `BOOTSTRAP_ADMIN_EMAIL` in `backend/.env` (see template).
- Registration is simple: **email + username + password**. Login uses **username + password** (username is unique).
