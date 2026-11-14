// The agent's inbox. It uses the same API as the simulator; without X-Sim-Time the server
// uses the last simulated time it saw.

const agentSelect = document.getElementById('agent');
const statusButton = document.getElementById('status');
const chatsBox = document.getElementById('chats');
const clockText = document.getElementById('clock');

let agentId = localStorage.getItem('agentId');
let typing = false;

async function api(method, path, body) {
    const response = await fetch(path, {
        method,
        headers: { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    return response.json();
}

async function loadAgents() {
    const overview = await api('GET', '/api/overview');
    agentSelect.innerHTML = '';

    for (const agent of overview.agents) {
        const option = document.createElement('option');
        option.value = agent.id;
        option.textContent = agent.name;
        agentSelect.appendChild(option);
    }

    const known = overview.agents.some(agent => agent.id === agentId);

    if (!known && overview.agents.length > 0) {
        agentId = overview.agents[0].id;
    }

    agentSelect.value = agentId;
}

function messageLine(message) {
    const line = document.createElement('div');
    line.className = `message ${message.from}`;
    line.textContent = `${message.at.slice(11, 16)} ${message.from === 'client' ? 'Client' : message.agentId}: ${message.text}`;

    return line;
}

function chatCard(chat) {
    const card = document.createElement('div');
    card.className = 'chat';

    const title = document.createElement('h3');
    title.textContent = chat.clientName;
    card.appendChild(title);

    for (const message of chat.messages) {
        card.appendChild(messageLine(message));
    }

    const actions = document.createElement('div');
    actions.className = 'actions';

    if (chat.assignedTo === null) {
        const take = document.createElement('button');
        take.textContent = 'Take';
        take.onclick = async () => {
            await api('POST', `/chats/${chat.id}/take`, { agentId });
            refresh();
        };
        actions.appendChild(take);
    } else {
        const input = document.createElement('input');
        input.placeholder = 'Reply…';
        input.onfocus = () => (typing = true);
        input.onblur = () => (typing = false);

        const send = document.createElement('button');
        send.textContent = 'Send';
        send.onclick = async () => {
            await api('POST', `/chats/${chat.id}/reply`, { agentId, text: input.value });
            typing = false;
            refresh();
        };

        const close = document.createElement('button');
        close.textContent = 'Close';
        close.onclick = async () => {
            await api('POST', `/chats/${chat.id}/close`, { agentId });
            refresh();
        };

        actions.append(input, send, close);
    }

    card.appendChild(actions);

    return card;
}

const NO_DAY_YET =
    '<p class="muted">No day is running yet. Run <code>npm run day</code> in the terminal: the team and their chats appear here as the day goes by.</p>';

async function refresh() {
    if (typing) {
        return;
    }

    // The team only exists once a day starts, so keep asking until it does.
    if (agentSelect.options.length === 0) {
        await loadAgents();
    }

    const hasTeam = agentSelect.options.length > 0;
    agentSelect.parentElement.hidden = !hasTeam;
    statusButton.hidden = !hasTeam;

    if (!hasTeam) {
        chatsBox.innerHTML = NO_DAY_YET;

        return;
    }

    const inbox = await api('GET', `/agents/${agentId}/inbox`);
    const overview = await api('GET', '/api/overview');
    clockText.textContent = `Simulated time ${overview.now.slice(11, 16)}`;
    statusButton.textContent = inbox.status === 'available' ? 'Available · go away' : 'Away · go available';
    statusButton.dataset.status = inbox.status;

    chatsBox.innerHTML = '';

    if (!inbox.chats || inbox.chats.length === 0) {
        chatsBox.innerHTML = '<p class="muted">No chats. Run <code>npm run day</code> in the terminal to replay a day.</p>';

        return;
    }

    for (const chat of inbox.chats) {
        chatsBox.appendChild(chatCard(chat));
    }
}

agentSelect.onchange = () => {
    agentId = agentSelect.value;
    localStorage.setItem('agentId', agentId);
    refresh();
};

statusButton.onclick = async () => {
    const next = statusButton.dataset.status === 'available' ? 'away' : 'available';
    await api('PUT', `/agents/${agentId}/status`, { status: next });
    refresh();
};

refresh();
setInterval(refresh, 2000);
