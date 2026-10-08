# Array & Object Transforms

Implement three small data-transform helpers in `solution.js`.

## Requirements

- `groupBy(items, keyFn)` — return an object mapping each `keyFn(item)` to the array of items that
  produced it, preserving input order.
- `unique(items)` — return the items with duplicates removed, keeping the first occurrence's order.
- `sumBy(items, valueFn)` — return the sum of `valueFn(item)` across all items (`0` for an empty
  array).

## Example

```js
groupBy([1, 2, 3, 4], (n) => (n % 2 === 0 ? 'even' : 'odd'));
// { odd: [1, 3], even: [2, 4] }

unique([1, 1, 2, 3, 3, 3]); // [1, 2, 3]

sumBy([{ n: 2 }, { n: 5 }], (x) => x.n); // 7
```

Only `solution.js` is editable. Run the tests to check your work.
