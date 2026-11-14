// Deterministic random numbers: the same seed always gives the same day.

function mix(hash, value) {
    let h = hash ^ value;
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    h = h ^ (h >>> 16);

    return h >>> 0;
}

function hashText(text) {
    let h = 2166136261;

    for (let i = 0; i < text.length; i += 1) {
        h = Math.imul(h ^ text.charCodeAt(i), 16777619);
    }

    return h >>> 0;
}

// A number in [0, 1) that depends only on the seed and the keys, never on the order of calls,
// so the people in the day behave the same whatever the system under test does.
export function chance(seed, ...keys) {
    let h = mix(0x9e3779b9, seed);

    for (const key of keys) {
        const value = typeof key === 'number' ? key : hashText(String(key));
        h = mix(h, value);
    }

    return h / 4294967296;
}

export function between(seed, low, high, ...keys) {
    const r = chance(seed, ...keys);

    return low + Math.floor(r * (high - low + 1));
}

export function pick(seed, list, ...keys) {
    const index = Math.floor(chance(seed, ...keys) * list.length);

    return list[index];
}
