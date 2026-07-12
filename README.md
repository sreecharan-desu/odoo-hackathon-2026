# Odoo Hackathon 2026

We are building **TransitOps** — a smart transport operations platform (vehicles, drivers, trips, maintenance, fuel, KPIs) for the **Odoo Hackathon 2026** virtual round. Four developers, one monorepo: **understand the workflow, then ship something that works locally and demos cleanly.**

Architecture and ownership: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) · Tasks: [docs/TEAM_TASKS.md](./docs/TEAM_TASKS.md) · Demo: [docs/DEMO.md](./docs/DEMO.md)

---

## What we are building

TransitOps digitizes fleet operations with hard business rules (status transitions, license checks, load capacity). Goal: one complete end-to-end flow with real Postgres data, dual-side validation, and a 90-second demo — not ten half-finished features.

---

## Our approach

- **Custom API + PostgreSQL** running locally — our own backend, our own schema
- **Real data** in the database — not a UI wired to static JSON
- **Validation on both sides** — the API and the web app handle bad input gracefully
- **Layered codebase** — controllers, services, and models on the backend; pages, components, and hooks on the frontend
- **Shared Git workflow** — feature branches, pull requests, and commits from every team member

We will only add extra tooling (cache, search, etc.) if the problem statement calls for it. Decisions are tracked in [docs/STACK.md](./docs/STACK.md).

---

## Tech stack

### Backend
- **FastAPI** — API layer with Pydantic validation
- **SQLAlchemy** — relational models and queries
- **Alembic** — migrations (added when the schema is finalised on hackathon day)

### Frontend
- **React 19 + TypeScript** — UI components and pages
- **Vite** — fast local development

### Data & infrastructure
- **PostgreSQL 16** — primary database, run locally via Docker
- **Docker Compose** — one-command database setup

---

## Project structure

```
apps/
  api/app/
    controllers/    # HTTP handlers
    services/       # business logic
    models/         # database entities
    schemas/        # request/response validation
    core/           # config, dependencies, security
    utils/          # shared helpers
  web/src/
    components/     # ui, layout, forms
    pages/          # application screens
    hooks/          # shared React logic
    lib/api/        # HTTP client
    types/          # TypeScript interfaces
docker/             # PostgreSQL compose file
docs/               # architecture & stack decisions
scripts/            # setup helpers
```

Deeper guides: [apps/api](./apps/api/README.md) · [apps/web](./apps/web/README.md)

---

## Getting started

### Prerequisites

- Docker Desktop
- Python 3.11+
- Node.js 20 LTS

### Local development

**1. Clone the repository**

```bash
git clone https://github.com/sreecharan-desu/odoo-hackathon-2026.git
cd odoo-hackathon-2026
```

**2. Environment setup**

```bash
cp .env.example .env
```

**3. Start the database**

```bash
docker compose up -d
```

Or run the full first-time setup:

```bash
bash scripts/setup.sh
```

**4. Start the API** *(terminal 1)*

```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate   # first time
pip install -r requirements.txt
python scripts/seed.py
uvicorn app.main:app --reload --port 8000
```

Demo login after seed: `fleet@example.com` / `Password123!`

**5. Start the web app** *(terminal 2)*

```bash
cd apps/web
npm install
npm run dev
```

**6. Verify**

| Service | URL |
|---------|-----|
| API health | http://localhost:8000/api/health |
| API docs | http://localhost:8000/docs |
| Web app | http://localhost:5173 |

> Postgres is mapped to host port **5433** by default (see `.env.example`) so it does not clash with other local Postgres instances.

Makefile shortcuts: `make dev-db` · `make dev-api` · `make dev-web`

---

## How we meet Odoo evaluation criteria

| Criterion | What we built |
|-----------|----------------|
| Database design | PostgreSQL with normalized fleet tables (vehicles, drivers, trips, maintenance, fuel, expenses) and FK/unique constraints |
| Own backend APIs | Custom FastAPI — no Firebase / Supabase / MongoDB Atlas |
| Dynamic data | Seed script + live CRUD; UI reads from the API, not static JSON |
| Input validation | Pydantic schemas + service-layer business rules with clear error messages; frontend validators |
| Collaborative Git | Four contributors; feature branches and PRs from each member |
| Clean UI | TransitOps mockup-aligned shell (sidebar, KPIs, status badges) |
| Modularity | Layered API (`controllers` / `services` / `models` / `schemas`) and owned frontend folders |
| Security | Password hashing, JWT auth, role-based access |
| Logic / attention to detail | Mandatory fleet rules (capacity, license expiry, status transitions) enforced in services |
| No trendy fluff | No AI / blockchain — product logic only |

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) and [docs/DEMO.md](./docs/DEMO.md).

---

## Team

| Name | Role |
|------|------|
| **SreeCharan Desu** | Backend, database, integration |
| **Bhanu Prakash Alahari** | Frontend pages, layout, API wiring |
| **Anand Velpuri** | Validation, seed data, demo |
| **Naga Mohan Madicharla** | Theme, styles, shared UI components |

We use pull requests and review each other's work before merging to `main`. See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) — data model and API contract
- [Team tasks](./docs/TEAM_TASKS.md) — ownership and screens
- [Demo script](./docs/DEMO.md) — 90-second flow + credentials
- [Stack decisions](./docs/STACK.md) — when and why we add new technology

---

Built with care for the **Odoo Hackathon 2026** virtual round.
