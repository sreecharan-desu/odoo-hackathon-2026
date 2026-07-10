# Odoo Hackathon 2026

We are building our virtual-round submission for **Odoo Hackathon 2026** — four developers, one monorepo, and a simple rule we agreed on early: **understand the problem first, then ship something that works locally and that we can demo with confidence.**

The problem statement goes live on **12 July**. Until then, this repository is our foundation — PostgreSQL, a custom API, and a React client — structured the way we would run a small production product, not a last-minute demo.

---

## What we are building

The product scope will be defined when the problem statement is released. Our goal is a complete end-to-end flow: real data in the database, validated inputs, a clear UI, and a demo we can explain without hiding behind slides.

We would rather ship **one flow done well** than ten features half-finished.

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
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

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
| Web app | http://localhost:5173 |

Makefile shortcuts: `make dev-db` · `make dev-api` · `make dev-web`

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

- [Architecture](./docs/ARCHITECTURE.md) — data model and API contract *(updated on hackathon day)*
- [Stack decisions](./docs/STACK.md) — when and why we add new technology

---

Built with care for the **Odoo Hackathon 2026** virtual round.
