"""Flask starter app.

A minimal, runnable Flask app the candidate extends. The dev server is reachable through the
Kendor preview proxy; grading runs pytest (the suite harness) against the tests. Add routes here
and Jinja templates under templates/.
"""

from flask import Flask, jsonify, render_template

app = Flask(__name__)


@app.get("/")
def index():
    return render_template("index.html", title="Kendor · Flask")


@app.get("/api/health")
def health():
    return jsonify(status="ok")
