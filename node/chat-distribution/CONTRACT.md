# The contract

`npm run day` talks to your system over plain HTTP with JSON bodies, on
**`http://127.0.0.1:3000`**. Build it in any language; keep these endpoints and this port, and
the simulator will replay a Monday against it. `npm run check` checks that you speak the contract
(not whether your rules are good).

This file is read-only. Everything not listed here (your pages, extra endpoints for them, a
database, how you store things) is up to you.

## Time is simulated: never use the computer's clock

The simulator replays a whole working day (07:00 to 17:30) in about a minute. So:

- **Every request carries the simulated time** in the header `X-Sim-Time`, as an ISO 8601 UTC
  string, e.g. `X-Sim-Time: 2026-11-09T09:14:00.000Z`. The simulated day is in this clock: the
  agency opens at `09:00` and closes at `17:30` "UTC".
- **`POST /sim/tick` arrives once every simulated minute.** If your system does something because
  time passed (a timer runs out, someone has waited too long), do it when a tick arrives.
- **Your system must use the simulated time for everything:** when a chat started, how long a
  client has waited, timers, reports. `Date.now()`, `time.time()`, `System.currentTimeMillis()`
  and friends will be off by hours, and a "5 minute" timer on the real clock never runs out
  during a one-minute day.
- Requests without the header (your own web pages) should use the last simulated time you saw.

Run `npm run day -- --fast` to replay the day as fast as your system answers. It must behave the
same as at normal speed.

## The simulator's people

Six consultants (agents) work through your API, each in their own way. Each minute the simulator
reads **every** agent's inbox, whether that person is at their desk or not, so a read is not a sign
that someone is there. People reply to and close what's theirs, take chats if your system lets
them choose, and switch themselves Away and Available. Clients write, sometimes write again
("hello?") before anyone answers, and sometimes come back later the same day.

A client's "first answer" is the first reply your system accepts from an agent. The simulator
measures everything itself, from what happens over this API.

## Endpoints

All request bodies are JSON. Answer with JSON and a 2xx status for success. Send a 4xx when you
refuse something on purpose (say, a reply to a chat that isn't that agent's); the simulator
counts any 5xx or failed connection as an error in the report.

### `POST /sim/reset`

Start a fresh day: forget all chats and state from before. Sent once, at 07:00.

```json
{
  "now": "2026-11-09T07:00:00.000Z",
  "openingHours": { "open": "09:00", "close": "17:30" },
  "agents": [
    { "id": "mira", "name": "Mira", "status": "available" },
    { "id": "tom", "name": "Tom", "status": "available" }
  ],
  "clients": [
    { "id": "client-1004", "name": "Karin Johansson", "lastAgentId": "aziz", "lastBooking": "Japan, October" }
  ]
}
```

- `agents`: the team, with the status each person left on yesterday.
- `clients`: clients who travelled with the agency before, and the consultant they booked with.

### `POST /sim/tick`

```json
{ "now": "2026-11-09T09:15:00.000Z" }
```

Once per simulated minute, before anything else happens in that minute.

### `POST /chats/incoming`

A client wrote a message.

```json
{ "clientId": "client-1004", "clientName": "Karin Johansson", "text": "Hi, is the Crete week in May still available?" }
```

Answer with the chat it belongs to:

```json
{ "chatId": "chat-17" }
```

If that client already has an open chat, the message belongs to it (return the same `chatId`).
If their earlier chat was closed, it's up to you whether this opens a new chat or reopens the old
one, as long as the chat is open again.

### `GET /agents/:agentId/inbox`

What this agent sees right now, and their status. `404` for an unknown agent.

```json
{
  "status": "available",
  "chats": [
    {
      "id": "chat-17",
      "clientId": "client-1004",
      "clientName": "Karin Johansson",
      "assignedTo": "aziz",
      "messages": [
        { "from": "client", "text": "Hi, is the Crete week in May still available?", "at": "2026-11-09T09:14:00.000Z" }
      ]
    }
  ]
}
```

- `status`: `"available"` or `"away"`. If your system switches someone to Away, show it here:
  people notice and switch back when they're ready.
- `chats`: open chats this agent may answer or take now. `assignedTo` is the agent's id when the
  chat is theirs, or `null` when it's open for anyone to take. Chats assigned to someone else are
  ignored. You may add fields.

### `POST /chats/:chatId/take`

```json
{ "agentId": "jonas" }
```

The agent takes an unassigned chat from their inbox. Return 2xx if it's now theirs, `409` if not.
Systems that never let people choose can always answer `409`.

### `POST /chats/:chatId/reply`

```json
{ "agentId": "aziz", "text": "Hi Karin, this is Aziz! Let me check that for you." }
```

2xx means the reply was sent to the client. Refuse with a 4xx (e.g. `409`) when the chat isn't
this agent's to answer.

### `POST /chats/:chatId/close`

```json
{ "agentId": "aziz" }
```

The conversation is over. A closed chat leaves the agent's inbox.

### `PUT /agents/:agentId/status`

```json
{ "status": "away" }
```

The agent switches themselves `"away"` or `"available"`.

## Example: one minute of the day

```
POST /sim/tick                       X-Sim-Time: 2026-11-09T09:14:00.000Z   {"now": "..."}
POST /chats/incoming                 X-Sim-Time: 2026-11-09T09:14:00.000Z   {"clientId": "client-1004", ...}
                                     → {"chatId": "chat-17"}
GET  /agents/mira/inbox              X-Sim-Time: 2026-11-09T09:14:00.000Z
GET  /agents/tom/inbox               ... (all six)
POST /chats/chat-17/reply            X-Sim-Time: 2026-11-09T09:14:00.000Z   {"agentId": "aziz", "text": "..."}
POST /chats/chat-9/close             X-Sim-Time: 2026-11-09T09:14:00.000Z   {"agentId": "sam"}
```

## Running it

The simulator needs only Node (no packages), so these work whatever your system is built with;
each `npm run day …` is the same as `node sim/day.mjs …` (and `npm run check` as `node sim/check.mjs`).

```bash
npm run dev                          # the starter system, on port 3000
npm run day                          # replay Monday (seed 42), about a minute
npm run day -- --seed 7              # a different Monday
npm run day -- --details             # also list every client who waited over 5 minutes
npm run day -- --fast                # as fast as your system answers
npm run day -- --url http://127.0.0.1:3000 --json day.json   # also save the numbers
npm run check                        # contract check (it resets your system)
```

Compare your before and after on the same seed. Reviewers also run other seeds, so don't tune your
rules to one day.
