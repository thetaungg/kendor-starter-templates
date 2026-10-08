import express from 'express';

import { cache, TODOS_KEY } from './cache.js';
import { pool } from './db.js';

export const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
    res.send('<h1>Todos API</h1><p>Try <a href="/api/todos">/api/todos</a>.</p>');
});

// Served from Valkey when cached; the database is read only on a miss.
app.get('/api/todos', async (_req, res) => {
    const cached = await cache.get(TODOS_KEY);

    if (cached) {
        res.set('X-Cache', 'hit').json(JSON.parse(cached));
        return;
    }

    const { rows } = await pool.query('SELECT id, title, done FROM todos ORDER BY id');

    await cache.set(TODOS_KEY, JSON.stringify(rows), 'EX', 60);
    res.set('X-Cache', 'miss').json(rows);
});

app.post('/api/todos', async (req, res) => {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';

    if (!title) {
        res.status(400).json({ error: 'title is required' });
        return;
    }

    const { rows } = await pool.query(
        'INSERT INTO todos (title) VALUES ($1) RETURNING id, title, done',
        [title],
    );

    // The cached list is now stale.
    await cache.del(TODOS_KEY);
    res.status(201).json(rows[0]);
});
