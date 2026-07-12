# Demo script — TransitOps

## Demo credentials (from seed)

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | fleet@transitops.local | Password123! |
| Driver | driver@transitops.local | Password123! |
| Safety Officer | safety@transitops.local | Password123! |
| Financial Analyst | finance@transitops.local | Password123! |

## 90-second flow (PDF Steps 1–9)

1. Login as Fleet Manager
2. Show Dashboard KPIs (from live DB)
3. Vehicles → Van-05 Available (500 kg)
4. Drivers → Alex valid license
5. Create trip cargo 450 → Dispatch → both On Trip
6. Complete trip → both Available; fuel/cost updates
7. Open maintenance → Van-05 In Shop (gone from dispatch list)
8. **Fail beat:** try dispatch In Shop / overweight → clear validation error
9. Close maintenance → Available again

## Speaking parts (~20–30 sec each)

- **SreeCharan:** Problem (fleet ops) + Postgres schema + API rules in services
- **Bhanu:** Pages + navigation + wiring to API
- **Mohan:** UI system (theme, KPI cards, status badges)
- **Anand:** Form validation + seed data + edge-case errors

## If live demo fails

Reset DB with seed script, narrate expected status transitions, show backup screen recording.
