# Implement `debounce` & `throttle`

Implement the two classic rate-limiting wrappers in `solution.js`.

## Requirements

- `debounce(fn, wait)` — return a function that postpones calling `fn` until `wait` milliseconds have
  passed since the **last** invocation. Only the most recent arguments are used. Rapid calls reset
  the timer.
- `throttle(fn, wait)` — return a function that invokes `fn` immediately on the **leading edge**, then
  ignores calls until `wait` milliseconds have elapsed since the last invocation.

## Notes

- Use `setTimeout` / `Date.now()`. The tests drive time with fake timers, so real delays are not
  needed.

## Example

```js
const log = debounce(console.log, 100);
log('a'); log('b'); // only 'b' fires, 100ms after the last call
```

Only `solution.js` is editable. Run the tests to check your work.
