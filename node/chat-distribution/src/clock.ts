import type { NextFunction, Request, Response } from 'express';

// The simulator runs a whole day in about a minute, so the time always comes from it, never
// from the computer's clock. Requests without X-Sim-Time (the web pages) use the last time seen.
let lastKnown = new Date('2026-11-09T07:00:00.000Z');

export function now(): Date {
    return lastKnown;
}

export function setNow(value: unknown): void {
    if (typeof value !== 'string') {
        return;
    }

    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
        lastKnown = parsed;
    }
}

export function readSimTime(req: Request, _res: Response, next: NextFunction): void {
    setNow(req.header('x-sim-time'));
    next();
}
