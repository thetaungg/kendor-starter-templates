// npm run day: replays a working Monday at Bluefin Travel against your system and prints how
// the clients and the team fared. Read CONTRACT.md for what your system must answer.
//
//   npm run day                     seed 42, about a minute
//   npm run day -- --seed 7         a different Monday
//   npm run day -- --fast           as fast as your system answers
//   npm run day -- --details        also list every client who waited over 5 min
//   npm run day -- --url http://127.0.0.1:3000 --json day.json

import { writeFileSync } from 'node:fs';

import { createClient } from './http.mjs';
import { between } from './random.mjs';
import { printReport, scorecardOf } from './report.mjs';
import {
    buildDay,
    clockText,
    CLOSE,
    comeBackVisit,
    DAY_START,
    isAtDesk,
    isoTime,
    OPEN,
    TEAM,
} from './scenario.mjs';

function readOptions() {
    const options = { seed: 42, url: 'http://127.0.0.1:3000', paceMs: 80, json: null, quiet: false, details: false, scorecard: false };
    const args = process.argv.slice(2);

    for (let i = 0; i < args.length; i += 1) {
        const arg = args[i];

        if (arg === '--seed') {
            options.seed = Number(args[i + 1]);
            i += 1;
        } else if (arg === '--url') {
            options.url = args[i + 1].replace(/\/$/, '');
            i += 1;
        } else if (arg === '--json') {
            options.json = args[i + 1];
            i += 1;
        } else if (arg === '--fast') {
            options.paceMs = 0;
        } else if (arg === '--details') {
            options.details = true;
        } else if (arg === '--scorecard') {
            options.scorecard = true;
        } else if (arg === '--quiet') {
            options.quiet = true;
        }
    }

    return options;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const options = readOptions();
    const seed = options.seed;
    const api = createClient(options.url);
    const day = buildDay(seed);

    const conversations = [];
    const conversationByChat = new Map();
    const waitingVisits = [...day.visits];
    const people = new Map();
    let splitChats = 0;

    for (const person of TEAM) {
        people.set(person.id, { person, memory: new Map(), awaySeenAt: null, firstReplies: 0 });
    }

    const reset = await api.call('POST', '/sim/reset', isoTime(DAY_START), {
        now: isoTime(DAY_START),
        openingHours: { open: clockText(OPEN), close: clockText(CLOSE) },
        agents: TEAM.map((person) => ({ id: person.id, name: person.name, status: 'available' })),
        clients: day.knownClients,
    });

    if (!reset.ok) {
        console.error(`\nCould not reset your system at ${options.url} (status ${reset.status}).`);
        console.error('Is it running? Start it with `npm run dev`, or point --url at it.\n');
        process.exit(1);
    }

    if (!options.quiet) {
        process.stdout.write(`Replaying Monday at Bluefin Travel against ${options.url} (seed ${seed})\n`);
    }

    for (let minute = DAY_START; minute <= CLOSE; minute += 1) {
        const startedAt = Date.now();
        const now = isoTime(minute);

        await api.call('POST', '/sim/tick', now, { now });

        if (minute === CLOSE) {
            for (const state of people.values()) {
                await api.call('PUT', `/agents/${state.person.id}/status`, now, { status: 'away' });
            }

            break;
        }

        await deliverClientMessages(minute);

        const views = await readAllInboxes(minute);

        noteWhoHoldsWhat(minute, views);

        // Take turns at who acts first, so nobody always wins the race to a free chat.
        for (let i = 0; i < TEAM.length; i += 1) {
            const person = TEAM[(minute + i) % TEAM.length];
            await actAsPerson(people.get(person.id), views.get(person.id), minute);
        }

        if (!options.quiet && process.stdout.isTTY && minute % 30 === 0) {
            process.stdout.write(`  ${clockText(minute)}\r`);
        }

        const spent = Date.now() - startedAt;

        if (options.paceMs > spent) {
            await sleep(options.paceMs - spent);
        }
    }

    const report = printReport({
        seed,
        details: options.details,
        conversations,
        team: TEAM,
        people,
        splitChats,
        http: api.stats(),
    });

    if (options.json) {
        writeFileSync(options.json, JSON.stringify(report, null, 2));
    }

    // One JSON line read by Kendor's own run for the reviewers.
    if (options.scorecard) {
        console.log(`KENDOR-SCORECARD ${JSON.stringify(scorecardOf(report))}`);
    }

    async function deliverClientMessages(minute) {
        while (waitingVisits.length > 0 && waitingVisits[0].at <= minute) {
            const visit = waitingVisits.shift();
            await startConversation(visit, minute);
        }

        for (const conversation of conversations) {
            const visit = conversation.visit;

            if (visit.nudgeAfter === null || conversation.nudged || conversation.firstReplyAt !== null) {
                continue;
            }

            if (minute < conversation.startedAt + visit.nudgeAfter) {
                continue;
            }

            conversation.nudged = true;

            const answer = await api.call('POST', '/chats/incoming', isoTime(minute), {
                clientId: visit.client.id,
                clientName: visit.client.name,
                text: visit.nudgeText,
            });

            const chatId = answer.data?.chatId;

            if (answer.ok && chatId !== undefined && String(chatId) !== conversation.chatId) {
                splitChats += 1;
            }
        }
    }

    async function startConversation(visit, minute) {
        const answer = await api.call('POST', '/chats/incoming', isoTime(minute), {
            clientId: visit.client.id,
            clientName: visit.client.name,
            text: visit.text,
        });

        if (!answer.ok || answer.data?.chatId === undefined) {
            api.remember(`POST /chats/incoming gave ${answer.status} without a chatId`);

            return;
        }

        const chatId = String(answer.data.chatId);
        const earlier = conversationByChat.get(chatId);

        // The client still had an open chat: their message joins it, as it should.
        if (earlier && earlier.closedAt === null) {
            return;
        }

        const conversation = {
            visit,
            chatId,
            startedAt: minute,
            nudged: false,
            firstReplyAt: null,
            firstReplyBy: null,
            holders: [],
            absentMinutes: 0,
            answeredTwice: false,
            closedAt: null,
        };

        conversations.push(conversation);
        conversationByChat.set(chatId, conversation);
    }

    async function readAllInboxes(minute) {
        const views = new Map();

        for (const person of TEAM) {
            const answer = await api.call('GET', `/agents/${person.id}/inbox`, isoTime(minute));
            let chats = [];
            let status = 'available';

            if (answer.ok && answer.data) {
                if (Array.isArray(answer.data.chats)) {
                    chats = answer.data.chats;
                }

                if (typeof answer.data.status === 'string') {
                    status = answer.data.status;
                }
            }

            views.set(person.id, { status, chats });
        }

        return views;
    }

    function noteWhoHoldsWhat(minute, views) {
        const holderOf = new Map();

        for (const [personId, view] of views) {
            for (const chat of view.chats) {
                if (chat.assignedTo === personId) {
                    holderOf.set(String(chat.id), personId);
                }
            }
        }

        for (const conversation of conversations) {
            if (conversation.firstReplyAt !== null || conversation.closedAt !== null) {
                continue;
            }

            const holder = holderOf.get(conversation.chatId);

            if (holder === undefined) {
                continue;
            }

            const last = conversation.holders[conversation.holders.length - 1];

            if (last !== holder) {
                conversation.holders.push(holder);
            }

            const person = people.get(holder).person;

            if (minute >= OPEN && !isAtDesk(person, minute)) {
                conversation.absentMinutes += 1;
            }
        }
    }

    async function actAsPerson(state, view, minute) {
        const person = state.person;
        const now = isoTime(minute);

        for (const pause of person.breaks) {
            if (pause.saysSo && minute === pause.from) {
                await api.call('PUT', `/agents/${person.id}/status`, now, { status: 'away' });
            }

            if (pause.saysSo && minute === pause.to) {
                await api.call('PUT', `/agents/${person.id}/status`, now, { status: 'available' });
                state.awaySeenAt = null;

                return;
            }
        }

        if (!isAtDesk(person, minute)) {
            return;
        }

        // Someone the system switched to Away notices after a while and switches back.
        if (view.status !== 'available') {
            if (state.awaySeenAt === null) {
                state.awaySeenAt = minute;
            }

            if (minute - state.awaySeenAt >= person.noticesAwayAfter) {
                await api.call('PUT', `/agents/${person.id}/status`, now, { status: 'available' });
                state.awaySeenAt = null;
            }
        } else {
            state.awaySeenAt = null;
        }

        const mine = [];
        const free = [];

        for (const chat of view.chats) {
            const chatId = String(chat.id);

            if (chat.assignedTo === person.id) {
                mine.push(chatId);
            } else if (chat.assignedTo === null || chat.assignedTo === undefined) {
                free.push(chatId);
            }
        }

        forgetChatsTakenAway(state, mine);

        for (const chatId of mine) {
            if (!state.memory.has(chatId)) {
                state.memory.set(chatId, newMemory(person, chatId, minute));
            }
        }

        await closeFinishedChats(state, minute);
        await answerChats(state, minute);
        await grabChats(state, free, mine.length, minute);
    }

    function newMemory(person, chatId, minute) {
        const [low, high] = person.replyDelay;

        return {
            seenAt: minute,
            delay: between(seed, low, high, 'delay', person.id, chatId),
            answered: false,
            doneAt: null,
        };
    }

    function forgetChatsTakenAway(state, mine) {
        const stillMine = new Set(mine);

        for (const chatId of [...state.memory.keys()]) {
            if (!stillMine.has(chatId)) {
                state.memory.delete(chatId);
            }
        }
    }

    function hardness(chatId) {
        const conversation = conversationByChat.get(chatId);

        if (!conversation) {
            return { hard: false, workMinutes: 8, waitingSince: 0 };
        }

        return {
            hard: conversation.visit.hard,
            workMinutes: conversation.visit.workMinutes,
            waitingSince: conversation.startedAt,
        };
    }

    async function closeFinishedChats(state, minute) {
        for (const [chatId, memory] of [...state.memory]) {
            if (!memory.answered || minute < memory.doneAt) {
                continue;
            }

            await api.call('POST', `/chats/${chatId}/close`, isoTime(minute), { agentId: state.person.id });
            state.memory.delete(chatId);

            const conversation = conversationByChat.get(chatId);

            if (conversation && conversation.closedAt === null) {
                conversation.closedAt = minute;
                scheduleComeBack(conversation, minute);
            }
        }
    }

    function scheduleComeBack(conversation, minute) {
        const visit = conversation.visit;

        if (visit.comesBackAfter === null || conversation.firstReplyBy === null) {
            return;
        }

        const at = minute + visit.comesBackAfter;

        if (at >= CLOSE - 15) {
            return;
        }

        const ownConsultant = visit.ownConsultantId ?? conversation.firstReplyBy;
        const next = comeBackVisit(seed, visit, at, ownConsultant);
        let index = 0;

        while (index < waitingVisits.length && waitingVisits[index].at <= at) {
            index += 1;
        }

        waitingVisits.splice(index, 0, next);
    }

    async function answerChats(state, minute) {
        const person = state.person;
        let busy = 0;
        const waiting = [];

        for (const [chatId, memory] of state.memory) {
            if (memory.answered) {
                busy += 1;
            } else {
                waiting.push({ chatId, memory, ...hardness(chatId) });
            }
        }

        waiting.sort((a, b) => {
            if (person.picksEasyOnes && a.hard !== b.hard) {
                return a.hard ? 1 : -1;
            }

            return a.memory.seenAt - b.memory.seenAt;
        });

        for (const item of waiting) {
            if (busy >= person.juggles) {
                break;
            }

            if (minute - item.memory.seenAt < item.memory.delay) {
                continue;
            }

            const answer = await api.call('POST', `/chats/${item.chatId}/reply`, isoTime(minute), {
                agentId: person.id,
                text: `Hi, this is ${person.name} from Bluefin Travel. Let me help you with that.`,
            });

            if (!answer.ok) {
                continue;
            }

            busy += 1;
            item.memory.answered = true;
            item.memory.doneAt = minute + Math.ceil(item.workMinutes * person.speed);

            const conversation = conversationByChat.get(item.chatId);

            if (!conversation) {
                continue;
            }

            if (conversation.firstReplyAt === null) {
                conversation.firstReplyAt = minute;
                conversation.firstReplyBy = person.id;
                state.firstReplies += 1;
            } else if (conversation.firstReplyBy !== person.id) {
                conversation.answeredTwice = true;
            }
        }
    }

    // Only when the system lets people choose: now and then they look at the shared list, take
    // the easy questions first, and a little more than they can handle.
    async function grabChats(state, free, alreadyMine, minute) {
        if (free.length === 0) {
            return;
        }

        const person = state.person;
        const offset = TEAM.indexOf(person);

        if ((minute + offset) % person.looksAtSharedListEvery !== 0) {
            return;
        }

        const limit = person.juggles + person.grabExtra;
        let holding = alreadyMine;
        const choices = [];

        for (const chatId of free) {
            const info = hardness(chatId);
            const conversation = conversationByChat.get(chatId);

            if (conversation && conversation.closedAt !== null) {
                continue;
            }

            if (person.picksEasyOnes && info.hard && minute - info.waitingSince < 40) {
                continue;
            }

            choices.push({ chatId, ...info });
        }

        choices.sort((a, b) => {
            if (a.hard !== b.hard) {
                return a.hard ? 1 : -1;
            }

            return a.waitingSince - b.waitingSince;
        });

        for (const choice of choices) {
            if (holding >= limit) {
                break;
            }

            const answer = await api.call('POST', `/chats/${choice.chatId}/take`, isoTime(minute), {
                agentId: person.id,
            });

            if (answer.ok) {
                holding += 1;
                state.memory.set(choice.chatId, newMemory(person, choice.chatId, minute));
            }
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
