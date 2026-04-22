## Marathon Event Management (Full Stack)

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
  - `VITE_API_BASE_URL=https://<your-backend>.up.railway.app`
- Set `backend/.env` with your frontend origin:
  - `FRONTEND_ORIGIN=https://<your-user>.github.io`
- If you deploy multiple frontend origins, use:
  - `FRONTEND_ORIGINS=https://<your-user>.github.io,https://<custom-domain>`
- If requests still fail due CORS in production, keep relaxed mode:
  - `CORS_STRICT=false` (default, allows all origins)
  - Only set `CORS_STRICT=true` when your allowlist values are finalized.

### Default behavior
- First registered user can be made admin by setting `BOOTSTRAP_ADMIN_EMAIL` in `backend/.env` (see template).
- Registration is simple: **email + username + password**. Login uses **username + password** (username is unique).

hvvp nasw quqy ilaq
