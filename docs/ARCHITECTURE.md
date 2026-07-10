# Architecture — update when problem statement is released

> Team lead owns this file. Others request changes via PR.

## Problem summary

_TBD on 12 Jul_

## MVP user flow

1. _TBD_

## Database entities

| Table | Fields | Relations |
|-------|--------|-----------|
| users | id, email, name, password_hash, created_at | — |

## API contract

| Method | Path | Owner | Status |
|--------|------|-------|--------|
| GET | /api/health | SreeCharan | done |
| | | | |

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
| `services/` | Business logic |
| `models/` | DB tables |
| `schemas/` | Pydantic DTOs |
| `core/` | Config, deps, security |
| `utils/` | Helpers |
| `exceptions/` | Error handling |

### Frontend layers

| Folder | Owner | Purpose |
|--------|-------|---------|
| `components/ui/` | Mohan | Buttons, cards, spinners |
| `styles/` | Mohan | Theme tokens, visual system |
| `constants/` | Mohan | Routes, config constants |
| `components/layout/` | Bhanu | Header, shell |
| `components/forms/` | Anand | Validated inputs |
| `pages/` | Bhanu | Screens |
| `hooks/` | Bhanu | `useAsync`, data hooks |
| `lib/api/` | Bhanu | HTTP client |
| `types/` | Bhanu | TS types |

## Demo script (90 seconds)

_TBD_
