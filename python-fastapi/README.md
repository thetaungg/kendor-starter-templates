# FastAPI app (Python)

A small JSON API built with FastAPI. It starts by itself and reloads when you save.

## Run it

The server is already running in the `app` terminal tab. Try these in the preview:

- `/docs` shows interactive API docs where you can call every route.
- `/api/health` returns `{"status": "ok"}`.
- `POST /api/echo` with `{"message": "hi"}` returns the same body.

## Test it

```bash
pytest
```

Or click **Run tests** in the Tests view. That runs the same tests used for grading.

## Files

- `main.py` holds the routes and request models.
- `test_main.py` holds the tests.
- `requirements.txt` lists the packages. After adding one, run `pip install --user -r requirements.txt`.
