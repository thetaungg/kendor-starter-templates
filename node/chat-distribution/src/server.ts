import express from 'express';

import { now, readSimTime, setNow } from './clock.js';
import {
    type ActionResult,
    type Chat,
    closeChat,
    findAgent,
    inboxOf,
    listAgents,
    listChats,
    receiveMessage,
    replyToChat,
    resetDay,
    setStatus,
    takeChat,
    tick,
} from './store.js';

const app = express();

app.use(express.json());
app.use(readSimTime);
app.use(express.static('public'));

function send(res: express.Response, result: ActionResult): void {
    if (result.ok) {
        res.json({ ok: true });

        return;
    }

    res.status(result.status).json({ error: result.error });
}

function chatForInbox(chat: Chat) {
    return {
        id: chat.id,
        clientId: chat.clientId,
        clientName: chat.clientName,
        assignedTo: chat.assignedTo,
        messages: chat.messages,
    };
}

// ---- The contract (CONTRACT.md) ----

app.post('/sim/reset', (req, res) => {
    setNow(req.body?.now);
    resetDay(req.body ?? {});
    res.json({ ok: true });
});

app.post('/sim/tick', (req, res) => {
    setNow(req.body?.now);
    tick();
    res.json({ ok: true });
});

app.post('/chats/incoming', (req, res) => {
    const { clientId, clientName, text } = req.body ?? {};

    if (typeof clientId !== 'string' || typeof text !== 'string') {
        res.status(400).json({ error: 'clientId and text are required' });

        return;
    }

    const chat = receiveMessage(clientId, clientName ?? clientId, text);
    res.json({ chatId: chat.id });
});

app.get('/agents/:id/inbox', (req, res) => {
    const agent = findAgent(req.params.id);

    if (!agent) {
        res.status(404).json({ error: 'No such agent' });

        return;
    }

    const chats = inboxOf(agent.id).map(chatForInbox);
    res.json({ agentId: agent.id, status: agent.status, chats });
});

app.put('/agents/:id/status', (req, res) => {
    const status = req.body?.status;

    if (status !== 'available' && status !== 'away') {
        res.status(400).json({ error: 'status must be available or away' });

        return;
    }

    send(res, setStatus(req.params.id, status));
});

app.post('/chats/:id/take', (req, res) => {
    send(res, takeChat(req.params.id, req.body?.agentId));
});

app.post('/chats/:id/reply', (req, res) => {
    send(res, replyToChat(req.params.id, req.body?.agentId, String(req.body?.text ?? '')));
});

app.post('/chats/:id/close', (req, res) => {
    send(res, closeChat(req.params.id, req.body?.agentId));
});

// ---- For the web pages only ----

app.get('/api/overview', (_req, res) => {
    const chats = listChats();
    const open = [];
    let closedToday = 0;

    for (const chat of chats) {
        if (chat.closed) {
            closedToday += 1;
        } else {
            open.push(chat);
        }
    }

    res.json({ now: now().toISOString(), agents: listAgents(), openChats: open, closedToday });
});

// The simulator calls port 3000 (CONTRACT.md).
const port = Number(process.env.APP_PORT ?? 3000);

app.listen(port, '0.0.0.0', () => {
    console.log(`Bluefin chats on http://localhost:${port}`);
});
