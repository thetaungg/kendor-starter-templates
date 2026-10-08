# Data Aggregation

Implement two aggregation helpers in `solution.py`.

## Requirements

- `word_frequencies(text)` — return a `dict` mapping each lowercase, whitespace-separated word to the
  number of times it appears in `text`.
- `top_n(text, n)` — return the `n` most frequent words as a list of `(word, count)` tuples, ordered
  by count descending, ties broken alphabetically.

## Example

```python
word_frequencies("the cat the dog the")   # {"the": 3, "cat": 1, "dog": 1}
top_n("the cat the dog the", 2)           # [("the", 3), ("cat", 1)]
```

Only `solution.py` is editable. Run the tests to check your work.
