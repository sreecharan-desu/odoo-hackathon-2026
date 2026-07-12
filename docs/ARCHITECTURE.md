# Architecture — TransitOps

> Team lead owns this file. Others request changes via PR.
> **Problem locked:** TransitOps — Smart Transport Operations Platform

## Problem summary

TransitOps is an end-to-end transport operations platform: vehicles, drivers, dispatch (trips), maintenance, fuel/expenses, and operational KPIs. It digitizes fleet workflows with hard business rules (no double-booking vehicles/drivers, license checks, load capacity, automatic status transitions).

We are building a simplified **Odoo Fleet–style** app: own PostgreSQL + FastAPI backend, React UI, no BaaS, no AI bolted on.

## MVP user flow (demo = PDF Steps 1–9)

1. Login as Fleet Manager
2. Register vehicle `Van-05` (max load 500 kg) → Available
3. Register driver `Alex` with valid license → Available
4. Create trip (cargo 450 kg) → validates 450 ≤ 500 → Dispatch
5. Vehicle + driver become On Trip
6. Complete trip (odometer + fuel) → both Available again
7. Open maintenance (e.g. Oil Change) → vehicle In Shop (hidden from dispatch)
8. Dashboard/reports show cost + fuel efficiency from live DB
9. **Validation beat:** try illegal dispatch (overweight / expired license / In Shop vehicle) → clear error

## Deferred (do not start until MVP is green)

- PDF export, email license reminders, document uploads, dark mode toggle, heavy chart libraries

## Database entities

| Table | Key fields | Notes |
|-------|------------|-------|
| users | id, email, name, password_hash, role, created_at | roles: `fleet_manager`, `driver`, `safety_officer`, `financial_analyst` |
| vehicles | id, registration_number (unique), name, type, max_load_kg, odometer, acquisition_cost, status, region | status: Available, On Trip, In Shop, Retired |
| drivers | id, name, license_number, license_category, license_expiry, contact, safety_score, status | status: Available, On Trip, Off Duty, Suspended |
| trips | id, source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status, created_by, final_odometer, fuel_consumed | status: Draft, Dispatched, Completed, Cancelled |
| maintenance_logs | id, vehicle_id, title, description, status, opened_at, closed_at | open → vehicle In Shop; close → Available (unless Retired) |
| fuel_logs | id, vehicle_id, liters, cost, logged_at, trip_id nullable | |
| expenses | id, vehicle_id, category, amount, note, logged_at | tolls, etc. |

## Mandatory business rules (enforce in `services/`)

1. Vehicle registration_number unique
2. Retired / In Shop vehicles never in dispatch pool
3. Expired license or Suspended driver cannot be assigned
4. Vehicle or driver already On Trip cannot take another trip
5. Cargo weight ≤ vehicle max_load_kg
6. Dispatch → vehicle + driver On Trip
7. Complete / Cancel dispatched → both Available
8. Open maintenance → vehicle In Shop; close maintenance → Available

## API contract (initial)

| Method | Path | Owner | Status |
|--------|------|-------|--------|
| GET | /api/health | SreeCharan | done |
| POST | /api/auth/login | SreeCharan | done |
| POST | /api/auth/register | SreeCharan | done |
| GET/POST | /api/vehicles | SreeCharan | done |
| GET/PATCH | /api/vehicles/{id} | SreeCharan | done |
| GET/POST | /api/drivers | SreeCharan | done |
| GET/PATCH | /api/drivers/{id} | SreeCharan | done |
| GET/POST | /api/trips | SreeCharan | done |
| POST | /api/trips/{id}/dispatch | SreeCharan | done |
| POST | /api/trips/{id}/complete | SreeCharan | done |
| POST | /api/trips/{id}/cancel | SreeCharan | done |
| GET/POST | /api/maintenance | SreeCharan | done |
| POST | /api/maintenance/{id}/close | SreeCharan | done |
| GET/POST | /api/fuel-logs | SreeCharan | done |
| GET | /api/dashboard/kpis | SreeCharan | done |
| GET | /api/reports/operational.csv | SreeCharan | done |

## Monorepo ownership

| Member | Paths |
|--------|-------|
| SreeCharan | `apps/api/` (all layers), `docker/`, `docs/ARCHITECTURE.md`, `docs/STACK.md` |
| Bhanu | `apps/web/src/pages/`, `apps/web/src/App.tsx`, `apps/web/src/hooks/`, `apps/web/src/lib/api/`, `apps/web/src/components/layout/`, `apps/web/src/types/` |
| Anand | `apps/web/src/components/forms/`, `apps/web/src/lib/validators.ts`, `apps/api/scripts/`, `docs/DEMO.md` |
| Mohan | `apps/web/src/styles/`, `apps/web/src/components/ui/`, `apps/web/src/constants/` |

### Backend layers (lead)

| Folder | Purpose |
|--------|---------|
| `controllers/` | HTTP handlers |
| `services/` | Business logic + rules |
| `models/` | DB tables |
| `schemas/` | Pydantic DTOs |
| `core/` | Config, deps, security |
| `utils/` | Helpers |
| `exceptions/` | Error handling |

### Frontend layers

| Folder | Owner | Purpose |
|--------|-------|---------|
| `components/ui/` | Mohan | Buttons, cards, spinners, badges, KPI tiles |
| `styles/` | Mohan | Theme tokens, visual system |
| `constants/` | Mohan | Routes, status labels/colors |
| `components/layout/` | Bhanu | Header, shell, nav |
| `components/forms/` | Anand | Validated inputs |
| `pages/` | Bhanu | Login, Dashboard, Vehicles, Drivers, Trips, Maintenance |
| `hooks/` | Bhanu | `useAsync`, data hooks |
| `lib/api/` | Bhanu | HTTP client + endpoints |
| `types/` | Bhanu | TS types matching API |

## How we meet Odoo criteria

| Their priority | Our proof |
|----------------|-----------|
| Own DB + APIs | Postgres + FastAPI (no Firebase/Supabase) |
| From scratch | No third-party business APIs |
| Dynamic data | Seed + live CRUD; UI never depends on static JSON |
| Validation | Pydantic + service errors + Anand form validators |
| Collaborative Git | 4 contributors; `feat/<name>/...` PRs |
| Clean UI | Mohan design system + Bhanu pages |
| Team presentation | DEMO.md — each person speaks |
| No fake trendy tech | No AI/blockchain |

## Demo script (90 seconds)

See [docs/DEMO.md](./DEMO.md).
