#!/usr/bin/env bash
# First-time local setup
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Copying environment file..."
cp -n .env.example .env 2>/dev/null || true

echo "→ Starting PostgreSQL (Docker)..."
docker compose up -d

echo "→ Setting up API..."
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd "$ROOT"

echo "→ Setting up Web..."
cd apps/web
npm install
cd "$ROOT"

echo ""
echo "Done. Run in two terminals:"
echo "  make dev-api   # or: cd apps/api && source .venv/bin/activate && uvicorn app.main:app --reload"
echo "  make dev-web   # or: cd apps/web && npm run dev"
echo ""
echo "API:  http://localhost:8000/api/health"
echo "Web:  http://localhost:5173"
