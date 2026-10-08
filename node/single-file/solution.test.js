const test = require('node:test');
const assert = require('node:assert');
const { solve } = require('./solution');

test('doubles two', () => {
    assert.strictEqual(solve(2), 4);
});
