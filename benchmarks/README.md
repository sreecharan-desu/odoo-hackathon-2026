# Benchmarks

`k6-api.js` logs in as the seeded fleet manager once, then load-tests one endpoint per run. `run.sh` migrates and seeds the database at `$DATABASE_URL`, starts the API with 4 uvicorn workers, runs five 30-second k6 scenarios, then runs `apps/api/scripts/vast_integration_test.py` against the same server. Results land in `results-<date>/`.

All numbers are from a single machine with the load generator on the same box. They are not a claim about any deployed environment.
