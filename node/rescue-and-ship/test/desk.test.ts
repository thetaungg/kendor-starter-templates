import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import {
    authed,
    conversationOf,
    customerWrites,
    newTeam,
    signIn,
    startServer,
    type TestServer,
    uniquePhone,
} from './helpers.js';

let server: TestServer;

before(async () => {
    server = await startServer();
});

after(async () => {
    await server.close();
});

test('signing in with a wrong password fails', async () => {
    const response = await fetch(`${server.base}/api/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'kofi@spoonrun.test', password: 'nope' }),
    });

    assert.equal(response.status, 401);
});

test("a customer's message reaches their team's queue", async () => {
    const team = await newTeam();
    const phone = uniquePhone();

    const delivered = await customerWrites(server.base, {
        channel: team.channel,
        phone,
        name: 'Queue Tester',
        text: 'Where is my order?',
    });

    assert.equal(delivered.ok, true);

    const token = await signIn(server.base, team.agents[0]);
    const queue = await (await fetch(`${server.base}/api/teams/${team.id}/queue`, { headers: authed(token) })).json();

    assert.equal(queue.length, 1);
    assert.equal(queue[0].customerName, 'Queue Tester');
});

test('an agent can take a customer and reply', async () => {
    const team = await newTeam();
    const phone = uniquePhone();

    await customerWrites(server.base, { channel: team.channel, phone, name: 'Reply Tester', text: 'Hi!' });

    const id = await conversationOf(team.id, phone);
    const token = await signIn(server.base, team.agents[0]);

    const taken = await fetch(`${server.base}/api/conversations/${id}/take`, { method: 'POST', headers: authed(token) });

    assert.equal(taken.status, 200);

    const replied = await fetch(`${server.base}/api/conversations/${id}/reply`, {
        method: 'POST',
        headers: authed(token),
        body: JSON.stringify({ text: 'Hello, how can I help?' }),
    });

    assert.equal(replied.status, 201);

    const conversation = await (await fetch(`${server.base}/api/conversations/${id}`, { headers: authed(token) })).json();
    const replies = conversation.messages.filter((message: { direction: string }) => message.direction === 'out');

    assert.equal(replies.length, 1);
    assert.equal(replies[0].body, 'Hello, how can I help?');
});

test('agents only see conversations of their own teams', async () => {
    const team = await newTeam();
    const other = await newTeam();
    const phone = uniquePhone();

    await customerWrites(server.base, { channel: other.channel, phone, name: 'Private Tester', text: 'Hi' });

    const id = await conversationOf(other.id, phone);
    const token = await signIn(server.base, team.agents[0]);
    const response = await fetch(`${server.base}/api/conversations/${id}`, { headers: authed(token) });

    assert.equal(response.status, 404);
});
