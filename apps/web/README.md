# Web (`apps/web`)

Production-style React + Vite layout.

## Run

```bash
npm install
npm run dev
```

## Structure

```
src/
  components/
    ui/           # Button, Card, Spinner — Mohan
    layout/       # Header, AppLayout — Bhanu
    forms/        # validated form fields — Anand
  pages/          # route-level screens — Bhanu
  hooks/          # useAsync, data hooks — Bhanu
  lib/
    api/          # client, endpoints — Bhanu
    validators.ts # Anand
  types/          # TypeScript interfaces — Bhanu
  constants/      # routes, config — Mohan
  styles/         # theme tokens — Mohan
```

## Layer rules

1. **Pages** — compose components, no raw fetch (use `lib/api`)
2. **Components** — presentational; props in, events out
3. **Hooks** — reusable async/state logic
4. **Types** — shared API response shapes
