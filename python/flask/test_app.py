"""Suite tests for the Flask starter (pytest -> TAP via `pytest --tap-stream`).

A challenge built on this starter keeps its grading tests outside the candidate's editable paths,
so the authoritative re-run restores them and the score can't be gamed by editing the tests.
"""

from app import app


def test_index_ok():
    res = app.test_client().get("/")
    assert res.status_code == 200


def test_health_returns_ok():
    res = app.test_client().get("/api/health")
    assert res.status_code == 200
    assert res.get_json() == {"status": "ok"}
