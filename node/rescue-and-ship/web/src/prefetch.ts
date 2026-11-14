import { api } from './api';

const early = new Map<string, Promise<unknown>>();

export function prefetch(path: string): void {
    if (early.has(path)) {
        return;
    }

    early.set(path, api(path));
    window.setTimeout(() => early.delete(path), 10_000);
}

export function load<T>(path: string): Promise<T> {
    const started = early.get(path);

    if (started) {
        early.delete(path);
        return started as Promise<T>;
    }

    return api<T>(path);
}
