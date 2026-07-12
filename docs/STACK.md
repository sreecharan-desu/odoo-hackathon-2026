# Stack

Technology choices for TransitOps. Prefer a small, understandable stack that supports the product — add tools only when they solve a concrete need.

## Current stack

| Component | Choice | Notes |
|-----------|--------|-------|
| Database | PostgreSQL 16 | Relational model with constraints |
| API | FastAPI | Typed routes, Pydantic validation |
| ORM | SQLAlchemy | Models and queries |
| Migrations | Alembic (optional) | Add when schema changes need versioning |
| Web | React 19 + Vite | SPA client |
| Language | TypeScript | Shared contracts with the API |
| Auth | JWT + password hashing | Stateless API sessions |

## Not used (by design)

| Option | Reason |
|--------|--------|
| Firebase / Supabase / MongoDB Atlas | Prefer an owned database and API |
| Redis | Not required for the current workload |
| Elasticsearch | SQL filtering is sufficient |
| GraphQL | REST covers the surface area |
| Microservices | Single API package keeps deployment simple |
| Kubernetes | Local Docker Compose is enough for development and demo |

## Guidance

Ship one complete operational flow with clear validation and modular code before introducing additional infrastructure.
