# LRU Cache

Implement a fixed-capacity **Least Recently Used** cache in `solution.js`.

## Requirements

Export a class `LRUCache`:

- `new LRUCache(capacity)` — create a cache holding at most `capacity` entries.
- `get(key)` — return the value for `key`, or `undefined` if absent. A hit counts as a use (makes
  `key` the most recently used).
- `put(key, value)` — insert/update `key`. If this exceeds `capacity`, evict the least recently used
  key. Updating an existing key also counts as a use.

Both `get` and `put` must run in O(1).

## Example

```js
const c = new LRUCache(2);
c.put('a', 1);
c.put('b', 2);
c.get('a');      // 1  -> 'a' is now most-recently used
c.put('c', 3);   // evicts 'b' (least recently used)
c.get('b');      // undefined
```

Only `solution.js` is editable. Run the tests to check your work.
