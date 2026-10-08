import { connect, DONE, QUEUE } from './queue.js';

const client = await connect();
const name = process.env.HOSTNAME ?? 'worker';

// Simulated work: slow, and fails now and then.
async function handle(job) {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    if (Math.random() < 0.1) {
        throw new Error(`job ${job.id} failed`);
    }

    return job.payload * 2;
}

console.log(`${name} waiting for jobs`);

while (true) {
    const raw = await client.rPop(QUEUE);

    if (!raw) {
        await new Promise(resolve => setTimeout(resolve, 250));
        continue;
    }

    const job = JSON.parse(raw);

    try {
        const result = await handle(job);
        await client.lPush(DONE, JSON.stringify({ ...job, result, by: name }));
        console.log(`${name} done ${job.id}`);
    } catch (err) {
        console.error(`${name}: ${err.message}`);
    }
}
