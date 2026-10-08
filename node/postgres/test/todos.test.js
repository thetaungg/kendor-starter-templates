import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { app } from '../src/app.js';
import { cache } from '../src/cache.js';
import { pool } from '../src/db.js';

let server;
let base;

before(async () => {
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    server.close();
    await pool.end();
    await cache.quit();
});

test('lists the seeded todos', async () => {
    const response = await fetch(`${base}/api/todos`);
    const todos = await response.json();
    const titles = todos.map(todo => todo.title);

    assert.equal(response.status, 200);
    assert.ok(titles.includes('Read the brief'));
    assert.ok(titles.includes('Write the first endpoint'));
});

test('creates a todo', async () => {
    const response = await fetch(`${base}/api/todos`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: 'Ship it' }),
    });
    const todo = await response.json();

    assert.equal(response.status, 201);
    assert.equal(todo.title, 'Ship it');
    assert.equal(todo.done, false);
});

test('rejects a todo without a title', async () => {
    const response = await fetch(`${base}/api/todos`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
    });

    assert.equal(response.status, 400);
});

test('caches the list and refreshes it after a new todo', async () => {
    await fetch(`${base}/api/todos`);

    const cached = await fetch(`${base}/api/todos`);

    assert.equal(cached.headers.get('x-cache'), 'hit');

    await fetch(`${base}/api/todos`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: 'Cache me' }),
    });

    const fresh = await fetch(`${base}/api/todos`);
    const titles = (await fresh.json()).map(todo => todo.title);

    assert.equal(fresh.headers.get('x-cache'), 'miss');
    assert.ok(titles.includes('Cache me'));
});
