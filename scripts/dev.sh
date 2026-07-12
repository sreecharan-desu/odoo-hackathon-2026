#!/usr/bin/env bash
# Start PostgreSQL for local development
set -euo pipefail
docker compose -f docker/compose.yml up -d
echo "Postgres ready on localhost:5432"
