import { createClient } from 'redis';

export const QUEUE = 'jobs:pending';
export const DONE = 'jobs:done';

export async function connect() {
    const client = createClient({ url: process.env.REDIS_URL });

    client.on('error', err => console.error('valkey:', err.message));
    await client.connect();

    return client;
}
