# Demo script — TransitOps

## Demo credentials (from seed)

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | fleet@example.com | Password123! |
| Driver | driver@example.com | Password123! |
| Safety Officer | safety@example.com | Password123! |
| Financial Analyst | finance@example.com | Password123! |

## Seed data highlights

| Entity | Detail |
|--------|--------|
| VAN-05 | 500 kg max load, **Available** — primary demo vehicle |
| TRK-12 | 2000 kg, **In Shop** — Step 8 fail beat (cannot dispatch) |
| VAN-99 | **Retired** — hidden from dispatch pool |
| Alex | Valid license (+365 days), **Available** |
| Expired Sam | Expired license (−10 days) — Step 8 validation error |

## Reset seed

```bash
# DB (port 5433)
POSTGRES_PORT=5433 docker-compose -f docker/compose.yml up -d

cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python scripts/seed.py
```

Swagger: http://127.0.0.1:8000/docs

## 90-second flow (PDF Steps 1–9)

1. Login as **Fleet Manager** (`fleet@example.com` / `Password123!`)
2. Show Dashboard KPIs (from live DB)
3. Vehicles → **Van-05** Available (500 kg)
4. Drivers → **Alex** valid license
5. Create trip cargo **450 kg** → Dispatch → both On Trip
6. Complete trip (odometer + fuel) → both Available again
7. Open maintenance (e.g. Oil Change) → Van-05 **In Shop** (gone from dispatch list)
8. **Fail beat:** try dispatch **TRK-12** (In Shop), cargo **600 kg** on Van-05, or **Expired Sam** → inline/API validation error
9. Close maintenance → Van-05 Available again

## Speaking parts (~20–30 sec each)

- **SreeCharan:** Problem (fleet ops) + Postgres schema + API rules in services
- **Bhanu:** Pages + navigation + wiring to API
- **Mohan:** UI system (theme, KPI cards, status badges)
- **Anand:** Form validation + seed data + edge-case errors (Step 8)

## If live demo fails

Reset DB with seed script, narrate expected status transitions, show backup screen recording.
