# TransitOps

**Smart Transport Operations Platform** — digitize vehicle, driver, dispatch, maintenance, and expense management with enforced business rules and live operational insight.

Built with **PostgreSQL**, **FastAPI**, and **React** (custom backend and database — no Backend-as-a-Service).

| Document | Description |
|----------|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | Data model, business rules, API surface |
| [Demo guide](./docs/DEMO.md) | Sample accounts and end-to-end walkthrough |
| [Stack](./docs/STACK.md) | Technology choices |

---

## What it solves

Logistics teams often run fleets from spreadsheets and logbooks. That leads to double-booked vehicles, expired licenses on the road, missed maintenance, and weak cost visibility.

TransitOps is a single app for the full operations lifecycle: register assets and drivers → dispatch trips with validation → log fuel and maintenance → review KPIs and costs.

### Roles

| Role | Focus |
|------|--------|
| Fleet Manager | Fleet assets, dispatch, maintenance, operational efficiency |
| Driver | Trip creation and active deliveries |
| Safety Officer | License compliance and safety scores |
| Financial Analyst | Fuel, maintenance, expenses, and cost reporting |

---

## Product modules

| Module | Capabilities |
|--------|----------------|
| Authentication | Secure email/password login, JWT sessions, RBAC, protected routes |
| Dashboard | Live KPIs: active / available vehicles, in shop, active & pending trips, drivers on duty, fleet utilization % |
| Vehicle registry | Unique registration number, model, type, max load, odometer, acquisition cost, region, status |
| Driver management | License number/category/expiry, contact, safety score, status |
| Trip management | Source, destination, vehicle, driver, cargo weight, distance — Draft → Dispatched → Completed / Cancelled |
| Maintenance | Open/close logs; open job moves vehicle to **In Shop** (removed from dispatch) |
| Fuel & expenses | Fuel liters/cost and other costs (tolls, etc.); per-vehicle operational cost |
| Analytics & reports | Cost breakdown visuals, CSV export of operational costs |
| Validation | Pydantic + service rules on the API; form validators on the web |

Vehicle statuses: **Available**, **On Trip**, **In Shop**, **Retired**  
Driver statuses: **Available**, **On Trip**, **Off Duty**, **Suspended**

---

## Business rules (enforced in the API)

1. Vehicle registration numbers are unique  
2. Retired or In Shop vehicles never enter the dispatch pool  
3. Drivers with expired licenses or Suspended status cannot be assigned  
4. A vehicle or driver already On Trip cannot take another trip  
5. Cargo weight must not exceed vehicle max load  
6. Dispatch sets vehicle and driver to On Trip  
7. Complete or cancel restores both to Available  
8. Opening maintenance sets the vehicle to In Shop; closing restores Available (unless Retired)

---

## Tech stack

| Layer | Technology |
|-------|------------|
| API | FastAPI, Pydantic |
| ORM | SQLAlchemy |
| Migrations | Alembic |
| Database | PostgreSQL 16 |
| Web | React 19, TypeScript, Vite |
| Security | Password hashing, JWT, RBAC |
| Runtime | Docker Compose (Postgres + API + web) |

List APIs are paginated (`items`, `total`, `limit`, `offset`).

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
docker/             # Compose stack
docs/               # architecture and guides
scripts/            # local setup helpers
```

Package notes: [apps/api](./apps/api/README.md) · [apps/web](./apps/web/README.md)

---

## Getting started

### Quick start (Docker — recommended)

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

Login: `fleet@example.com` / `Password123!`

The API waits for Postgres, applies Alembic migrations, and seeds demo data when the database is empty.

If port **8000** is already in use on your machine:

```bash
BACKEND_PORT=8001 VITE_API_URL=http://localhost:8001 docker-compose up --build
```

Stop:

```bash
docker-compose down
```

### Local development (optional)

**Prerequisites:** Docker (Postgres), Python 3.11+, Node.js 20 LTS

```bash
cp .env.example .env
docker-compose up -d postgres

cd apps/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload --port 8000

# new terminal
cd apps/web && npm install && npm run dev
```

| Service | URL |
|---------|-----|
| Web (Vite) | http://localhost:5173 |
| API | http://localhost:8000 |

Make targets: `make up` · `make down` · `make seed` · `make dev-api` · `make dev-web`

---

## Sample accounts

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | `fleet@example.com` | `Password123!` |
| Driver | `driver@example.com` | `Password123!` |
| Safety Officer | `safety@example.com` | `Password123!` |
| Financial Analyst | `finance@example.com` | `Password123!` |

Seed includes a full fleet plus fixed demo rows (Van-05, Alex, In Shop / expired-license cases). Full walkthrough: [docs/DEMO.md](./docs/DEMO.md)

---

## Design principles

- Owned PostgreSQL schema with constraints and foreign keys  
- Custom FastAPI services — no Firebase / Supabase / Atlas as the core backend  
- Dynamic data end-to-end (UI ↔ API ↔ database)  
- Clear validation errors on invalid input  
- Modular layered API and separated frontend concerns  
- Paginated lists, Alembic migrations, Docker Compose for one-command runs  

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
