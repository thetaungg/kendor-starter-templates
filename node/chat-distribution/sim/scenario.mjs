import { between, chance, pick } from './random.mjs';

// Times are minutes since midnight of the simulated Monday.
export const DAY_START = 7 * 60;
export const OPEN = 9 * 60;
export const CLOSE = 17 * 60 + 30;
export const DATE = '2026-11-09';

export function clockText(minute) {
    const hours = String(Math.floor(minute / 60)).padStart(2, '0');
    const minutes = String(minute % 60).padStart(2, '0');

    return `${hours}:${minutes}`;
}

export function isoTime(minute) {
    return `${DATE}T${clockText(minute)}:00.000Z`;
}

// Who is on the team, and how each of them really works. A chat given to someone notifies
// them at once; a chat in a shared list notifies nobody, so people only glance at that list
// every few minutes (looksAtSharedListEvery). The system under test never sees
// this table: it only sees what these people do through the API.
export const TEAM = [
    {
        id: 'mira',
        looksAtSharedListEvery: 3,
        name: 'Mira',
        replyDelay: [1, 1],
        juggles: 4,
        grabExtra: 2,
        arrives: OPEN,
        breaks: [{ from: 12 * 60, to: 12 * 60 + 45, saysSo: true }],
        noticesAwayAfter: 2,
        speed: 0.8,
    },
    {
        id: 'tom',
        looksAtSharedListEvery: 10,
        name: 'Tom',
        replyDelay: [3, 6],
        juggles: 2,
        grabExtra: 1,
        arrives: OPEN,
        breaks: [{ from: 13 * 60, to: 13 * 60 + 30, saysSo: true }],
        noticesAwayAfter: 10,
        speed: 1.4,
    },
    {
        id: 'aziz',
        looksAtSharedListEvery: 5,
        name: 'Aziz',
        replyDelay: [1, 3],
        juggles: 3,
        grabExtra: 2,
        arrives: OPEN,
        breaks: [{ from: 12 * 60 + 30, to: 13 * 60 + 40, saysSo: false }],
        noticesAwayAfter: 3,
        speed: 1,
    },
    {
        id: 'jonas',
        looksAtSharedListEvery: 2,
        name: 'Jonas',
        replyDelay: [1, 2],
        juggles: 3,
        grabExtra: 3,
        picksEasyOnes: true,
        arrives: OPEN,
        breaks: [{ from: 12 * 60, to: 12 * 60 + 30, saysSo: true }],
        noticesAwayAfter: 3,
        speed: 0.9,
    },
    {
        id: 'lena',
        looksAtSharedListEvery: 6,
        name: 'Lena',
        replyDelay: [2, 3],
        juggles: 3,
        grabExtra: 1,
        arrives: 9 * 60 + 45,
        breaks: [{ from: 13 * 60 + 30, to: 14 * 60, saysSo: true }],
        noticesAwayAfter: 3,
        speed: 1,
    },
    {
        id: 'sam',
        looksAtSharedListEvery: 6,
        name: 'Sam',
        replyDelay: [2, 3],
        juggles: 3,
        grabExtra: 1,
        arrives: OPEN,
        breaks: [{ from: 14 * 60, to: 14 * 60 + 30, saysSo: true }],
        noticesAwayAfter: 3,
        speed: 1,
    },
];

const FIRST_NAMES = [
    'Anna', 'Ben', 'Clara', 'David', 'Elif', 'Farid', 'Greta', 'Hugo', 'Ines', 'Jan', 'Karin',
    'Leo', 'Marta', 'Nils', 'Olga', 'Paul', 'Rosa', 'Sven', 'Tara', 'Umar', 'Vera', 'Wim',
    'Yusuf', 'Zoe', 'Amir', 'Bea', 'Carl', 'Dana', 'Emil', 'Freya',
];

const LAST_NAMES = [
    'Berg', 'Costa', 'Dahl', 'Evers', 'Fischer', 'Gruber', 'Haas', 'Ivanova', 'Jansen', 'Kaya',
    'Lind', 'Moreau', 'Novak', 'Olsen', 'Petit', 'Quinn', 'Rossi', 'Smit', 'Toth', 'Weber',
];

const EASY_QUESTIONS = [
    'Hi, is the Crete week in May still available for two?',
    'Does the Lisbon city break include the airport transfer?',
    'Can I pay the deposit by bank transfer?',
    'What time is check-in at the Hotel Alma in Seville?',
    'Is breakfast included in the Dolomites package?',
    'Do I need a visa for the Morocco tour with a Dutch passport?',
    'How much luggage can I take on the Malta flights?',
    'Is there a kids club at the Antalya resort?',
    'Can you send me the invoice for booking 4471 again?',
    'Are pets allowed in the Tuscany farmhouse?',
];

const HARD_QUESTIONS = [
    'Our flight to Tenerife was cancelled and we are stuck at the airport with two kids. What now?',
    'The hotel in Rhodes gave us a room next to a building site. I want a refund or another hotel.',
    'We want a three-week trip through Japan for our anniversary, can you plan it with us?',
    'My mother broke her leg, we need to move our cruise to next year without losing the money.',
    'Group of 14 for a wedding in Sicily in June: flights, hotel and a boat day. Can you quote?',
    'I was charged twice for the Iceland tour and my bank says it is your problem.',
];

const NUDGES = ['Hello? Anyone there?', 'Still waiting...', 'Hi, can someone help me please?'];

function clientName(seed, ...keys) {
    const first = pick(seed, FIRST_NAMES, 'first', ...keys);
    const last = pick(seed, LAST_NAMES, 'last', ...keys);

    return `${first} ${last}`;
}

// Clients who booked with the agency before. Most of Aziz's clients come back to him.
function buildKnownClients(seed) {
    const clients = [];

    for (let i = 0; i < 90; i += 1) {
        let lastConsultant = pick(seed, TEAM, 'known-agent', i).id;

        if (chance(seed, 'known-aziz', i) < 0.25) {
            lastConsultant = 'aziz';
        }

        clients.push({
            id: `client-${1000 + i}`,
            name: clientName(seed, 'known', i),
            lastAgentId: lastConsultant,
            lastBooking: pick(seed, ['Crete, May', 'Lisbon, March', 'Japan, October', 'Alps, February'], 'trip', i),
        });
    }

    return clients;
}

// How many new chats start in each part of the day.
const ARRIVALS = [
    { from: DAY_START, to: OPEN, count: 24 },
    { from: OPEN, to: 10 * 60, count: 32 },
    { from: 10 * 60, to: 12 * 60, count: 56 },
    { from: 12 * 60, to: 14 * 60, count: 64 },
    { from: 14 * 60, to: 17 * 60, count: 66 },
    { from: 17 * 60, to: 17 * 60 + 15, count: 5 },
];

export function buildDay(seed) {
    const knownClients = buildKnownClients(seed);
    const visits = [];
    let number = 0;

    for (const part of ARRIVALS) {
        const length = part.to - part.from;

        for (let i = 0; i < part.count; i += 1) {
            number += 1;

            const at = part.from + Math.floor(chance(seed, 'arrive', number) * length);
            const hard = chance(seed, 'hard', number) < 0.3;

            let client = null;
            let ownConsultantId = null;

            if (chance(seed, 'returning', number) < 0.25) {
                const known = pick(seed, knownClients, 'which-known', number);
                client = { id: known.id, name: known.name };
                ownConsultantId = known.lastAgentId;
            } else {
                client = { id: `client-new-${number}`, name: clientName(seed, 'new', number) };
            }

            let text = pick(seed, EASY_QUESTIONS, 'easy-text', number);

            if (hard) {
                text = pick(seed, HARD_QUESTIONS, 'hard-text', number);
            }

            let nudgeAfter = null;

            if (chance(seed, 'nudge', number) < 0.35) {
                nudgeAfter = between(seed, 3, 6, 'nudge-after', number);
            }

            let comesBackAfter = null;

            if (chance(seed, 'comes-back', number) < 0.15) {
                comesBackAfter = between(seed, 30, 150, 'back-after', number);
            }

            let workMinutes = between(seed, 6, 10, 'work', number);

            if (hard) {
                workMinutes = between(seed, 20, 35, 'work', number);
            }

            visits.push({
                key: `v${number}`,
                at,
                client,
                ownConsultantId,
                hard,
                text,
                nudgeAfter,
                nudgeText: pick(seed, NUDGES, 'nudge-text', number),
                comesBackAfter,
                workMinutes,
            });
        }
    }

    visits.sort((a, b) => a.at - b.at);

    return { knownClients, visits };
}

export function comeBackVisit(seed, earlier, at, consultantId) {
    const key = `${earlier.key}-back`;
    const hard = chance(seed, 'hard', key) < 0.2;
    let text = 'Hi again! One more question about the trip we talked about this morning.';

    if (hard) {
        text = 'Hi again, something went wrong with what we booked earlier, can you look at it?';
    }

    return {
        key,
        at,
        client: earlier.client,
        ownConsultantId: consultantId,
        sameDay: true,
        hard,
        text,
        nudgeAfter: null,
        nudgeText: '',
        comesBackAfter: null,
        workMinutes: between(seed, 5, hard ? 20 : 9, 'work', key),
    };
}

export function isAtDesk(person, minute) {
    if (minute < person.arrives || minute >= CLOSE) {
        return false;
    }

    for (const pause of person.breaks) {
        if (minute >= pause.from && minute < pause.to) {
            return false;
        }
    }

    return true;
}
