# Team tasks — TransitOps (virtual round)

Everyone: `git pull origin main` → branch `feat/<name>/<task>` → PR → SreeCharan merges. Cursor attribution OFF.

| Member | Own these paths | Build first |
|--------|-----------------|-------------|
| **SreeCharan** | `apps/api/`, `docker/`, `docs/ARCHITECTURE.md` | Models, auth, vehicles/drivers/trips/maintenance/fuel APIs + rules |
| **Bhanu** | `pages/`, `App.tsx`, `hooks/`, `lib/api/`, `layout/`, `types/` | Login, nav, Dashboard, Vehicles, Drivers, Trips, Maintenance pages |
| **Mohan** | `styles/`, `components/ui/`, `constants/` | Theme, Button/Card/Badge/KpiCard, status colors |
| **Anand** | `components/forms/`, `lib/validators.ts`, `apps/api/scripts/`, `docs/DEMO.md` | Form fields + validators; seed Steps 1–9 |

## Demo spine

See [DEMO.md](./DEMO.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).

## Sync

```bash
git checkout main && git pull origin main
bash team-playbook/scripts/sync-remote.sh   # if you have playbook
```

Then in Cursor: `analyze`
