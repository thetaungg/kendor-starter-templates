const test = require('node:test');
const assert = require('node:assert');

const { LRUCache } = require('./solution');

test('stores and retrieves values', () => {
    const c = new LRUCache(2);
    c.put('a', 1);
    c.put('b', 2);
    assert.strictEqual(c.get('a'), 1);
    assert.strictEqual(c.get('b'), 2);
});

test('returns undefined for a missing key', () => {
    const c = new LRUCache(2);
    assert.strictEqual(c.get('missing'), undefined);
});

test('evicts the least recently used key on overflow', () => {
    const c = new LRUCache(2);
    c.put('a', 1);
    c.put('b', 2);
    c.put('c', 3); // evicts 'a'
    assert.strictEqual(c.get('a'), undefined);
    assert.strictEqual(c.get('b'), 2);
    assert.strictEqual(c.get('c'), 3);
});

test('get marks a key as recently used', () => {
    const c = new LRUCache(2);
    c.put('a', 1);
    c.put('b', 2);
    c.get('a'); // 'a' is now most-recently used, so 'b' should be evicted next
    c.put('c', 3);
    assert.strictEqual(c.get('b'), undefined);
    assert.strictEqual(c.get('a'), 1);
});

test('put on an existing key updates the value and recency', () => {
    const c = new LRUCache(2);
    c.put('a', 1);
    c.put('b', 2);
    c.put('a', 10); // update + mark 'a' recent
    c.put('c', 3); // evicts 'b'
    assert.strictEqual(c.get('a'), 10);
    assert.strictEqual(c.get('b'), undefined);
    assert.strictEqual(c.get('c'), 3);
});
