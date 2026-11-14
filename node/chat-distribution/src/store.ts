import { now } from './clock.js';

// Everything lives in memory: `POST /sim/reset` starts a fresh day.

export type AgentStatus = 'available' | 'away';

export type Agent = {
    id: string;
    name: string;
    status: AgentStatus;
};

export type Client = {
    id: string;
    name: string;
    lastAgentId: string | null;
};

export type Message = {
    from: 'client' | 'agent';
    agentId: string | null;
    text: string;
    at: string;
};

export type Chat = {
    id: string;
    clientId: string;
    clientName: string;
    assignedTo: string | null;
    closed: boolean;
    createdAt: string;
    firstReplyAt: string | null;
    closedAt: string | null;
    messages: Message[];
};

type ResetInput = {
    agents?: { id: string; name: string; status?: AgentStatus }[];
    clients?: { id: string; name: string; lastAgentId?: string | null }[];
};

const agents = new Map<string, Agent>();
const clients = new Map<string, Client>();
const chats = new Map<string, Chat>();
let nextChatNumber = 1;

export function resetDay(input: ResetInput): void {
    agents.clear();
    clients.clear();
    chats.clear();
    nextChatNumber = 1;

    for (const agent of input.agents ?? []) {
        agents.set(agent.id, { id: agent.id, name: agent.name, status: agent.status ?? 'available' });
    }

    for (const client of input.clients ?? []) {
        clients.set(client.id, { id: client.id, name: client.name, lastAgentId: client.lastAgentId ?? null });
    }
}

export function tick(): void {
    // The grab model has no timers, so nothing happens when time passes.
}

export function findAgent(id: string): Agent | undefined {
    return agents.get(id);
}

export function listAgents(): Agent[] {
    return [...agents.values()];
}

export function listChats(): Chat[] {
    return [...chats.values()];
}

function openChatOf(clientId: string): Chat | undefined {
    for (const chat of chats.values()) {
        if (chat.clientId === clientId && !chat.closed) {
            return chat;
        }
    }

    return undefined;
}

export function receiveMessage(clientId: string, clientName: string, text: string): Chat {
    const at = now().toISOString();
    let chat = openChatOf(clientId);

    if (!chat) {
        chat = {
            id: `chat-${nextChatNumber}`,
            clientId,
            clientName,
            assignedTo: null,
            closed: false,
            createdAt: at,
            firstReplyAt: null,
            closedAt: null,
            messages: [],
        };

        nextChatNumber += 1;
        chats.set(chat.id, chat);
    }

    chat.messages.push({ from: 'client', agentId: null, text, at });

    return chat;
}

// Grab model: every agent sees every chat nobody has taken yet, plus their own.
export function inboxOf(agentId: string): Chat[] {
    const result: Chat[] = [];

    for (const chat of chats.values()) {
        if (chat.closed) {
            continue;
        }

        if (chat.assignedTo === agentId || chat.assignedTo === null) {
            result.push(chat);
        }
    }

    return result;
}

export type ActionResult = { ok: true } | { ok: false; status: number; error: string };

export function takeChat(chatId: string, agentId: string): ActionResult {
    const chat = chats.get(chatId);

    if (!chat || chat.closed) {
        return { ok: false, status: 404, error: 'No such open chat' };
    }

    if (chat.assignedTo !== null && chat.assignedTo !== agentId) {
        return { ok: false, status: 409, error: 'Someone else already took this chat' };
    }

    chat.assignedTo = agentId;

    return { ok: true };
}

export function replyToChat(chatId: string, agentId: string, text: string): ActionResult {
    const chat = chats.get(chatId);

    if (!chat || chat.closed) {
        return { ok: false, status: 404, error: 'No such open chat' };
    }

    if (chat.assignedTo !== agentId) {
        return { ok: false, status: 409, error: 'This chat is not yours' };
    }

    const at = now().toISOString();

    chat.messages.push({ from: 'agent', agentId, text, at });

    if (chat.firstReplyAt === null) {
        chat.firstReplyAt = at;
    }

    return { ok: true };
}

export function closeChat(chatId: string, agentId: string): ActionResult {
    const chat = chats.get(chatId);

    if (!chat || chat.closed) {
        return { ok: false, status: 404, error: 'No such open chat' };
    }

    if (chat.assignedTo !== agentId) {
        return { ok: false, status: 409, error: 'This chat is not yours' };
    }

    chat.closed = true;
    chat.closedAt = now().toISOString();

    return { ok: true };
}

export function setStatus(agentId: string, status: AgentStatus): ActionResult {
    const agent = agents.get(agentId);

    if (!agent) {
        return { ok: false, status: 404, error: 'No such agent' };
    }

    agent.status = status;

    return { ok: true };
}
