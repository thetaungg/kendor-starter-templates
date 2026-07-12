"""Implement the two helpers below. Only this file is editable by the candidate."""


def parse_csv(text: str) -> list[dict[str, str]]:
    """Parse CSV text (first non-empty line is the header) into a list of dicts."""
    raise NotImplementedError


def sum_column(rows: list[dict[str, str]], column: str) -> float:
    """Sum a column across rows, parsing each value as a float."""
    raise NotImplementedError
