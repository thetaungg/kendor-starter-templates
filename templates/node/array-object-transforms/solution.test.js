const test = require('node:test');
const assert = require('node:assert');

const { groupBy, unique, sumBy } = require('./solution');

test('groupBy buckets items by the key function preserving order', () => {
    assert.deepStrictEqual(
        groupBy([1, 2, 3, 4], (n) => (n % 2 === 0 ? 'even' : 'odd')),
        { odd: [1, 3], even: [2, 4] },
    );
});

test('groupBy returns an empty object for an empty array', () => {
    assert.deepStrictEqual(groupBy([], () => 'x'), {});
});

test('unique removes duplicates keeping first-seen order', () => {
    assert.deepStrictEqual(unique([1, 1, 2, 3, 3, 3, 2]), [1, 2, 3]);
});

test('unique works on strings', () => {
    assert.deepStrictEqual(unique(['a', 'b', 'a', 'c']), ['a', 'b', 'c']);
});

test('sumBy sums the projected values', () => {
    assert.strictEqual(sumBy([{ n: 2 }, { n: 5 }, { n: 3 }], (x) => x.n), 10);
});

test('sumBy returns 0 for an empty array', () => {
    assert.strictEqual(sumBy([], (x) => x), 0);
});
