# Go web server (net/http)

A small web server using only Go's standard library. It starts by itself and shows in the preview.

## Run it

The server is already running in the `app` terminal tab. Go doesn't reload on save, so restart it
after you edit. To restart it, click the `app` terminal tab, press Ctrl+C, then press ↑ and Enter.

Try these paths in the preview:

- `/` shows the home page.
- `/api/hello?name=Ada` returns `{"message": "Hello, Ada!"}`.

## Test it

```bash
go test ./...
```

Or click **Run tests** in the Tests view. That runs the same tests used for grading.

## Files

- `main.go` holds the routes and handlers.
- `main_test.go` holds the tests.
