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

### Default behavior
- First registered user can be made admin by setting `BOOTSTRAP_ADMIN_EMAIL` in `backend/.env` (see template).
- Registration is simple: **email + username + password**. Login uses **username + password** (username is unique).

hvvp nasw quqy ilaq
