# Architecture — TransitOps

TransitOps is a transport operations platform covering vehicles, drivers, trip dispatch, maintenance, fuel and expenses, and operational reporting.

The system is a modular monorepo: **PostgreSQL** for persistence, **FastAPI** for the API, and **React** for the web client.

## Core user flow

1. Sign in as a fleet manager
2. Register a vehicle (e.g. Van-05, max load 500 kg) → Available
3. Register a driver with a valid license → Available
4. Create a trip with cargo within capacity → dispatch
5. Vehicle and driver move to On Trip
6. Complete the trip (odometer + fuel) → both return to Available
7. Open a maintenance job → vehicle moves to In Shop (excluded from dispatch)
8. Dashboard and reports reflect live costs and activity
9. Invalid dispatch attempts (overweight, expired license, vehicle in shop) return clear errors

## Data model

| Table | Key fields | Notes |
|-------|------------|-------|
| users | id, email, name, password_hash, role, created_at | Roles: `fleet_manager`, `driver`, `safety_officer`, `financial_analyst` |
| vehicles | id, registration_number (unique), name, type, max_load_kg, odometer, acquisition_cost, status, region | Status: Available, On Trip, In Shop, Retired |
| drivers | id, name, license_number, license_category, license_expiry, contact, safety_score, status | Status: Available, On Trip, Off Duty, Suspended |
| trips | id, source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status, created_by, final_odometer, fuel_consumed | Status: Draft, Dispatched, Completed, Cancelled |
| maintenance_logs | id, vehicle_id, title, description, status, opened_at, closed_at | Open → In Shop; close → Available (unless Retired) |
| fuel_logs | id, vehicle_id, liters, cost, logged_at, trip_id (nullable) | |
| expenses | id, vehicle_id, category, amount, note, logged_at | |

## Business rules

Enforced in the service layer:

1. Vehicle `registration_number` is unique
2. Retired or In Shop vehicles are excluded from the dispatch pool
3. Drivers with expired licenses or Suspended status cannot be assigned
4. A vehicle or driver already On Trip cannot take another trip
5. Cargo weight must be ≤ vehicle `max_load_kg`
6. Dispatch sets vehicle and driver to On Trip
7. Complete or cancel returns both to Available
8. Opening maintenance sets the vehicle to In Shop; closing restores Available

## API surface

| Method | Path |
|--------|------|
| GET | `/api/health` |
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| GET | `/api/auth/me` |
| GET, POST | `/api/vehicles` |
| GET | `/api/vehicles/dispatch-pool` |
| GET, PATCH | `/api/vehicles/{id}` |
| GET, POST | `/api/drivers` |
| GET, PATCH | `/api/drivers/{id}` |
| GET, POST | `/api/trips` |
| POST | `/api/trips/{id}/dispatch` |
| POST | `/api/trips/{id}/complete` |
| POST | `/api/trips/{id}/cancel` |
| GET, POST | `/api/maintenance` |
| POST | `/api/maintenance/{id}/close` |
| GET, POST | `/api/fuel-logs` |
| GET, POST | `/api/expenses` |
| GET | `/api/dashboard/kpis` |
| GET | `/api/vehicles/{id}/operational-cost` |
| GET | `/api/reports/operational.csv` |

Interactive docs: `http://localhost:8000/docs`

List endpoints return a paginated envelope:

```json
{ "items": [], "total": 0, "limit": 25, "offset": 0 }
```

Query params: `limit` (1–100, default 25), `offset` (default 0). Filters such as `status` still apply.

## Backend structure

| Folder | Responsibility |
|--------|----------------|
| `controllers/` | HTTP handlers |
| `services/` | Business logic and rules |
| `models/` | ORM entities |
| `schemas/` | Request and response DTOs |
| `core/` | Configuration, security, dependencies |
| `utils/` | Shared helpers |
| `exceptions/` | Error types and handlers |

## Frontend structure

| Folder | Responsibility |
|--------|----------------|
| `pages/` | Route-level screens |
| `components/layout/` | Application shell and navigation |
| `components/ui/` | Shared UI primitives |
| `components/forms/` | Validated form fields |
| `hooks/` | Auth and data hooks |
| `lib/api/` | HTTP client and endpoint map |
| `lib/validators.ts` | Client-side validation helpers |
| `types/` | Shared TypeScript contracts |
| `styles/` | Design tokens and global styles |
| `constants/` | Routes and status maps |

## Out of scope (for now)

PDF export, email reminders, document uploads, dark-mode toggle, and heavy chart libraries are deferred until the core flow is stable.

## Demo walkthrough

See [DEMO.md](./DEMO.md).
