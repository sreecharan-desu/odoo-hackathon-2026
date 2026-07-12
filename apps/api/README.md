# API (`apps/api`)

Production-style FastAPI layout.

## Run

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Structure

```
app/
  controllers/    # HTTP layer (routes/handlers) — thin
  services/       # business logic
  models/         # SQLAlchemy ORM entities
  schemas/        # Pydantic request/response DTOs
  core/           # config, deps, security
  db/             # engine, session, base
  utils/          # pure helpers
  exceptions/     # custom errors + handlers
  middleware/     # auth, logging (add when needed)
scripts/          # seed, migrations helpers
```

## Layer rules

1. **Controller** — parse request, call service, return schema
2. **Service** — business rules, DB transactions
3. **Model** — table definition only
4. **Schema** — validation + API contract (never expose password_hash)
