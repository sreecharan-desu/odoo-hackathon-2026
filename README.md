# TransitOps — Odoo Hackathon 2026

**TransitOps** is a smart transport operations platform: vehicles, drivers, trips, maintenance, fuel/expenses, and live KPIs. Built for the **Odoo Hackathon 2026** virtual round — own PostgreSQL + FastAPI backend, React UI, no BaaS, no AI bolted on.

Architecture: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) · Tasks: [docs/TEAM_TASKS.md](./docs/TEAM_TASKS.md) · Demo: [docs/DEMO.md](./docs/DEMO.md)

---

## Features

| Area | What works |
|------|------------|
| Auth | JWT login, role-aware session, protected routes |
| Dashboard | Live KPIs from Postgres (`/api/dashboard/kpis`) |
| Fleet | Register / list vehicles with status badges |
| Drivers | Register / list drivers with license checks |
| Trips | Create → dispatch → complete / cancel with business rules |
| Maintenance | Open / close jobs (vehicle goes In Shop / Available) |
| Fuel & expenses | Log fuel and costs against vehicles |
| Analytics | Operational view + CSV report endpoint |
| Validation | Pydantic + service rules + frontend validators |

Hard rules enforced in the API: no double-booking, cargo ≤ max load, expired/suspended licenses blocked, In Shop / Retired vehicles excluded from dispatch.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| API | FastAPI + Pydantic |
| ORM | SQLAlchemy |
| DB | PostgreSQL 16 (Docker) |
| Web | React 19 + TypeScript + Vite |
| Auth | Password hashing + JWT + RBAC |

---

## Project structure

```
apps/
  api/app/
    controllers/    # HTTP handlers
    services/       # business rules
    models/         # SQLAlchemy entities
    schemas/        # request/response DTOs
    core/           # config, security, deps
  web/src/
    pages/          # Login, Dashboard, Fleet, Drivers, Trips, …
    components/     # layout, ui, forms
    hooks/          # auth + data hooks
    lib/api/        # HTTP client + endpoints
    styles/         # theme tokens
docker/             # Postgres compose
docs/               # architecture, demo, tasks
scripts/            # setup helpers
```

Guides: [apps/api](./apps/api/README.md) · [apps/web](./apps/web/README.md)

---

## Getting started

### Prerequisites

- Docker Desktop
- Python 3.11+
- Node.js 20 LTS

### 1. Clone

```bash
git clone https://github.com/sreecharan-desu/odoo-hackathon-2026.git
cd odoo-hackathon-2026
cp .env.example .env
```

### 2. Database

```bash
docker compose up -d
```

Postgres is on host port **5433** by default (see `.env.example`) so it does not clash with other local instances.

Or first-time everything:

```bash
bash scripts/setup.sh
```

### 3. API *(terminal 1)*

```bash
cd apps/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python scripts/seed.py
uvicorn app.main:app --reload --port 8000
```

### 4. Web *(terminal 2)*

```bash
cd apps/web
npm install
npm run dev
```

### 5. Open

| Service | URL |
|---------|-----|
| Web app | http://localhost:5173 |
| API health | http://localhost:8000/api/health |
| API docs | http://localhost:8000/docs |

Makefile: `make dev-db` · `make dev-api` · `make dev-web`

---

## Demo login

After `python scripts/seed.py`:

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | `fleet@example.com` | `Password123!` |
| Driver | `driver@example.com` | `Password123!` |
| Safety Officer | `safety@example.com` | `Password123!` |
| Financial Analyst | `finance@example.com` | `Password123!` |

90-second flow: [docs/DEMO.md](./docs/DEMO.md)

---

## How we meet Odoo evaluation criteria

| Criterion | What we built |
|-----------|----------------|
| Database design | Normalized Postgres tables (users, vehicles, drivers, trips, maintenance, fuel, expenses) with FK/unique constraints |
| Own backend APIs | Custom FastAPI — no Firebase / Supabase / MongoDB Atlas |
| Dynamic data | Seed + live CRUD; UI reads from the API, not static JSON |
| Input validation | Pydantic schemas + service-layer rules; frontend validators |
| Collaborative Git | Four contributors; feature branches and PRs from each member |
| Clean UI | Theme tokens, KPI cards, status badges, app shell + pages |
| Modularity | Layered API + owned frontend folders |
| Security | Password hashing, JWT, role-based access |
| Logic / attention to detail | Capacity, license expiry, and status transitions enforced in services |
| No trendy fluff | No AI / blockchain — product logic only |

---

## Team

| Name | Role |
|------|------|
| **SreeCharan Desu** | Backend, database, integration |
| **Bhanu Prakash Alahari** | Frontend pages, layout, API wiring |
| **Anand Velpuri** | Validation, seed data, demo |
| **Naga Mohan Madicharla** | Theme, styles, shared UI components |

PRs and reviews before merge to `main` — see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) — data model and API contract
- [Team tasks](./docs/TEAM_TASKS.md) — ownership and screens
- [Demo script](./docs/DEMO.md) — 90-second flow + credentials
- [Stack decisions](./docs/STACK.md) — when and why we add technology

---

Built for the **Odoo Hackathon 2026** virtual round.
