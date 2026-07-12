# Local Docker (Postgres only by default historically — full stack is from repo root)

From the **repository root**:

```bash
docker compose up --build
# or
docker-compose up --build
```

- App: http://localhost:8080  
- API docs: http://localhost:8080/docs  

```bash
docker compose down        # stop
docker compose down -v     # stop + delete DB volume (full reseed next start)
docker compose ps
docker compose logs -f api
```
