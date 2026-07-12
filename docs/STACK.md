# Stack decisions — minimal by default

> Match Odoo guidance: use modern tech **only when it adds real value** for the problem statement.

## Baseline (keep unless PS forces change)

| Tool | Status | Notes |
|------|--------|-------|
| PostgreSQL | ✅ Keep | Required taste for Odoo evaluators |
| FastAPI | ✅ Keep | Fast CRUD, validation, clear structure |
| SQLAlchemy | ✅ Keep | Relational modeling |
| Alembic | ⏳ Add on 12 Jul | When schema is defined |
| React + Vite | ✅ Keep | Simpler than Next unless PS needs SEO/SSR |
| TypeScript | ✅ Keep | Safer forms and API client |

## Do not add upfront

| Tool | Why wait |
|------|----------|
| Redis | Only if sessions/cache/rate-limit needed |
| Elasticsearch | Only if full-text search is core to PS |
| Next.js | Heavier; use only if SSR/routing complexity needed |
| GraphQL | REST is enough for 8 hours |
| Microservices | Single `apps/api` is correct |
| Turborepo / Nx | Overhead for 3 people |
| Firebase / Supabase | Explicitly discouraged by Odoo |

## Decision on hackathon day (first 30 min)

After reading the problem statement, team lead updates this table:

| Need from PS | Add? | Owner |
|--------------|------|-------|
| Real-time updates | WebSockets / SSE? | |
| File uploads | Local storage + API | |
| Auth | JWT or session cookies | |
| Search | SQL LIKE vs dedicated search | |
| Maps / external API | Only if PS requires | |

## Rule

**One working MVP flow > trendy stack.** If a feature can ship with Postgres + REST + React, do that.
