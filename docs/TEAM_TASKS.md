# Team tasks — TransitOps (virtual round)

> Keep this local until lead says push. Share tasks via WhatsApp / instruction files.

Everyone: work from shared zip or when docs are on `main`. Branch `feat/<name>/<task>` → PR → SreeCharan merges. Cursor attribution OFF.

## Official UI reference (Excalidraw / PDF mockup)

Sidebar + top search. Build these screens (MVP first; Settings RBAC matrix is thin):

| # | Screen | Owner | Notes |
|---|--------|-------|-------|
| 0 | Auth / Sign in | Bhanu + Anand forms | Left brand panel lists roles; right email/password |
| 1 | Dashboard | Bhanu + Mohan KPIs | Cards: Active Vehicles, On-Trip, In Maintenance, Idle, Safety Alerts; Recent Trips table; Vehicle Status chart (simple bars OK) |
| 2 | Fleet / Vehicle Registry | Bhanu | Table: ID, Model, Plate, Capacity, Status, Actions + Add Vehicle |
| 3 | Drivers & Safety | Bhanu | Name, License, Expiry, Safety Score, Status + Add Driver |
| 4 | Trip Dispatcher | Bhanu + Anand | Assign vehicle/driver, cargo, route; stepper Draft→Dispatched→Completed |
| 5 | Maintenance | Bhanu | Vehicle, type, date, cost, status |
| 6 | Fuel & Expenses | Bhanu | Date, vehicle, category, amount (receipt optional later) |
| 7 | Analytics | Bhanu + Mohan | Fuel efficiency + cost summary; CSV download; one chart |
| 8 | Settings / RBAC | Defer or thin | Seeded roles enough for MVP; full permission matrix later |

Status colors (Mohan constants): Available/Active=green, On-Trip=blue, Maintenance/Alerts=orange-red.

| Member | Own these paths | Build first |
|--------|-----------------|-------------|
| **SreeCharan** | `apps/api/`, `docker/`, `docs/ARCHITECTURE.md` | Models, auth, vehicles/drivers/trips/maintenance/fuel APIs + rules |
| **Bhanu** | `pages/`, `App.tsx`, `hooks/`, `lib/api/`, `layout/` (sidebar), `types/` | Shell matching mockup; screens 0–6; wire API |
| **Mohan** | `styles/`, `components/ui/`, `constants/` | Theme, Sidebar styles, KpiCard, StatusBadge, Table, Chart-lite |
| **Anand** | `components/forms/`, `lib/validators.ts`, `apps/api/scripts/`, `docs/DEMO.md` | Form fields + validators; seed Steps 1–9 |

## Demo spine

See [DEMO.md](./DEMO.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).
