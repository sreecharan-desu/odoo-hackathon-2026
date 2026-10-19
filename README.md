# odoo-hackathon-2026

transitops: transport operations for vehicles, drivers, dispatch, maintenance, fuel and expenses, with business rules enforced in the api and role-based access for four desks. built in 8 hours at odoo hackathon 2026.

## features

- auth: email/password + jwt. role comes from the account, each role gets its own nav and home.
- dashboard: active / available / in-maintenance vehicles, active and pending trips, drivers on duty, fleet utilization, filters by type, status and region.
- vehicle registry and drivers with license expiry, safety score and status.
- trips: draft → dispatched → completed / cancelled.
- maintenance moves a vehicle to in shop and out of the dispatch pool.
- fuel, expenses and analytics (fuel efficiency, utilization, cost, vehicle roi) with csv export.

rules enforced in the service layer:

- registration numbers are unique
- retired or in-shop vehicles never show up for dispatch
- drivers with an expired license or suspended status can't be assigned
- a vehicle or driver already on a trip can't take another
- cargo weight must not exceed the vehicle's max load
- dispatch sets both to on trip; complete or cancel sets both back to available

| role | focus | demo login |
|---|---|---|
| fleet manager | assets, maintenance, lifecycle | `fleet@example.com` |
| driver | trips, assignments, deliveries | `driver@example.com` |
| safety officer | compliance, license validity, safety scores | `safety@example.com` |
| financial analyst | fuel, expenses, profitability | `finance@example.com` |

password for all: `Password123!`

## stack

postgres 16 + alembic · fastapi + sqlalchemy · react 19 + typescript + vite · docker compose (db + api + web)

```
apps/api/   fastapi: controllers → services → models
apps/web/   react spa (role-scoped nav)
docs/       architecture, demo, stack
k8s/        optional kubernetes manifests (not verified)
```

walkthrough: [docs/DEMO.md](docs/DEMO.md) · architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## run locally

needs docker with compose. no local node, python or postgres required.

```bash
cp .env.example .env
docker compose up --build              # app http://localhost:8080, api docs http://localhost:8080/docs
docker compose down -v && docker compose up --build   # wipe db + reseed
```

busy ports: `WEB_PORT=8081`, `POSTGRES_PORT=5434` or `BACKEND_PORT=8001` before `docker compose up`.

## env

copy `.env.example` to `.env`. the defaults work for local docker.

## performance (measured)

Measured on a single machine (8 vCPU Intel Xeon, 16 GB RAM, Linux) with k6 on the same box, against the API run directly with 4 uvicorn workers and a local PostgreSQL 17 seeded by `scripts/seed.py`. Raw output: [`benchmarks/results-2026-10-19/`](benchmarks/results-2026-10-19/), environment: [`environment.txt`](benchmarks/results-2026-10-19/environment.txt), reproduce: [`benchmarks/run.sh`](benchmarks/run.sh).

| Endpoint (authenticated) | VUs | req/s | p50 | p95 | p99 | Errors |
|---|---|---|---|---|---|---|
| `GET /api/vehicles` | 50 | 906 | 48.2 ms | 146.7 ms | 207.2 ms | 0% |
| `GET /api/trips` | 50 | 1,042 | 41.7 ms | 139.7 ms | 203.0 ms | 0% |
| `GET /api/dashboard/kpis` | 50 | 603 | 82.1 ms | 114.1 ms | 130.1 ms | 0% |
| `POST /api/auth/login` (bcrypt) | 20 | 33 | 603.6 ms | 719.8 ms | 763.2 ms | 0% |
| `GET /api/health` | 50 | 12,311 | 3.7 ms | 6.4 ms | 8.8 ms | 0% |

Functional check: the repo's live integration script (`apps/api/scripts/vast_integration_test.py`) passed 66/66 against the same stack ([output](benchmarks/results-2026-10-19/integration-test.txt)).

## known issues

- no unit-test suite. the only automated check besides ci's import check is the live integration script.
- `ecdsa` (via `python-jose`) has an advisory with no fixed release. moving to `PyJWT` would drop it.
- `npm audit` in `apps/web` reports 8 high and 1 moderate advisories (19 oct 2026).
- the kubernetes manifests have not been exercised.

## team

| member | focus |
|---|---|
| sreecharan desu | backend, database, integration |
| bhanu prakash alahari | web application |
| anand velpuri | forms, validation, seed |
| naga mohan madicharla | design system and ui |

branch and pr workflow: [CONTRIBUTING.md](CONTRIBUTING.md)
