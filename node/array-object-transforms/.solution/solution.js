// Reference solution — stripped from the candidate seed (kendor.solutionDir).

function groupBy(items, keyFn) {
    const out = {};
    for (const item of items) {
        const key = keyFn(item);
        (out[key] ??= []).push(item);
    }
    return out;
}

function unique(items) {
    const seen = new Set();
    const out = [];
    for (const item of items) {
        if (!seen.has(item)) {
            seen.add(item);
            out.push(item);
        }
    }
    return out;
}

function sumBy(items, valueFn) {
    return items.reduce((acc, item) => acc + valueFn(item), 0);
}

module.exports = { groupBy, unique, sumBy };
