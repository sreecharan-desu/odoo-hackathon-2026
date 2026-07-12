# PostgreSQL for local development

```bash
# From repo root
docker compose up -d
docker compose ps
docker compose logs postgres
docker compose down        # stop
docker compose down -v     # stop + delete data
```

Uses `.env` for `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`.

Data persists in the `postgres_data` Docker volume.
