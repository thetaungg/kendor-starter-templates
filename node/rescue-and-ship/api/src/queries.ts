import { pool } from './db.js';

export interface ConversationSummary {
    id: number;
    customerName: string;
    preview: string;
    orderRef: string | null;
    lastCustomerMessageAt: string;
}

const SUMMARY_COLUMNS = `
    c.id,
    customers.name AS "customerName",
    c.order_ref AS "orderRef",
    c.last_customer_message_at AS "lastCustomerMessageAt",
    (SELECT m.body FROM messages m
     WHERE m.conversation_id = c.id AND m.direction = 'in'
     ORDER BY m.created_at DESC LIMIT 1) AS preview`;

/** Customers in a team nobody has taken yet, the ones to answer first on top. */
export async function listWaiting(teamId: number): Promise<ConversationSummary[]> {
    const { rows } = await pool.query(
        `SELECT ${SUMMARY_COLUMNS}
         FROM conversations c JOIN customers ON customers.id = c.customer_id
         WHERE c.team_id = $1 AND c.status = 'open' AND c.assigned_agent_id IS NULL
         ORDER BY c.last_customer_message_at DESC`,
        [teamId],
    );

    return rows;
}

export async function listMine(agentId: number, teamId: number): Promise<ConversationSummary[]> {
    const { rows } = await pool.query(
        `SELECT ${SUMMARY_COLUMNS}
         FROM conversations c JOIN customers ON customers.id = c.customer_id
         WHERE c.team_id = $1 AND c.status = 'open' AND c.assigned_agent_id = $2
         ORDER BY c.last_customer_message_at DESC`,
        [teamId, agentId],
    );

    return rows;
}

export async function listDone(teamId: number): Promise<ConversationSummary[]> {
    const { rows } = await pool.query(
        `SELECT ${SUMMARY_COLUMNS}
         FROM conversations c JOIN customers ON customers.id = c.customer_id
         WHERE c.team_id = $1 AND c.status = 'closed'
         ORDER BY c.last_customer_message_at DESC`,
        [teamId],
    );

    return rows;
}

/** The red number next to "Mine": conversations with customer messages the agent hasn't read. */
export async function countUnread(agentId: number): Promise<number> {
    const { rows } = await pool.query(
        `SELECT COUNT(*)::int AS unread
         FROM conversations c
         JOIN memberships ON memberships.team_id = c.team_id AND memberships.agent_id = $1
         LEFT JOIN reads ON reads.conversation_id = c.id AND reads.agent_id = $1
         WHERE c.status = 'open'
           AND c.last_customer_message_at > COALESCE(reads.read_at, '-infinity'::timestamptz)`,
        [agentId],
    );

    return rows[0].unread;
}

/** The conversation, if it belongs to one of the agent's teams. */
export async function findConversation(agentId: number, conversationId: number) {
    const { rows } = await pool.query(
        `SELECT c.id, c.team_id AS "teamId", c.customer_id AS "customerId", c.status,
                c.assigned_agent_id AS "assignedAgentId", c.order_ref AS "orderRef"
         FROM conversations c
         JOIN memberships ON memberships.team_id = c.team_id AND memberships.agent_id = $1
         WHERE c.id = $2`,
        [agentId, conversationId],
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
}

export interface Message {
    id: number;
    direction: 'in' | 'out' | 'note';
    agentName: string | null;
    body: string;
    createdAt: string;
}

export interface ConversationDetail {
    id: number;
    teamId: number;
    status: 'open' | 'closed';
    assignedAgent: { id: number; name: string } | null;
    orderRef: string | null;
    customer: { id: number; name: string; phone: string };
    messages: Message[];
    unread: boolean;
}

export async function conversationDetail(agentId: number, conversationId: number): Promise<ConversationDetail | null> {
    const conversation = await findConversation(agentId, conversationId);

    if (!conversation) {
        return null;
    }

    let assignedAgent = null;

    if (conversation.assignedAgentId) {
        const { rows } = await pool.query('SELECT id, name FROM agents WHERE id = $1', [
            conversation.assignedAgentId,
        ]);
        assignedAgent = rows[0];
    }

    const { rows: customers } = await pool.query('SELECT id, name, phone FROM customers WHERE id = $1', [
        conversation.customerId,
    ]);

    const { rows: messages } = await pool.query(
        `SELECT m.id, m.direction, agents.name AS "agentName", m.body, m.created_at AS "createdAt"
         FROM messages m LEFT JOIN agents ON agents.id = m.agent_id
         WHERE m.conversation_id = $1
         ORDER BY m.created_at, m.id`,
        [conversationId],
    );

    const { rows: unread } = await pool.query(
        `SELECT EXISTS (
             SELECT 1 FROM conversations c
             LEFT JOIN reads ON reads.conversation_id = c.id AND reads.agent_id = $1
             WHERE c.id = $2 AND c.assigned_agent_id = $1
               AND c.last_customer_message_at > COALESCE(reads.read_at, '-infinity'::timestamptz)
         ) AS unread`,
        [agentId, conversationId],
    );

    return {
        id: conversation.id,
        teamId: conversation.teamId,
        status: conversation.status,
        assignedAgent,
        orderRef: conversation.orderRef,
        customer: customers[0],
        messages,
        unread: unread[0].unread,
    };
}
