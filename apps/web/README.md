# Web (`apps/web`)

React + Vite application for TransitOps.

## Run

```bash
npm install
npm run dev
```

## Structure

```
src/
  components/
    ui/           # shared primitives (Button, Card, Badge, …)
    layout/       # application shell and navigation
    forms/        # validated form fields
  pages/          # route-level screens
  hooks/          # auth and data hooks
  lib/
    api/          # HTTP client and endpoints
    validators.ts # client-side validation
  types/          # shared TypeScript contracts
  constants/      # routes and status maps
  styles/         # design tokens
```

## Conventions

1. **Pages** compose components; use `lib/api` for HTTP
2. **Components** stay presentational where possible
3. **Hooks** hold reusable async and session logic
4. **Types** mirror API response shapes
