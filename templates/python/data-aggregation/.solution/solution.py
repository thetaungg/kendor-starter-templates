"""Reference solution — stripped from the candidate seed (kendor.solutionDir)."""

from collections import Counter


def word_frequencies(text: str) -> dict[str, int]:
    return dict(Counter(text.lower().split()))


def top_n(text: str, n: int) -> list[tuple[str, int]]:
    counts = word_frequencies(text)
    ordered = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    return ordered[:n]
