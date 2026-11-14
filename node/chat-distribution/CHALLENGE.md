# How this challenge works

Daniel's posting in [README.md](README.md) is the brief. You have **8 hours**. This page is the
developer side: what's in the workspace, how to measure, the rules, and how it's reviewed.

## What you have

A starter system that already works the way Bluefin works today: every chat lands on one shared
list and agents take what they like. It speaks the contract, so `npm run day` works from minute
one, and shows how bad today is.

| Path | What |
|---|---|
| `src/` | The starter server (Node + TypeScript, Express, everything in memory). |
| `public/` | Its pages: an agent inbox (`/`) and a bare manager page (`/manager.html`). The **preview** shows them. |
| `sim/` | The simulator (`npm run day`) and the contract check (`npm run check`). Read-only. |
| `CONTRACT.md` | The HTTP contract between the simulator and your system. Read-only. |
| `inbox/` | The messages Daniel attached. |
| `DECISIONS.md` | Your note to Daniel. Fill it in. |

Improve the starter or replace it with anything you like: another language, a database, a
framework, another package manager. The only fixed points are **the contract and port 3000**.

**npm is just what the starter happens to use.** Use whatever your stack uses (pip or uv, Go
modules, Cargo, Maven or Gradle, Composer, pnpm…). The simulator is plain Node with no packages to
install, so it runs the same whatever you build with: `npm run day` is only a shortcut for
`node sim/day.mjs`, and `npm run check` for `node sim/check.mjs`.

## How to work

| Command | What it does |
|---|---|
| `npm run dev` | Runs the starter on port 3000 (it starts with the sandbox, see `kendor.yaml`). |
| `npm run day` (or `node sim/day.mjs`) | Replays a Monday at Bluefin against port 3000 and prints how the clients and the team fared. Run it before you change anything, and after. |
| `npm run day -- --details` | Also lists every client who waited over 5 minutes, and who had their chat. |
| `npm run check` (or `node sim/check.mjs`) | Checks that your system speaks the contract (also in the **Tests** tab). |
| `npm run typecheck` | TypeScript check for the starter (only while you keep it). |

Run `npm run day` while the preview is open: the pages fill up as the day goes by.

The day runs on a **simulated clock**: every request says what time it is, and a tick arrives every
simulated minute. Your system must use that time, never the computer's clock. Read
[CONTRACT.md](CONTRACT.md) before you write a timer.

If you switch stacks, update `kendor.yaml` so the sandbox runs yours: `install.commands` for your
installs (`pip install -r requirements.txt`, `go mod download`, `cargo build`…; drop `npm ci` if you
delete `package.json`), and `services.app.dev.command` for your server so it starts with the
sandbox and shows in the preview. Keep it on port 3000.

## Your sandbox

Every language Kendor runs is ready in the terminal: **Node 22, Python 3.12, Go 1.27, Java 21,
Rust 1.98, C++23 and PHP 8.4**, with **PostgreSQL** (`psql "$DATABASE_URL"`), **Valkey**
(`redis-cli -u "$REDIS_URL"`) and **MongoDB**. You don't need a database: in memory is fine for a
day that resets every run. The sandbox's Postgres allows about 20 connections in all.

## What reviewers look at

1. **The numbers.** Your `npm run day` before and after, on seed 42 and on seeds you haven't seen.
2. **The product.** What an agent sees (what's mine, what first, how long has this client
   waited) and what Daniel sees (who's in, who answers, how fast, who's waiting now).
3. **Your rules, and why.** There's no single right answer. A rule you can explain to Daniel
   beats a clever number you can't.
4. **Your note** (`DECISIONS.md`) and your agent conversation.

## Rules

- **AI agents are welcome.** Run them in the terminal (`claude`, `codex` and others, as your screen
  allows). Your conversation with the agent is part of what the reviewers read.
- Libraries and frameworks are fine.
- `sim/` and `CONTRACT.md` are read-only. Your system learns about the day only through the
  contract: don't read the simulator's files or hard-code its clients or chats. What Daniel tells
  you about his team is fair to use, ideally as settings he can change. Reviewers replay other days.
- Whatever is in your workspace when you submit (or when time runs out) is what gets reviewed.

## How it's reviewed

| | |
|---|---|
| Working software (it runs, speaks the contract, the day goes better) | 30% |
| Engineering quality (clear code, sound timing, tested where it matters) | 25% |
| Product judgement (your rules and trade-offs, the agent and manager screens) | 20% |
| AI craft (from your agent conversation) | 15% |
| Presentation (`DECISIONS.md`, a clear before/after, plain words for Daniel) | 10% |
