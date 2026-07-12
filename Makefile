.PHONY: help up down logs dev-db dev-api dev-web seed

help:
	@echo "make up        - start full stack (db + api + web) via Docker"
	@echo "make down      - stop containers"
	@echo "make logs      - follow container logs"
	@echo "make seed      - reseed database (destructive)"
	@echo "make dev-db    - start PostgreSQL only"
	@echo "make dev-api   - run FastAPI locally"
	@echo "make dev-web   - run Vite locally"

up:
	docker-compose up --build -d

down:
	docker-compose down

logs:
	docker-compose logs -f

dev-db:
	docker-compose up -d postgres

dev-db-down:
	docker-compose down

dev-db-logs:
	docker-compose logs -f postgres

dev-api:
	cd apps/api && uvicorn app.main:app --reload --port 8000

dev-web:
	cd apps/web && npm run dev

seed:
	cd apps/api && python scripts/seed.py
