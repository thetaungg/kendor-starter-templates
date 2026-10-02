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
| `python-flask` | Python (Flask) | `app.py` |
| `python-fastapi` | Python (FastAPI) | `main.py` |
| `go-http` | Go (`net/http`) | `main.go` |
| `go-cli` | Go (command line) | `main.go` |
| `java-spring` | Java (Spring Boot, Maven) | `src/main/java/com/example/demo/GreetingController.java` |
| `rust-axum` | Rust (axum) | `src/main.rs` |
| `cpp-cmake` | C++ (CMake, command line) | `src/wordcount.cpp` |
| `java-go-cpp` | Java + Go + C++ (three services, one sandbox) | `api/src/main/java/com/example/demo/GreetingController.java` |
| `single-file-node` · `-php` · `-python` · `-go` · `-java` · `-rust` · `-cpp` | one per runtime | the one editable solution file |

Challenge templates live under `templates/<language>/<slug>/` and are seeded the same way.

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
`templates/starters/<slug>.zip` in S3. Starters are self-defining: any top-level folder with a
`kendor.yaml` is one, and its `kendor:` block (`title`, `entryFile`, `order`) drives the builder
dropdown. To add a starter, add a folder here and re-run the seed.
