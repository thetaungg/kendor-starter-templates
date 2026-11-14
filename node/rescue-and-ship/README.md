# Rescue and ship: Spoonrun's help desk

Spoonrun delivers food around Lisbon. When an order goes wrong, customers and restaurants message
us, and the support team answers them in our own help desk. Ruben, who built it, left last month.
Since then the team has been complaining about it, and so have customers.

You have **2 hours**. Then it's Friday lunch, our busiest hour of the week.

Start with the [`inbox/`](inbox/) folder: a note from Nadia, who leads support, the team's chat,
a few messages from customers and one from Finance. Nobody there is technical. They tell you what
happened to them, not what's wrong in the code. Working that out is your job, and not every message
is something to fix.

**You won't fix everything in two hours.** Choose what matters most, fix it properly, and say why
you chose it. Before you finish, fill in [`DECISIONS.md`](DECISIONS.md): a short note to Nadia.

## Working here

- The **preview** shows the desk. Sign in as `kofi@spoonrun.test` or `ines@spoonrun.test`
  (password `spoon`), each in its own window if you want to be two agents at once.
- `npm run shift` replays a busy Friday lunch against the running desk in under a minute and tells
  you how it went. It clears the conversations first, so run it before and after your changes; the
  desk then shows the hour it replayed. It talks to the API the way the messaging provider and the
  agents' screens do, so if you change a route it uses, keep the old one working.
- `npm test` (also in the **Tests** tab), `npm run typecheck`, and `psql "$DATABASE_URL"`.
- In the **Requests** panel, "A customer writes" sends a message the way the messaging provider does.
- `db/` only runs when the database is first created. To change the schema, run the SQL in `psql`,
  add it as a new file in `db/`, and mention it in `DECISIONS.md`.
- The sandbox's Postgres allows 20 connections, shared by the API, the tests, the replay and `psql`.

```
api/src/          Express API (TypeScript); routes/ has the endpoints
  orders.ts       Spoonrun's orders system (read-only: it isn't ours to change)
web/src/          React desk (Vite)
db/               schema and demo data
test/             tests (read-only)
scripts/shift.ts  the Friday lunch replay (read-only)
inbox/            what the team sent you
```

## Rules

- **AI agents are welcome.** Run them in the terminal (`claude`, `codex` and others, as your screen
  allows). Your conversation with the agent is part of what the reviewers read.
- Libraries are fine.
- `test/`, `scripts/shift.ts` and `api/src/orders.ts` are read-only. Add your own tests in a new folder.
- Whatever is in your workspace when you submit (or when time runs out) is what gets reviewed.

## How it's reviewed

| | |
|---|---|
| Working software | 30% |
| Engineering quality | 25% |
| Product judgement (what you chose to fix, and why) | 20% |
| AI craft (from your agent conversation) | 15% |
| Presentation (`DECISIONS.md`, a clear before and after) | 10% |
