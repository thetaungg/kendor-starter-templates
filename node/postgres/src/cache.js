import Redis from 'ioredis';

// REDIS_URL points at the Valkey running in this sandbox; ioredis speaks to it as to Redis.
export const cache = new Redis(process.env.REDIS_URL);

export const TODOS_KEY = 'todos:all';
