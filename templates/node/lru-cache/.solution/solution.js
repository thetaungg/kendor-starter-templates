// Reference solution — stripped from the candidate seed (kendor.solutionDir).
// A Map preserves insertion order, so the first key is always the least recently used.

class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
    }

    get(key) {
        if (!this.map.has(key)) return undefined;
        const value = this.map.get(key);
        this.map.delete(key);
        this.map.set(key, value);
        return value;
    }

    put(key, value) {
        if (this.map.has(key)) this.map.delete(key);
        this.map.set(key, value);
        if (this.map.size > this.capacity) {
            const oldest = this.map.keys().next().value;
            this.map.delete(oldest);
        }
    }
}

module.exports = { LRUCache };
