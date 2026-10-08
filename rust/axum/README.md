# axum web server (Rust)

A small web server built with axum. It starts by itself and shows in the preview. The first start
takes a minute while Cargo compiles the dependencies.

## Run it

The server is already running in the `app` terminal tab. Rust must recompile after every edit, so
restart it to see changes. To restart it, click the `app` terminal tab, press Ctrl+C, then press ↑ and Enter.

Try these paths in the preview:

- `/` shows the home page.
- `/api/hello?name=Ada` returns `{"message": "Hello, Ada!"}`.

## Test it

```bash
cargo test
```

Or click **Run tests** in the Tests view. That runs the same tests used for grading.

## Files

- `src/main.rs` holds the routes, handlers and tests (the `mod tests` block at the bottom).
- `Cargo.toml` lists the dependencies.
