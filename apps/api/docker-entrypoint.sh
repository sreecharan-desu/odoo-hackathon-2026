#!/bin/sh
set -e

echo "Waiting for database..."
python - <<'PY'
import os, time
from sqlalchemy import create_engine, text

url = os.environ.get("DATABASE_URL", "postgresql+psycopg://app:app_secret@postgres:5432/hackathon")
engine = create_engine(url, pool_pre_ping=True)
for attempt in range(60):
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database is ready.")
        break
    except Exception as exc:
        print(f"DB not ready ({attempt + 1}/60): {exc}")
        time.sleep(1)
else:
    raise SystemExit("Database did not become ready in time")
PY

echo "Applying migrations..."
alembic upgrade head || alembic stamp head

echo "Seeding demo data (if empty)..."
SEED_IF_EMPTY=1 python scripts/seed.py

exec "$@"
