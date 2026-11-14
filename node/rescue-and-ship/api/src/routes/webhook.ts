import { Router } from 'express';

import { pool } from '../db.js';
import { latestOrderFor } from '../orders.js';

export const webhookRouter = Router();

function text(value: unknown): string {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim();
}

/** The messaging provider calls this for every message a customer or restaurant sends us. */
webhookRouter.post('/provider/webhook', async (req, res) => {
    const body = req.body ?? {};
    const messageId = text(body.messageId);
    const channel = text(body.channel);
    const phone = text(body.from?.phone);
    const name = text(body.from?.name) || phone;
    const message = text(body.text);
    const sentAt = body.sentAt ? new Date(body.sentAt) : new Date();

    if (!messageId || !channel || !phone || !message || Number.isNaN(sentAt.getTime())) {
        res.status(400).json({ error: 'messageId, channel, from.phone and text are required' });
        return;
    }

    const { rows: teams } = await pool.query('SELECT id FROM teams WHERE channel = $1', [channel]);

    if (teams.length === 0) {
        res.status(404).json({ error: `no team answers ${channel}` });
        return;
    }

    const teamId = teams[0].id;

    const { rows: customers } = await pool.query(
        `INSERT INTO customers (phone, name) VALUES ($1, $2)
         ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone
         RETURNING id`,
        [phone, name],
    );
    const customerId = customers[0].id;

    const { rows: existing } = await pool.query(
        'SELECT id, status FROM conversations WHERE team_id = $1 AND customer_id = $2',
        [teamId, customerId],
    );

    let conversationId: number;

    if (existing.length === 0) {
        const { rows: created } = await pool.query(
            `INSERT INTO conversations (team_id, customer_id, last_customer_message_at, created_at)
             VALUES ($1, $2, $3, $3) RETURNING id`,
            [teamId, customerId, sentAt],
        );
        conversationId = created[0].id;
    } else {
        conversationId = existing[0].id;

        if (existing[0].status === 'closed') {
            await pool.query(
                `UPDATE conversations SET status = 'open', assigned_agent_id = NULL WHERE id = $1`,
                [conversationId],
            );
        }
    }

    await pool.query(
        `INSERT INTO messages (conversation_id, direction, body, provider_message_id, created_at)
         VALUES ($1, 'in', $2, $3, $4)`,
        [conversationId, message, messageId, sentAt],
    );

    await pool.query(
        `UPDATE conversations SET last_customer_message_at = GREATEST(last_customer_message_at, $2)
         WHERE id = $1`,
        [conversationId, sentAt],
    );

    // Agents want the customer's order next to the conversation without having to look it up.
    const orderRef = await latestOrderFor(phone);

    if (orderRef) {
        await pool.query('UPDATE conversations SET order_ref = $1 WHERE id = $2', [orderRef, conversationId]);
    }

    res.json({ ok: true });
});
