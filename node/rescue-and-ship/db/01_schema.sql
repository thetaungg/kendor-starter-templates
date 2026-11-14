-- Spoonrun help desk.

CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    -- The messaging provider's channel this team answers ('customers', 'restaurants').
    channel TEXT NOT NULL UNIQUE
);

CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE memberships (
    agent_id INTEGER NOT NULL REFERENCES agents (id),
    team_id INTEGER NOT NULL REFERENCES teams (id),
    PRIMARY KEY (agent_id, team_id)
);

CREATE TABLE sessions (
    token TEXT PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents (id),
    current_team_id INTEGER REFERENCES teams (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    phone TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams (id),
    customer_id INTEGER NOT NULL REFERENCES customers (id),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    assigned_agent_id INTEGER REFERENCES agents (id),
    order_ref TEXT,
    last_customer_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (team_id, customer_id)
);

-- direction: 'in' from the customer, 'out' an agent's reply, 'note' a line only agents see.
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('in', 'out', 'note')),
    agent_id INTEGER REFERENCES agents (id),
    body TEXT NOT NULL,
    provider_message_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX messages_conversation_idx ON messages (conversation_id, created_at);

-- How far each agent has read a conversation: the time of the last customer message they saw.
CREATE TABLE reads (
    agent_id INTEGER NOT NULL REFERENCES agents (id),
    conversation_id INTEGER NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (agent_id, conversation_id)
);
