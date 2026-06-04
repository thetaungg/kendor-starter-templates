# Kendor starter templates

Starter scaffolds for Kendor coding challenges — **one folder per starter**, files at each
folder's root. These are the source of truth for the built-in starters; the Kendor backend syncs
them to S3 (it never serves them from GitHub directly).

| Folder | Runtime | Entry |
|---|---|---|
| `vite-tsx` | Node.js | `src/App.tsx` |
| `vite-jsx` | Node.js | `src/App.jsx` |
| `laravel` | PHP (Laravel) | `routes/web.php` |
| `simple-php` | PHP | `index.php` |

Starters are **source-only** — no `node_modules/` or `vendor/`. Dependencies are installed by the
sandbox executor's build phase (or baked into its image), so don't commit installed deps.

## Publishing changes

Edit a folder and push to `main`. Then, from the Kendor backend (`apps/backend`), re-run the seed
to sync GitHub → S3:

```bash
STARTERS_REPO=thetaungg/kendor-starter-templates \
  npx ts-node -r tsconfig-paths/register prisma/seed-runtimes.ts
```

The seed fetches this repo once, extracts each folder, re-roots and re-zips it, and uploads to
`templates/starters/<slug>.zip` in S3. To add a starter: add a folder here **and** an entry in
`apps/backend/src/runtime/runtime.registry.ts` (`STARTER_SEEDS`), then re-run the seed.
