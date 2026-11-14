/**
 * Friday lunch at Spoonrun, replayed in under a minute: customers and restaurants write in through
 * the messaging provider, and Kofi and Ines answer the Customers queue.
 *
 *   npm run shift
 *
 * Needs the API running (the api service, or npm run dev:api). It clears all conversations first,
 * so every run starts from the same lunchtime. Afterwards the desk shows the hour it replayed.
 */
import pg from 'pg';

const API = process.env.API_URL ?? 'http://127.0.0.1:3000';

// Like the real provider, it sends a message again when the desk doesn't confirm it in time.
const PROVIDER_WAIT_MS = 1000;
const PROVIDER_ATTEMPTS = 3;

const ROUNDS = 8;
const MINUTE = 60_000;

const CUSTOMERS = [
    'Ana Pereira', 'Rui Gomes', 'Leonor Santos', 'Miguel Rocha', 'Beatriz Lima', 'Diogo Alves',
    'Carla Mendes', 'Pedro Sousa', 'Joana Ribeiro', 'Tomás Carvalho', 'Marta Pinto', 'André Lopes',
    'Inês Martins', 'Bruno Teixeira', 'Rita Moreira', 'Nuno Correia', 'Sara Fernandes', 'Hugo Matos',
    'Clara Antunes', 'Paulo Nunes', 'Vera Cunha', 'Filipe Reis', 'Lara Monteiro', 'Gonçalo Faria',
    'Eva Cardoso', 'Duarte Vieira', 'Mia Barros', 'Simão Coelho', 'Alice Tavares', 'Rafael Pires',
];

const RESTAURANTS = [
    'Tasca do Largo', 'Ramen Ya', 'Prego Bom', 'Green Bowl Chiado', 'Pizza Forno', 'Kebab Avenida',
    'Bao House', 'Churrasqueira Sol', 'Dumpling Bar', 'Café Central',
];

const PROBLEMS = [
    'My order is 40 minutes late, where is it?',
    'The rider gave me someone else\'s bag.',
    'I was charged but the app says the order failed.',
    'Half my order is missing (no fries, no drink).',
    'Can I change the delivery address? I put the old one.',
    'The food arrived cold.',
];

const PUSHY = [16, 18, 20, 22, 24];
const WRITES_BACK_EVERY = 3;

interface Person {
    name: string;
    phone: string;
    channel: 'customers' | 'restaurants';
    firstWroteAt: number;
}

interface Delivery {
    person: Person;
    text: string;
    sentAt: number;
    messageId: string;
}

interface Agent {
    name: string;
    token: string;
    id: number;
}

function short(name: string): string {
    const [first, last] = name.split(' ');

    return `${first} ${last[0]}.`;
}

function minutes(ms: number): string {
    return `${Math.round(ms / MINUTE)} min`;
}

function mark(ok: boolean): string {
    return ok ? '   ✓' : '   ✗';
}

function row(label: string, value: string | number, ok?: boolean): string {
    const line = `  ${label.padEnd(44)} ${value}`;

    if (ok === undefined) {
        return line;
    }

    return line + mark(ok);
}

interface ScorecardLine {
    label: string;
    value: string;
    ok: boolean | null;
}

// `--scorecard` also prints the report as one JSON line, read by Kendor's own run for the reviewers.
const scorecard: { groups: { title: string; lines: ScorecardLine[] }[] } = { groups: [] };

function section(title: string): void {
    console.log(scorecard.groups.length === 0 ? title : `\n${title}`);
    scorecard.groups.push({ title, lines: [] });
}

function report(label: string, value: string | number, ok?: boolean): void {
    console.log(row(label, value, ok));
    scorecard.groups[scorecard.groups.length - 1].lines.push({
        label,
        value: String(value),
        ok: ok === undefined ? null : ok,
    });
}

async function call(path: string, token: string | null, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);

    if (token) headers.set('authorization', `Bearer ${token}`);
    if (init.body) headers.set('content-type', 'application/json');

    return fetch(`${API}/api${path}`, { ...init, headers });
}

async function signIn(email: string): Promise<Agent> {
    const login = await call('/login', null, {
        method: 'POST',
        body: JSON.stringify({ email, password: 'spoon' }),
    });
    const { token } = await login.json();
    const me = await (await call('/me', token)).json();

    return { name: me.agent.name.split(' ')[0], token, id: me.agent.id };
}

/** The provider delivers one message, sending it again while the desk doesn't confirm in time. */
async function deliver(delivery: Delivery): Promise<number> {
    let resends = 0;

    for (let attempt = 1; attempt <= PROVIDER_ATTEMPTS; attempt += 1) {
        try {
            const response = await fetch(`${API}/api/provider/webhook`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    messageId: delivery.messageId,
                    channel: delivery.person.channel,
                    from: { phone: delivery.person.phone, name: delivery.person.name },
                    text: delivery.text,
                    sentAt: new Date(delivery.sentAt).toISOString(),
                }),
                signal: AbortSignal.timeout(PROVIDER_WAIT_MS),
            });

            await response.arrayBuffer();

            if (response.ok) {
                return resends;
            }
        } catch {
            // No answer in time: the provider tries again.
        }

        if (attempt < PROVIDER_ATTEMPTS) {
            resends += 1;
            await new Promise(resolve => setTimeout(resolve, 150));
        }
    }

    return resends;
}

async function deliverAll(deliveries: Delivery[]): Promise<number> {
    let resends = 0;
    const batch = 20;

    for (let start = 0; start < deliveries.length; start += batch) {
        const results = await Promise.all(deliveries.slice(start, start + batch).map(deliver));

        for (const count of results) {
            resends += count;
        }
    }

    return resends;
}

async function reset(db: pg.Pool): Promise<void> {
    await db.query('TRUNCATE customers, conversations, messages, reads RESTART IDENTITY CASCADE');
    await db.query(
        `INSERT INTO memberships (agent_id, team_id)
         SELECT agents.id, 1 FROM agents WHERE email IN ('kofi@spoonrun.test', 'ines@spoonrun.test')
         ON CONFLICT DO NOTHING`,
    );
}

interface QueueRow {
    id: number;
    customerName: string;
}

async function queue(agent: Agent): Promise<QueueRow[]> {
    const response = await call('/teams/1/queue', agent.token);

    if (!response.ok) {
        return [];
    }

    return response.json();
}

async function take(agent: Agent, conversationId: number): Promise<boolean> {
    const response = await call(`/conversations/${conversationId}/take`, agent.token, { method: 'POST' });

    await response.arrayBuffer();

    return response.ok;
}

async function answer(agent: Agent, conversation: QueueRow): Promise<void> {
    await call(`/conversations/${conversation.id}/read`, agent.token, { method: 'POST' });
    await call(`/conversations/${conversation.id}/reply`, agent.token, {
        method: 'POST',
        body: JSON.stringify({
            text: `Hi ${conversation.customerName.split(' ')[0]}, ${agent.name} here. Sorry for the wait, I'm on it.`,
        }),
    });
}

async function main() {
    const db = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });

    try {
        const health = await fetch(`${API}/api/health`).catch(() => null);

        if (!health || !health.ok) {
            console.error(`The API isn't answering at ${API}. Start it first (the api service, or npm run dev:api).`);
            process.exitCode = 1;
            return;
        }

        await reset(db);

        const started = performance.now();
        const run = Date.now().toString(36);
        const end = Date.now();
        const start = end - 60 * MINUTE;

        const people: Person[] = [];
        const firstMessages: Delivery[] = [];
        const laterMessages: Delivery[] = [];

        for (let n = 0; n < CUSTOMERS.length; n += 1) {
            const name = CUSTOMERS[n];
            const person: Person = {
                name,
                phone: `+351 91${String(7000000 + n * 7919).padStart(7, '0')}`,
                channel: 'customers',
                firstWroteAt: start + n * 100_000,
            };

            people.push(person);
            firstMessages.push({
                person,
                text: PROBLEMS[n % PROBLEMS.length],
                sentAt: person.firstWroteAt,
                messageId: `${run}-c${n}-1`,
            });
        }

        for (let n = 0; n < RESTAURANTS.length; n += 1) {
            const name = RESTAURANTS[n];
            const person: Person = {
                name,
                phone: `+351 21${String(3000000 + n * 104_729).padStart(7, '0')}`,
                channel: 'restaurants',
                firstWroteAt: start + n * 5 * MINUTE,
            };

            people.push(person);
            firstMessages.push({
                person,
                text: 'Our tablet keeps missing orders, can someone call us?',
                sentAt: person.firstWroteAt,
                messageId: `${run}-r${n}-1`,
            });
        }

        for (let n = 0; n < PUSHY.length; n += 1) {
            const person = people[PUSHY[n]];
            const id = `${run}-c${PUSHY[n]}`;

            laterMessages.push({ person, text: 'hello??', sentAt: end - 9 * MINUTE + n * 20_000, messageId: `${id}-2` });
            laterMessages.push({ person, text: 'hello???', sentAt: end - 3 * MINUTE + n * 20_000, messageId: `${id}-3` });
        }

        const kofi = await signIn('kofi@spoonrun.test');
        const ines = await signIn('ines@spoonrun.test');

        console.log(
            `Friday lunch, replayed: ${CUSTOMERS.length} customers and ${RESTAURANTS.length} restaurants write in over an hour;`,
        );
        console.log('Kofi and Ines answer the Customers queue.\n');

        let resends = await deliverAll(firstMessages);
        resends += await deliverAll(laterMessages);

        const customersByName = new Map<string, Person>();

        for (const person of people) {
            customersByName.set(person.name, person);
        }

        // The queue as Kofi sees it when he sits down.
        const firstLook = await queue(kofi);

        // Kofi and Ines both pick the customer at the top of the queue at the same moment.
        const served: string[] = [];
        const servedNames = new Set<string>();
        const takenTwice = new Set<number>();

        for (let round = 0; round < ROUNDS; round += 1) {
            const [kofiQueue, inesQueue] = await Promise.all([queue(kofi), queue(ines)]);

            if (kofiQueue.length === 0 || inesQueue.length === 0) {
                break;
            }

            const picks = [
                { agent: kofi, conversation: kofiQueue[0] },
                { agent: ines, conversation: inesQueue[0] },
            ];
            const results = await Promise.all(picks.map(pick => take(pick.agent, pick.conversation.id)));

            if (results[0] && results[1] && picks[0].conversation.id === picks[1].conversation.id) {
                takenTwice.add(picks[0].conversation.id);
            }

            // Whoever got their customer answers first; whoever didn't goes back to the queue.
            const answers: { agent: Agent; conversation: QueueRow }[] = [];
            const retries: Agent[] = [];

            for (let n = 0; n < picks.length; n += 1) {
                if (results[n]) {
                    answers.push(picks[n]);
                } else {
                    retries.push(picks[n].agent);
                }
            }

            for (const agent of retries) {
                const again = await queue(agent);

                if (again.length > 0 && (await take(agent, again[0].id))) {
                    answers.push({ agent, conversation: again[0] });
                }
            }

            for (const { agent, conversation } of answers) {
                await answer(agent, conversation);

                if (!servedNames.has(conversation.customerName)) {
                    servedNames.add(conversation.customerName);
                    served.push(conversation.customerName);
                }
            }
        }

        // Some customers write back after their answer.
        const writeBacks: Delivery[] = [];

        for (let n = 0; n < served.length; n += 1) {
            const person = customersByName.get(served[n]);

            if (!person || n % WRITES_BACK_EVERY !== 0) {
                continue;
            }

            writeBacks.push({
                person,
                text: 'Thanks! Any news on the rider?',
                sentAt: Date.now(),
                messageId: `${run}-c${CUSTOMERS.indexOf(person.name)}-back`,
            });
        }

        const wroteBack: string[] = [];

        for (const delivery of writeBacks) {
            wroteBack.push(delivery.person.phone);
        }

        resends += await deliverAll(writeBacks);

        await new Promise(resolve => setTimeout(resolve, 300));

        // What the customers and the desk ended up with.
        const { rows: copies } = await db.query(
            `SELECT customers.phone, m.body, COUNT(*)::int AS copies
             FROM messages m
             JOIN conversations c ON c.id = m.conversation_id
             JOIN customers ON customers.id = c.customer_id
             WHERE m.direction = 'in'
             GROUP BY customers.phone, m.body`,
        );
        let shownTwice = 0;

        for (const copy of copies) {
            if (copy.copies > 1) {
                shownTwice += 1;
            }
        }

        const { rows: twoAnswers } = await db.query(
            `SELECT COUNT(*)::int AS count FROM (
                 SELECT conversation_id FROM messages WHERE direction = 'out'
                 GROUP BY conversation_id HAVING COUNT(DISTINCT agent_id) > 1
             ) AS doubled`,
        );

        // Fair means: nobody is answered while someone who has waited longer is still waiting.
        const waiting = new Set<string>();

        for (const name of CUSTOMERS) {
            waiting.add(name);
        }

        let outOfOrder = 0;

        for (const name of served) {
            const person = customersByName.get(name);

            waiting.delete(name);

            if (!person) {
                continue;
            }

            for (const other of waiting) {
                if (customersByName.get(other)!.firstWroteAt < person.firstWroteAt) {
                    outOfOrder += 1;
                    break;
                }
            }
        }

        let longestName = '';
        let longestWait = 0;

        for (const name of waiting) {
            const wait = end - customersByName.get(name)!.firstWroteAt;

            if (wait > longestWait) {
                longestWait = wait;
                longestName = name;
            }
        }

        let topOk = false;
        let topLine = 'empty';

        if (firstLook.length > 0) {
            let oldest = customersByName.get(firstLook[0].customerName)!;

            for (const entry of firstLook) {
                const person = customersByName.get(entry.customerName);

                if (person && person.firstWroteAt < oldest.firstWroteAt) {
                    oldest = person;
                }
            }

            const top = customersByName.get(firstLook[0].customerName)!;

            topOk = top === oldest;
            topLine = `${short(top.name)}, waiting ${minutes(end - top.firstWroteAt)}`;

            if (!topOk) {
                topLine += ` (${short(oldest.name)}: ${minutes(end - oldest.firstWroteAt)})`;
            }
        }

        const badges: { agent: Agent; shown: number; really: number }[] = [];

        for (const agent of [kofi, ines]) {
            const response = await call('/badge', agent.token);
            const body = await response.json();
            // Agents read every conversation they answered, so what's new is what customers wrote back.
            const { rows } = await db.query(
                `SELECT COUNT(*)::int AS really FROM conversations c
                 JOIN customers ON customers.id = c.customer_id
                 WHERE c.assigned_agent_id = $1 AND c.status = 'open' AND customers.phone = ANY($2)`,
                [agent.id, wroteBack],
            );

            badges.push({ agent, shown: body.unread, really: rows[0].really });
        }

        section('Messages');
        report('customer messages shown twice or more', shownTwice, shownTwice === 0);
        report('messages the provider had to send again', resends, resends === 0);

        section('Taking customers');
        report('customers answered', served.length);
        report('customers taken by Kofi and Ines at once', takenTwice.size, takenTwice.size === 0);
        report('customers who got two different answers', twoAnswers[0].count, twoAnswers[0].count === 0);

        section('Who waited');
        report('top of the queue', topLine, topOk);
        report('answered before someone who waited longer', outOfOrder, outOfOrder === 0);

        if (longestName) {
            report('longest wait still unanswered', `${minutes(longestWait)} (${short(longestName)})`);
        }

        section('The red number next to "Mine"');

        for (const badge of badges) {
            report(`${badge.agent.name}'s badge`, `${badge.shown} (really ${badge.really})`, badge.shown === badge.really);
        }

        console.log(`\nThe replay took ${((performance.now() - started) / 1000).toFixed(1)} s.`);
        console.log(
            'A good lunch: every message shown once, every customer answered by one person, the longest wait answered first, and badges that tell the truth.',
        );

        if (process.argv.includes('--scorecard')) {
            console.log(`KENDOR-SCORECARD ${JSON.stringify(scorecard)}`);
        }
    } finally {
        await db.end();
    }
}

main().catch(err => {
    console.error(err);
    process.exitCode = 1;
});
