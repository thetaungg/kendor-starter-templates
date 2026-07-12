"""Suite tests for the FastAPI starter (pytest -> TAP via `pytest --tap-stream`).

Uses Starlette's TestClient (needs httpx). A challenge built on this starter keeps its grading
tests outside the candidate's editable paths, so the authoritative re-run restores them.
"""

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health_returns_ok():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_echo_round_trips_body():
    res = client.post("/api/echo", json={"message": "hi"})
    assert res.status_code == 200
    assert res.json() == {"message": "hi"}
