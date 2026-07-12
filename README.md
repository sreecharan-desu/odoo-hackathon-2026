# TransitOps

**Smart Transport Operations Platform**

Fleet operations in one place — vehicles, drivers, dispatch, maintenance, fuel/expenses, and live KPIs — with hard business rules enforced in the API.

PostgreSQL · FastAPI · React · Docker Compose

---

## Features

1. **Secure login + RBAC** — Fleet Manager, Driver, Safety Officer, Financial Analyst  
2. **Dashboard** — Fleet KPIs plus filters by vehicle type, status, and region  
3. **Vehicle registry** — Unique plates, load capacity, odometer, status lifecycle  
4. **Driver management** — Licenses, expiry checks, safety scores  
5. **Trip dispatch** — Draft → Dispatched → Completed / Cancelled; create form uses dispatch pool + Available drivers  
6. **Maintenance** — Open a job → vehicle goes **In Shop** (hidden from dispatch)  
7. **Fuel & expenses** — Cost logging and per-vehicle operational totals  
8. **Analytics** — Fuel efficiency (km/L), vehicle ROI, cost views + CSV export  

### Rules the API enforces

No double-booking · cargo ≤ max load · expired/suspended licenses blocked · In Shop / Retired excluded from dispatch · status transitions on dispatch, complete, cancel, and maintenance

---

## Run locally (one command)

**Requirement:** Docker Desktop (or Docker Engine + Compose)

```bash
git clone https://github.com/sreecharan-desu/odoo-hackathon-2026.git
cd odoo-hackathon-2026
cp .env.example .env
docker-compose up --build
```

| | |
|--|--|
| **App** | http://localhost:8080 |
| **API docs** | http://localhost:8000/docs |
| **Login** | `fleet@example.com` / `Password123!` |

That starts Postgres, the API (migrations + seed if empty), and the web UI.

```bash
docker-compose down          # stop
make up                      # same as docker-compose up --build -d
```

If port `8000` is busy:  
`BACKEND_PORT=8001 VITE_API_URL=http://localhost:8001 docker-compose up --build`

---

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | fleet@example.com | Password123! |
| Driver | driver@example.com | Password123! |
| Safety Officer | safety@example.com | Password123! |
| Financial Analyst | finance@example.com | Password123! |

Walkthrough: [docs/DEMO.md](./docs/DEMO.md)

---

## Stack

| Layer | Choice |
|-------|--------|
| Database | PostgreSQL 16 |
| API | FastAPI + SQLAlchemy + Alembic |
| Web | React 19 + TypeScript + Vite |
| Auth | JWT + password hashing + RBAC |
| Deploy locally | Docker Compose |

Own backend and database — no Firebase / Supabase / Atlas.

---

## Project layout

```
apps/api   # FastAPI (controllers → services → models)
apps/web   # React SPA
docker/    # Compose definitions
docs/      # Architecture, demo, stack
```

More detail: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) · [docs/STACK.md](./docs/STACK.md)

---

## Team

| | |
|--|--|
| SreeCharan Desu | Backend, database, integration |
| Bhanu Prakash Alahari | Web application |
| Anand Velpuri | Forms, validation, seed |
| Naga Mohan Madicharla | Design system & UI |

[CONTRIBUTING.md](./CONTRIBUTING.md)
