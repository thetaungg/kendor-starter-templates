# Kendor templates

Every project a Kendor challenge can start from, **one folder per template** at
`<language>/<slug>/`, files at the folder's root. The Kendor backend syncs them to S3; it
never serves them from GitHub directly.

A template is self-defining: its `kendor.yaml` runs it, and the `kendor:` block describes it in the
builder (`title`, `type`, `category`, `order`, `entryFile`, `readonlyPaths`, `solutionDir`).

- **Projects** (`category: Project`) are runnable apps with no brief, such as `node/vite-tsx`,
  `php/laravel` or `python/fastapi`. Each language's `single-file` project is the default for
  single-file challenges.
- **Challenges** (any other category) add a brief in `README.md` and tests, such as
  `python/sliding-window` or `node/worker-queue-compose`. A `solutionDir` (e.g. `.solution`) holds the
  reference solution and is left out of the candidate's files.

Templates are **source-only**: no `node_modules/` or `vendor/`. The sandbox installs dependencies.

## Publishing changes

Edit a folder and push to `main`, then re-run the seed from the Kendor backend (`apps/backend`):

```bash
pnpm seed:runtimes
```

It fetches this repo once, zips each folder and upserts it as a template, keyed by
`<language>-<slug>`. To add a template, add a folder and re-run the seed.
