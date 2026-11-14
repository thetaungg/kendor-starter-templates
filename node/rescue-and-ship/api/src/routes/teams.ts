import { Router } from 'express';

import { isMember, requireAgent } from '../auth.js';
import { pool } from '../db.js';
import { listMine, listWaiting } from '../queries.js';

export const teamsRouter = Router();

teamsRouter.get('/teams/:id/open', requireAgent, async (req, res) => {
    const teamId = Number(req.params.id);

    if (!(await isMember(req.agent!.id, teamId))) {
        res.status(404).json({ error: 'no such team' });
        return;
    }

    await pool.query('UPDATE sessions SET current_team_id = $1 WHERE token = $2', [teamId, req.sessionToken]);

    const { rows } = await pool.query('SELECT id, name FROM teams WHERE id = $1', [teamId]);

    res.json(rows[0]);
});

teamsRouter.get('/teams/:id/queue', requireAgent, async (req, res) => {
    const teamId = Number(req.params.id);

    if (!(await isMember(req.agent!.id, teamId))) {
        res.status(404).json({ error: 'no such team' });
        return;
    }

    res.json(await listWaiting(teamId));
});

teamsRouter.get('/teams/:id/mine', requireAgent, async (req, res) => {
    const teamId = Number(req.params.id);

    if (!(await isMember(req.agent!.id, teamId))) {
        res.status(404).json({ error: 'no such team' });
        return;
    }

    res.json(await listMine(req.agent!.id, teamId));
});
