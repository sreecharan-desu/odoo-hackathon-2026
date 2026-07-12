# TransitOps

**TransitOps** is a fleet operations platform for vehicles, drivers, trips, maintenance, fuel and expenses, and operational KPIs.

Built with **PostgreSQL**, **FastAPI**, and **React** — a custom backend and database, not a Backend-as-a-Service.

| Document | Description |
|----------|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | Data model, business rules, API surface |
| [Demo guide](./docs/DEMO.md) | Sample accounts and walkthrough |
| [Stack](./docs/STACK.md) | Technology choices |

---

## Features

| Area | Capability |
|------|------------|
| Authentication | JWT login, role-based access, protected routes |
| Dashboard | Live KPIs from PostgreSQL |
| Fleet | Vehicle registry with status tracking |
| Drivers | License and availability management |
| Trips | Create, dispatch, complete, or cancel with enforced rules |
| Maintenance | Open and close jobs with automatic status updates |
| Fuel & expenses | Cost logging against vehicles |
| Analytics | Operational summary and CSV export |
| Validation | Server-side schemas and rules, plus client-side checks |

Business rules enforced in the API include no double-booking, cargo within capacity, expired or suspended licenses blocked, and In Shop / Retired vehicles excluded from dispatch.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| API | FastAPI, Pydantic |
| ORM | SQLAlchemy |
| Migrations | Alembic |
| Database | PostgreSQL 16 (Docker) |
| Web | React 19, TypeScript, Vite |
| Security | Password hashing, JWT, RBAC |
| Runtime | Docker Compose (db + api + web) |

---

## Repository layout

```
apps/
  api/app/
    controllers/    # HTTP handlers
    services/       # business rules
    models/         # SQLAlchemy entities
    schemas/        # request/response DTOs
    core/           # config, security, dependencies
  web/src/
    pages/          # application screens
    components/     # layout, UI, forms
    hooks/          # shared React logic
    lib/api/        # HTTP client
    styles/         # design tokens
docker/             # PostgreSQL Compose
docs/               # architecture and guides
scripts/            # local setup helpers
```

Package notes: [apps/api](./apps/api/README.md) · [apps/web](./apps/web/README.md)

---

## Getting started

### Quick start (Docker — recommended)

Requires Docker Desktop (or Docker Engine + Compose).

```bash
git clone https://github.com/sreecharan-desu/odoo-hackathon-2026.git
cd odoo-hackathon-2026
cp .env.example .env
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Web application | http://localhost:8080 |
| API health | http://localhost:8000/api/health |
| OpenAPI docs | http://localhost:8000/docs |

Sample login: `fleet@example.com` / `Password123!`

The API container waits for Postgres, applies Alembic migrations, and seeds demo data when the database is empty.

Stop:

```bash
docker-compose down
```

### Local development (optional)

#### Prerequisites

- Docker (for Postgres)
- Python 3.11+
- Node.js 20 LTS

#### 1. Clone and configure

```bash
git clone https://github.com/sreecharan-desu/odoo-hackathon-2026.git
cd odoo-hackathon-2026
cp .env.example .env
```

#### 2. Database

```bash
docker-compose up -d postgres
```

PostgreSQL listens on host port **5433** by default (see `.env.example`).

First-time setup:

```bash
bash scripts/setup.sh
```

#### 3. API

```bash
cd apps/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload --port 8000
```

#### 4. Web

```bash
cd apps/web
npm install
npm run dev
```

#### 5. Verify

| Service | URL |
|---------|-----|
| Web application | http://localhost:5173 |
| API health | http://localhost:8000/api/health |
| OpenAPI docs | http://localhost:8000/docs |

Make targets: `make up` · `make down` · `make dev-db` · `make dev-api` · `make dev-web`

---

## Sample accounts

After seeding (`python scripts/seed.py`):

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | `fleet@example.com` | `Password123!` |
| Driver | `driver@example.com` | `Password123!` |
| Safety Officer | `safety@example.com` | `Password123!` |
| Financial Analyst | `finance@example.com` | `Password123!` |

Walkthrough: [docs/DEMO.md](./docs/DEMO.md)

---

## Design principles

- Own PostgreSQL schema with foreign keys and uniqueness constraints
- Custom FastAPI services (no Firebase, Supabase, or Atlas as the core backend)
- UI reads and writes through the API against a live database
- Clear validation errors on invalid input at API and UI
- Paginated list APIs with total counts
- Alembic migrations for schema lifecycle
- Modular layered backend and separated frontend concerns
- Hashed passwords, JWT sessions, role-aware endpoints
- One-command Docker Compose deployment for local/demo runs
- Product logic over unrelated tooling

---

## Contributors

| Name | Focus |
|------|--------|
| SreeCharan Desu | Backend, database, integration |
| Bhanu Prakash Alahari | Web application |
| Anand Velpuri | Forms, validation, seed data |
| Naga Mohan Madicharla | Design system and shared UI |

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Demo guide](./docs/DEMO.md)
- [Stack](./docs/STACK.md)
