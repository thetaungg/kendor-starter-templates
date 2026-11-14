import { Router } from 'express';

import { login, requireAgent } from '../auth.js';
import { pool } from '../db.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const token = await login(email, password);

    if (!token) {
        res.status(401).json({ error: 'wrong email or password' });
        return;
    }

    res.json({ token });
});

authRouter.get('/me', requireAgent, async (req, res) => {
    const agent = req.agent!;

    const { rows: sessions } = await pool.query(
        'SELECT current_team_id AS "currentTeamId" FROM sessions WHERE token = $1',
        [req.sessionToken],
    );

    const { rows: teams } = await pool.query(
        `SELECT teams.id, teams.name FROM teams
         JOIN memberships ON memberships.team_id = teams.id
         WHERE memberships.agent_id = $1
         ORDER BY teams.id`,
        [agent.id],
    );

    res.json({ agent, currentTeamId: sessions[0].currentTeamId, teams });
});
