import express from 'express';

import { authRouter } from './routes/auth.js';
import { conversationsRouter } from './routes/conversations.js';
import { deskRouter } from './routes/desk.js';
import { teamsRouter } from './routes/teams.js';
import { webhookRouter } from './routes/webhook.js';

export const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});

app.use('/api', webhookRouter);
app.use('/api', authRouter);
app.use('/api', teamsRouter);
app.use('/api', deskRouter);
app.use('/api', conversationsRouter);
