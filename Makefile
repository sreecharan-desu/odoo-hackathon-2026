.PHONY: dev-db dev-api dev-web help

help:
	@echo "make dev-db   - start PostgreSQL"
	@echo "make dev-api  - run FastAPI (from apps/api)"
	@echo "make dev-web  - run Vite (from apps/web)"

dev-db:
	docker compose up -d

dev-db-down:
	docker compose down

dev-db-logs:
	docker compose logs -f postgres

dev-api:
	cd apps/api && uvicorn app.main:app --reload --port 8000

dev-web:
	cd apps/web && npm run dev
