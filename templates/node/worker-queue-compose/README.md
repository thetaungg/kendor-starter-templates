# Distributed worker queue

A small job queue runs on Docker Compose in your sandbox: **Valkey** holds the queue, **api** enqueues
jobs on `POST /jobs` and reports counts on `GET /stats`, and **worker** takes jobs off the queue and
processes them. The preview shows the API on port 3000.

```bash
docker compose up --build            # starts everything (already running in the app service)
curl -X POST localhost:3000/jobs -d '{"n": 20}' -H 'content-type: application/json'
curl localhost:3000/stats
docker compose up -d --scale worker=3
docker compose kill worker           # what happens to the jobs in flight?
```

## Your task

1. **Scale safely.** Run three workers. No job may be processed twice, and none may be lost when a
   worker is killed mid-job.
2. **Retries.** About one job in ten fails (see `handle()` in `app/worker.js`). Retry a failed job up to
   three times, then move it to a dead-letter list that `GET /stats` reports.
3. **Graceful shutdown.** On `SIGTERM`, a worker finishes its current job and stops taking new ones.
4. Be ready to explain how you'd watch this queue in production and what you'd change at 100× the load.

You can change anything in `app/` and `compose.yaml`.
