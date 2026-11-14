// A bare manager page: who is in, and which chats are open.

async function refresh() {
    const response = await fetch('/api/overview');
    const overview = await response.json();

    document.getElementById('clock').textContent =
        `Simulated time ${overview.now.slice(11, 16)} · closed today: ${overview.closedToday}`;

    if (overview.agents.length === 0) {
        document.getElementById('clock').innerHTML =
            'No day is running yet. Run <code>npm run day</code> in the terminal to replay one.';
        document.getElementById('team').innerHTML = '';
        document.getElementById('open').innerHTML = '';

        return;
    }

    const counts = {};

    for (const chat of overview.openChats) {
        const key = chat.assignedTo ?? 'nobody';
        counts[key] = (counts[key] ?? 0) + 1;
    }

    let teamRows = '<tr><th>Agent</th><th>Status</th><th>Open chats</th></tr>';

    for (const agent of overview.agents) {
        teamRows += `<tr><td>${agent.name}</td><td>${agent.status}</td><td>${counts[agent.id] ?? 0}</td></tr>`;
    }

    document.getElementById('team').innerHTML = teamRows;

    let chatRows = '<tr><th>Client</th><th>Started</th><th>With</th></tr>';

    for (const chat of overview.openChats) {
        chatRows += `<tr><td>${chat.clientName}</td><td>${chat.createdAt.slice(11, 16)}</td><td>${chat.assignedTo ?? '-'}</td></tr>`;
    }

    document.getElementById('open').innerHTML = chatRows;
}

refresh();
setInterval(refresh, 2000);
