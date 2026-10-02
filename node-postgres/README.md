# Express + PostgreSQL + Valkey

A small todos API on Express, backed by a real PostgreSQL database, with the todo list cached in Valkey
(Redis-compatible). Both run inside the sandbox.

## Run it

The API is already running in the `app` terminal tab, and it restarts by itself when you save. Both
databases run in the `Database` tab.

Try these in the preview:

- `/` shows the home page.
- `/api/todos` lists the todos.

## The database

- The app connects with `DATABASE_URL`, which is already set. You can also open a terminal and run
  `psql` to look at the data.
- `db/seed.sql` creates the `todos` table and adds two rows. It runs once, when the database is first
  created.
- Your rows stay while you work. Every grade starts with an empty database and runs the seed again.

## The cache

- `GET /api/todos` is served from Valkey for 60 seconds; the `X-Cache` header says `hit` or `miss`.
  Creating a todo clears it.
- The app connects with `REDIS_URL`, which is already set. Any Redis client works; run `redis-cli` (or
  `valkey-cli`) in a terminal to look at the keys.

## Test it

```bash
npm test
```

Or click **Run tests** in the Tests view. That runs the same tests used for grading.

## Files

- `src/app.js` holds the routes.
- `src/db.js` creates the database connection.
- `src/cache.js` creates the Valkey connection.
- `db/seed.sql` creates and fills the table.
- `test/todos.test.js` holds the tests.
