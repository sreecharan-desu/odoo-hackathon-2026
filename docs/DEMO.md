# Demo guide — TransitOps

## Sample accounts

Created by `apps/api/scripts/seed.py`:

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | fleet@example.com | Password123! |
| Driver | driver@example.com | Password123! |
| Safety Officer | safety@example.com | Password123! |
| Financial Analyst | finance@example.com | Password123! |

Money amounts in the UI are **INR (₹)**. ROI uses estimated revenue of ₹40 per completed trip km.

## Seeded data

The seed loads a full fleet (60+ vehicles, 40+ drivers, 150+ trips, plus fuel, maintenance, and expenses). Fixed demo rows:

| Entity | Detail |
|--------|--------|
| VAN-05 | 500 kg max load, Available — primary demo vehicle |
| TRK-12 | 2000 kg, In Shop — cannot be dispatched |
| VAN-99 | Retired — excluded from the dispatch pool |
| Alex | Valid license, Available |
| Expired Sam | Expired license — assignment rejected by validation |

## Reset the database

```bash
docker compose down -v
docker compose up --build
```

Then open http://localhost:8080 and log in with `fleet@example.com` / `Password123!`.

API docs: http://localhost:8080/docs  
*(Swagger is also on http://localhost:8000/docs if that port is free.)*

## Suggested walkthrough

1. Sign in as Fleet Manager (`fleet@example.com` / `Password123!`)
2. Open the dashboard and confirm live KPIs
3. Fleet → Van-05 Available (500 kg)
4. Drivers → Alex with a valid license
5. Create a trip with cargo **450 kg** → Dispatch → both On Trip
6. Complete the trip (odometer + fuel) → both Available
7. Open maintenance on Van-05 → In Shop (removed from dispatch options)
8. Attempt an invalid dispatch (TRK-12, overweight cargo, or Expired Sam) → clear validation error
9. Close maintenance → Van-05 Available again

## If the live demo needs a reset

Re-run the seed script, then continue from step 1.
