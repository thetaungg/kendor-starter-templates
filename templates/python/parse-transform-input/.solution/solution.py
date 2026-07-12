"""Reference solution — stripped from the candidate seed (kendor.solutionDir)."""


def parse_csv(text: str) -> list[dict[str, str]]:
    lines = [line for line in (raw.strip() for raw in text.splitlines()) if line]
    if not lines:
        return []
    headers = [h.strip() for h in lines[0].split(",")]
    rows = []
    for line in lines[1:]:
        values = [v.strip() for v in line.split(",")]
        rows.append(dict(zip(headers, values)))
    return rows


def sum_column(rows: list[dict[str, str]], column: str) -> float:
    return sum(float(row[column]) for row in rows)
