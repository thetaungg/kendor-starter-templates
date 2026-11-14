import { randomBytes } from 'node:crypto';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { app } from '../api/src/app.js';
import { hashPassword } from '../api/src/auth.js';
import { pool } from '../api/src/db.js';

export interface TestServer {
    base: string;
    close: () => Promise<void>;
}

export async function startServer(): Promise<TestServer> {
    const server: Server = app.listen(0, '127.0.0.1');

    await new Promise(resolve => server.once('listening', resolve));

    const { port } = server.address() as AddressInfo;

    return {
        base: `http://127.0.0.1:${port}`,
        close: async () => {
            // Gives requests that are still running a moment to finish before the pool closes.
            await new Promise(resolve => setTimeout(resolve, 2000));
            server.closeAllConnections();
            await new Promise(resolve => server.close(resolve));
            await pool.end();
        },
    };
}

export async function signIn(base: string, email: string): Promise<string> {
    const response = await fetch(`${base}/api/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password: 'spoon' }),
    });
    const body = await response.json();

    return body.token;
}

export function authed(token: string): Record<string, string> {
    return { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
}

export function uniquePhone(): string {
    return `+351 93${Math.floor(1_000_000 + Math.random() * 8_999_999)}`;
}

export function uniqueId(): string {
    return randomBytes(8).toString('hex');
}

export interface IncomingMessage {
    channel: string;
    phone: string;
    name: string;
    text: string;
    messageId?: string;
    sentAt?: Date;
}

/** What the messaging provider sends when a customer writes. */
export function customerWrites(base: string, message: IncomingMessage): Promise<Response> {
    return fetch(`${base}/api/provider/webhook`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            messageId: message.messageId ?? uniqueId(),
            channel: message.channel,
            from: { phone: message.phone, name: message.name },
            text: message.text,
            sentAt: (message.sentAt ?? new Date()).toISOString(),
        }),
    });
}

export interface TestTeam {
    id: number;
    channel: string;
    agents: string[];
}

/** A team of its own with two new agents (password "spoon"), so tests don't see each other's customers. */
export async function newTeam(): Promise<TestTeam> {
    const suffix = uniqueId();
    const channel = `test-${suffix}`;
    const { rows: teams } = await pool.query(
        'INSERT INTO teams (name, channel) VALUES ($1, $2) RETURNING id',
        [`Test team ${suffix}`, channel],
    );
    const teamId = teams[0].id;
    const agents: string[] = [];

    for (const who of ['a', 'b']) {
        const email = `${who}-${suffix}@spoonrun.test`;
        const salt = uniqueId();
        const { rows } = await pool.query(
            'INSERT INTO agents (email, name, salt, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
            [email, `Agent ${who.toUpperCase()} ${suffix.slice(0, 4)}`, salt, hashPassword('spoon', salt)],
        );

        await pool.query('INSERT INTO memberships (agent_id, team_id) VALUES ($1, $2)', [rows[0].id, teamId]);
        agents.push(email);
    }

    return { id: teamId, channel, agents };
}

/** The conversation for a customer's phone number in a team. */
export async function conversationOf(teamId: number, phone: string): Promise<number> {
    const { rows } = await pool.query(
        `SELECT c.id FROM conversations c JOIN customers ON customers.id = c.customer_id
         WHERE c.team_id = $1 AND customers.phone = $2`,
        [teamId, phone],
    );

    return rows[0].id;
}
