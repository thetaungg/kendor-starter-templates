import { createHash, randomBytes } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

import { pool } from './db.js';

export interface Agent {
    id: number;
    email: string;
    name: string;
}

declare module 'express-serve-static-core' {
    interface Request {
        agent?: Agent;
        sessionToken?: string;
    }
}

export function hashPassword(password: string, salt: string): string {
    return createHash('sha256').update(password + salt).digest('hex');
}

export async function login(email: string, password: string): Promise<string | null> {
    const { rows } = await pool.query(
        'SELECT id, salt, password_hash FROM agents WHERE email = $1',
        [email],
    );
    const agent = rows[0];

    if (!agent || hashPassword(password, agent.salt) !== agent.password_hash) {
        return null;
    }

    const { rows: teams } = await pool.query(
        'SELECT team_id FROM memberships WHERE agent_id = $1 ORDER BY team_id LIMIT 1',
        [agent.id],
    );
    const firstTeam = teams.length > 0 ? teams[0].team_id : null;
    const token = randomBytes(24).toString('hex');

    await pool.query(
        'INSERT INTO sessions (token, agent_id, current_team_id) VALUES ($1, $2, $3)',
        [token, agent.id, firstTeam],
    );

    return token;
}

export async function requireAgent(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

    if (!token) {
        res.status(401).json({ error: 'sign in first' });
        return;
    }

    const { rows } = await pool.query(
        `SELECT agents.id, agents.email, agents.name
         FROM sessions JOIN agents ON agents.id = sessions.agent_id
         WHERE sessions.token = $1`,
        [token],
    );

    if (rows.length === 0) {
        res.status(401).json({ error: 'sign in first' });
        return;
    }

    req.agent = rows[0];
    req.sessionToken = token;
    next();
}

export async function isMember(agentId: number, teamId: number): Promise<boolean> {
    const { rows } = await pool.query(
        'SELECT 1 FROM memberships WHERE agent_id = $1 AND team_id = $2',
        [agentId, teamId],
    );

    return rows.length > 0;
}
