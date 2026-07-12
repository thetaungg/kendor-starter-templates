# LRU Cache Decorator

Implement a memoizing decorator with LRU eviction in `solution.py` — a from-scratch mini
`functools.lru_cache`.

## Requirements

Implement `lru_cache(maxsize)` returning a decorator. The wrapped function must:

- Cache results keyed by the positional-argument tuple.
- On a cache miss, call the underlying function, store the result, and evict the least recently used
  entry when the cache exceeds `maxsize`. A cache hit refreshes the entry's recency.
- Expose a `.stats` dict with live `"hits"` and `"misses"` counts.

## Example

```python
@lru_cache(maxsize=2)
def square(n):
    return n * n

square(2); square(2)          # one miss, one hit
square.stats                  # {"hits": 1, "misses": 1}
```

Only `solution.py` is editable. Run the tests to check your work.
