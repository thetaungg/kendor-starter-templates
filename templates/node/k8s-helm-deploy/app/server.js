import { createServer } from 'node:http';

const startedAt = Date.now();
const greeting = process.env.GREETING ?? 'hello';

const server = createServer((req, res) => {
    if (req.url === '/healthz') {
        res.writeHead(200);
        res.end('ok');
        return;
    }

    if (req.url === '/readyz') {
        const warm = Date.now() - startedAt > 10_000;

        res.writeHead(warm ? 200 : 503);
        res.end(warm ? 'ready' : 'warming up');
        return;
    }

    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ greeting, pod: process.env.HOSTNAME, version: process.env.VERSION }));
});

server.listen(8080, () => console.log('orders-api on :8080'));

process.on('SIGTERM', () => server.close(() => process.exit(0)));
