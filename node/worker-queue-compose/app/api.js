import { createServer } from 'node:http';

import { connect, DONE, QUEUE } from './queue.js';

const client = await connect();

async function readJson(req) {
    let body = '';

    for await (const chunk of req) {
        body += chunk;
    }

    return body ? JSON.parse(body) : {};
}

const server = createServer(async (req, res) => {
    try {
        if (req.method === 'POST' && req.url === '/jobs') {
            const { n = 1 } = await readJson(req);

            for (let i = 0; i < n; i += 1) {
                const job = { id: crypto.randomUUID(), payload: Math.floor(Math.random() * 1000) };
                await client.lPush(QUEUE, JSON.stringify(job));
            }

            res.writeHead(202, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ queued: n }));
            return;
        }

        if (req.method === 'GET' && req.url === '/stats') {
            const pending = await client.lLen(QUEUE);
            const done = await client.lLen(DONE);

            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ pending, done }));
            return;
        }

        res.writeHead(404);
        res.end();
    } catch (err) {
        res.writeHead(500);
        res.end(String(err));
    }
});

server.listen(3000, () => console.log('api on :3000'));
