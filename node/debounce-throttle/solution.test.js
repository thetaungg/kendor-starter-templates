const test = require('node:test');
const assert = require('node:assert');

const { debounce, throttle } = require('./solution');

test('debounce fires once after the wait with the latest args', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const calls = [];
    const fn = debounce((x) => calls.push(x), 100);
    fn(1);
    fn(2);
    fn(3);
    assert.deepStrictEqual(calls, [], 'must not fire before the wait elapses');
    t.mock.timers.tick(100);
    assert.deepStrictEqual(calls, [3]);
});

test('debounce restarts the timer on every call', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let calls = 0;
    const fn = debounce(() => calls++, 100);
    fn();
    t.mock.timers.tick(50);
    fn();
    t.mock.timers.tick(50);
    assert.strictEqual(calls, 0, 'the second call should have reset the timer');
    t.mock.timers.tick(50);
    assert.strictEqual(calls, 1);
});

test('throttle fires on the leading edge then blocks until the window elapses', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
    const calls = [];
    const fn = throttle((x) => calls.push(x), 100);
    fn(1);
    fn(2);
    assert.deepStrictEqual(calls, [1], 'only the leading call fires inside the window');
    t.mock.timers.tick(100);
    fn(3);
    assert.deepStrictEqual(calls, [1, 3]);
});
