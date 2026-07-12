"""FastAPI starter app.

A minimal, runnable typed JSON API the candidate extends. uvicorn serves it through the Kendor
preview proxy; grading runs pytest (the suite harness) against the tests. Add routes and Pydantic
models here.
"""

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Kendor · FastAPI")


class Echo(BaseModel):
    message: str


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/echo")
def echo(body: Echo) -> Echo:
    return body
