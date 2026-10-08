# Flask app (Python)

A small Flask web app. It starts by itself and reloads when you save.

## Run it

The server is already running in the `app` terminal tab. Try these in the preview:

- `/` shows the page from `templates/index.html`.
- `/api/health` returns `{"status": "ok"}`.

## Test it

```bash
pytest
```

Or click **Run tests** in the Tests view. That runs the same tests used for grading.

## Files

- `app.py` holds the routes.
- `templates/index.html` is the page template.
- `test_app.py` holds the tests.
- `requirements.txt` lists the packages. After adding one, run `pip install --user -r requirements.txt`.
