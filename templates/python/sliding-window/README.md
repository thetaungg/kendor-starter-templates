# Sliding Window

Two classic sliding-window problems in `solution.py`.

## Requirements

- `longest_unique_substring(s)` — return the length of the longest substring of `s` with no repeating
  characters.
- `max_window_sum(nums, k)` — return the maximum sum of any contiguous window of length `k`. Raise
  `ValueError` if `k` is not in `1..len(nums)`.

## Example

```python
longest_unique_substring("abcabcbb")   # 3  ("abc")
longest_unique_substring("bbbbb")      # 1  ("b")
max_window_sum([1, 4, 2, 10, 2], 3)    # 16 (4 + 2 + 10)
```

Only `solution.py` is editable. Run the tests to check your work.
