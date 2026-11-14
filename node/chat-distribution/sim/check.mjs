// npm run check: a quick check that your system speaks the contract in CONTRACT.md.
// It says nothing about how good your rules are; `npm run day` does that.
// It resets your system, so run `npm run day` again afterwards if you want the pages filled.
//
//   npm run check
//   npm run check -- --url http://127.0.0.1:3000

import { createClient } from './http.mjs';

let baseUrl = 'http://127.0.0.1:3000';
const args = process.argv.slice(2);

for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--url') {
        baseUrl = args[i + 1].replace(/\/$/, '');
    }
}

const api = createClient(baseUrl);
const results = [];
let minute = 9 * 60;

function now() {
    const hours = String(Math.floor(minute / 60)).padStart(2, '0');
    const minutes = String(minute % 60).padStart(2, '0');

    return `2026-11-10T${hours}:${minutes}:00.000Z`;
}

function check(name, passed, detail) {
    results.push({ name, passed, detail });
}

async function tick() {
    minute += 1;

    return api.call('POST', '/sim/tick', now(), { now: now() });
}

const agents = [
    { id: 'ada', name: 'Ada', status: 'available' },
    { id: 'bo', name: 'Bo', status: 'available' },
];

async function inboxes() {
    const result = new Map();

    for (const agent of agents) {
        const answer = await api.call('GET', `/agents/${agent.id}/inbox`, now());
        result.set(agent.id, answer);
    }

    return result;
}

function findChat(views, chatId) {
    for (const [agentId, answer] of views) {
        const chats = answer.data?.chats ?? [];

        for (const chat of chats) {
            if (String(chat.id) === chatId) {
                return { agentId, chat };
            }
        }
    }

    return null;
}

async function main() {
    const reset = await api.call('POST', '/sim/reset', now(), {
        now: now(),
        openingHours: { open: '09:00', close: '17:30' },
        agents,
        clients: [{ id: 'client-1', name: 'Kim Novak', lastAgentId: 'bo', lastBooking: 'Crete, May' }],
    });

    check('POST /sim/reset answers 2xx', reset.ok, `status ${reset.status}`);

    if (!reset.ok) {
        finish();

        return;
    }

    const ticked = await tick();
    check('POST /sim/tick answers 2xx', ticked.ok, `status ${ticked.status}`);

    const first = await api.call('POST', '/chats/incoming', now(), {
        clientId: 'client-2',
        clientName: 'Lea Smit',
        text: 'Is the Lisbon trip still available?',
    });

    const chatId = first.data?.chatId === undefined ? null : String(first.data.chatId);
    check('POST /chats/incoming returns a chatId', first.ok && chatId !== null, `status ${first.status}`);

    const again = await api.call('POST', '/chats/incoming', now(), {
        clientId: 'client-2',
        clientName: 'Lea Smit',
        text: 'Hello?',
    });

    check(
        'A second message from the same client joins the same open chat',
        again.ok && String(again.data?.chatId) === chatId,
        `first ${chatId}, second ${again.data?.chatId}`,
    );

    const views = await inboxes();
    let shapeOk = true;

    for (const answer of views.values()) {
        if (!answer.ok || typeof answer.data?.status !== 'string' || !Array.isArray(answer.data?.chats)) {
            shapeOk = false;
        }
    }

    check('GET /agents/:id/inbox returns { status, chats: [] }', shapeOk, '');

    const unknown = await api.call('GET', '/agents/nobody/inbox', now());
    check('An unknown agent gets 404', unknown.status === 404, `status ${unknown.status}`);

    let found = null;

    for (let i = 0; i < 6 && found === null; i += 1) {
        found = findChat(await inboxes(), chatId);

        if (found === null) {
            await tick();
        }
    }

    check('The chat shows up in an agent inbox within a few minutes', found !== null, '');

    if (found === null) {
        finish();

        return;
    }

    let holder = found.agentId;

    if (found.chat.assignedTo === null || found.chat.assignedTo === undefined) {
        const take = await api.call('POST', `/chats/${chatId}/take`, now(), { agentId: holder });
        check('An unassigned chat can be taken', take.ok, `status ${take.status}`);
    } else {
        holder = found.chat.assignedTo;
        check('Chats carry assignedTo', agents.some((agent) => agent.id === holder), `assignedTo ${holder}`);
    }

    const other = holder === 'ada' ? 'bo' : 'ada';
    const wrongReply = await api.call('POST', `/chats/${chatId}/reply`, now(), { agentId: other, text: 'Hi!' });
    check('Someone who does not hold the chat cannot reply (4xx)', wrongReply.status >= 400 && wrongReply.status < 500, `status ${wrongReply.status}`);

    const reply = await api.call('POST', `/chats/${chatId}/reply`, now(), { agentId: holder, text: 'Hi Lea!' });
    check('The holder can reply', reply.ok, `status ${reply.status}`);

    const away = await api.call('PUT', `/agents/${holder}/status`, now(), { status: 'away' });
    const afterAway = await api.call('GET', `/agents/${holder}/inbox`, now());
    check('PUT /agents/:id/status sets Away', away.ok && afterAway.data?.status === 'away', `status ${afterAway.data?.status}`);

    const answeredStays = findChat(new Map([[holder, afterAway]]), chatId) !== null;
    check('An answered chat stays with its agent while they are Away', answeredStays, '');

    const back = await api.call('PUT', `/agents/${holder}/status`, now(), { status: 'available' });
    check('…and back to Available', back.ok, `status ${back.status}`);

    const close = await api.call('POST', `/chats/${chatId}/close`, now(), { agentId: holder });
    check('The holder can close the chat', close.ok, `status ${close.status}`);

    const afterClose = findChat(await inboxes(), chatId);
    check('A closed chat leaves the inbox', afterClose === null, '');

    await tick();

    const comeBack = await api.call('POST', '/chats/incoming', now(), {
        clientId: 'client-2',
        clientName: 'Lea Smit',
        text: 'One more question!',
    });

    check('The same client writing after a close gets an open chat again', comeBack.ok && comeBack.data?.chatId !== undefined, `status ${comeBack.status}`);

    finish();
}

function finish() {
    console.log(`\nContract check against ${baseUrl}\n`);

    let failed = 0;

    for (const result of results) {
        const mark = result.passed ? 'ok  ' : 'FAIL';

        if (!result.passed) {
            failed += 1;
        }

        let detail = '';

        if (!result.passed && result.detail) {
            detail = `  (${result.detail})`;
        }

        console.log(`  ${mark}  ${result.name}${detail}`);
    }

    const stats = api.stats();

    if (stats.problems.length > 0) {
        console.log('\nProblems:');

        for (const problem of stats.problems) {
            console.log(`  ${problem}`);
        }
    }

    console.log(`\n${results.length - failed} of ${results.length} passed.\n`);
    process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
