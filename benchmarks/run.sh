#!/usr/bin/env bash
# Reproduce the benchmark. Needs: Postgres reachable at $DATABASE_URL, apps/api/.venv with requirements installed, k6 on PATH.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${DATABASE_URL:=postgresql+psycopg://app:app_secret@127.0.0.1:5433/hackathon}"
export DATABASE_URL SECRET_KEY="${SECRET_KEY:-bench-only-secret}" SEED_IF_EMPTY=1
OUT="benchmarks/results-$(date +%F)"; mkdir -p "$OUT"
{ echo "date: $(date -Is)"; echo "cpu: $(nproc) x $(grep -m1 'model name' /proc/cpuinfo | cut -d: -f2)"; free -m | sed -n 2p | awk '{print "ram_mb: "$2}'; uname -sr; apps/api/.venv/bin/python -V; psql --version 2>/dev/null || true; k6 version; echo "uvicorn workers: 4"; echo "load generator: k6 on the same machine"; } > "$OUT/environment.txt"
(cd apps/api && .venv/bin/alembic upgrade head && .venv/bin/python scripts/seed.py) > "$OUT/seed.txt" 2>&1
(cd apps/api && .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4 --log-level warning) &
PID=$!; trap 'kill $PID 2>/dev/null || true' EXIT
for i in $(seq 1 100); do curl -sf http://127.0.0.1:8000/api/health >/dev/null && break; sleep 0.2; done
k6 run -e PATH_UNDER_TEST=/api/health -e VUS=50 --summary-export "$OUT/k6-health.json" benchmarks/k6-api.js > "$OUT/k6-health.txt" 2>&1
k6 run -e PATH_UNDER_TEST=/api/vehicles -e VUS=50 --summary-export "$OUT/k6-vehicles.json" benchmarks/k6-api.js > "$OUT/k6-vehicles.txt" 2>&1
k6 run -e PATH_UNDER_TEST=/api/trips -e VUS=50 --summary-export "$OUT/k6-trips.json" benchmarks/k6-api.js > "$OUT/k6-trips.txt" 2>&1
k6 run -e PATH_UNDER_TEST=/api/dashboard/kpis -e VUS=50 --summary-export "$OUT/k6-kpis.json" benchmarks/k6-api.js > "$OUT/k6-kpis.txt" 2>&1
k6 run -e METHOD=LOGIN -e VUS=20 --summary-export "$OUT/k6-login.json" benchmarks/k6-api.js > "$OUT/k6-login.txt" 2>&1
# Functional check against the live stack (repo's own integration script)
apps/api/.venv/bin/python apps/api/scripts/vast_integration_test.py http://127.0.0.1:8000 > "$OUT/integration-test.txt" 2>&1 || true
