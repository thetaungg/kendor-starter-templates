const test = require('node:test');
const assert = require('node:assert');

const { tokenize, slugify } = require('./solution');

test('tokenize splits on non-alphanumeric runs and lowercases', () => {
    assert.deepStrictEqual(tokenize('Hello, World! 123'), ['hello', 'world', '123']);
});

test('tokenize returns an empty array when there are no tokens', () => {
    assert.deepStrictEqual(tokenize('   ...!!!   '), []);
});

test('slugify collapses separators to single dashes', () => {
    assert.strictEqual(slugify('  Hello, World!  '), 'hello-world');
});

test('slugify has no leading or trailing dashes', () => {
    assert.strictEqual(slugify('--Node.js Rocks--'), 'node-js-rocks');
});
