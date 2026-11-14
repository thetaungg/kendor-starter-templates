import { clockText, CLOSE, DATE, isAtDesk, OPEN } from './scenario.mjs';

function median(values) {
    if (values.length === 0) {
        return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 1) {
        return sorted[middle];
    }

    return (sorted[middle - 1] + sorted[middle]) / 2;
}

function largest(values) {
    let result = null;

    for (const value of values) {
        if (result === null || value > result) {
            result = value;
        }
    }

    return result;
}

function minutesText(value) {
    if (value === null) {
        return '-';
    }

    if (value < 60) {
        return `${Math.round(value * 10) / 10} min`;
    }

    const hours = Math.floor(value / 60);
    const minutes = Math.round(value % 60);

    return `${hours} h ${minutes} min`;
}

function percent(part, whole) {
    if (whole === 0) {
        return '-';
    }

    return `${Math.round((part / whole) * 100)}%`;
}

function minutesAtDesk(person) {
    let total = 0;

    for (let minute = OPEN; minute < CLOSE; minute += 1) {
        if (isAtDesk(person, minute)) {
            total += 1;
        }
    }

    return total;
}

// Clients who wrote before opening time are counted from 09:00: nobody expects an answer at 07:30.
function waitOf(conversation) {
    const from = Math.max(conversation.startedAt, OPEN);

    return conversation.firstReplyAt - from;
}

export function printReport({ seed, details, conversations, team, splitChats, http }) {
    const waits = [];
    const hardWaits = [];
    let neverAnswered = 0;
    let waitedOverFive = 0;
    let movedThreeTimes = 0;
    let mostMoves = 0;
    let stuckWithAbsent = 0;
    let longestWithAbsent = 0;
    let answeredTwice = 0;
    let returning = 0;
    let returningGotOwn = 0;
    let ownAtWork = 0;
    let ownAtWorkGotOwn = 0;

    const perPerson = new Map();

    for (const person of team) {
        perPerson.set(person.id, { answered: 0, hard: 0, waits: [], missed: 0 });
    }

    for (const conversation of conversations) {
        const visit = conversation.visit;
        const moves = Math.max(0, conversation.holders.length - 1);

        if (conversation.firstReplyAt === null) {
            neverAnswered += 1;
            waitedOverFive += 1;
        } else {
            const wait = waitOf(conversation);
            waits.push(wait);

            if (visit.hard) {
                hardWaits.push(wait);
            }

            if (wait > 5) {
                waitedOverFive += 1;
            }

            const stats = perPerson.get(conversation.firstReplyBy);

            if (stats) {
                stats.answered += 1;
                stats.waits.push(wait);

                if (visit.hard) {
                    stats.hard += 1;
                }
            }
        }

        // Every holder but the last one let the chat go without answering it.
        for (let i = 0; i < conversation.holders.length - 1; i += 1) {
            const stats = perPerson.get(conversation.holders[i]);

            if (stats) {
                stats.missed += 1;
            }
        }

        if (moves >= 3) {
            movedThreeTimes += 1;
        }

        if (moves > mostMoves) {
            mostMoves = moves;
        }

        if (conversation.absentMinutes > 5) {
            stuckWithAbsent += 1;
        }

        if (conversation.absentMinutes > longestWithAbsent) {
            longestWithAbsent = conversation.absentMinutes;
        }

        if (conversation.answeredTwice) {
            answeredTwice += 1;
        }

        if (visit.ownConsultantId) {
            returning += 1;

            const own = team.find((person) => person.id === visit.ownConsultantId);
            const gotOwn = conversation.firstReplyBy === visit.ownConsultantId;
            const ownWasThere = own && isAtDesk(own, Math.max(conversation.startedAt, OPEN));

            if (gotOwn) {
                returningGotOwn += 1;
            }

            if (ownWasThere) {
                ownAtWork += 1;

                if (gotOwn) {
                    ownAtWorkGotOwn += 1;
                }
            }
        }
    }

    let hardCount = 0;

    for (const conversation of conversations) {
        if (conversation.visit.hard) {
            hardCount += 1;
        }
    }

    const hardUnanswered = hardCount - hardWaits.length;

    const teamRows = [];
    let busiest = null;
    let quietest = null;

    for (const person of team) {
        const stats = perPerson.get(person.id);
        const hours = minutesAtDesk(person) / 60;
        const perHour = stats.answered / hours;

        teamRows.push({
            name: person.name,
            answered: stats.answered,
            hard: stats.hard,
            perHour: Math.round(perHour * 10) / 10,
            medianWait: median(stats.waits),
            missed: stats.missed,
        });

        if (busiest === null || perHour > busiest) {
            busiest = perHour;
        }

        if (quietest === null || perHour < quietest) {
            quietest = perHour;
        }
    }

    let unevenness = null;

    if (quietest !== null && quietest > 0) {
        unevenness = Math.round((busiest / quietest) * 10) / 10;
    }

    const result = {
        seed,
        chats: conversations.length,
        firstReplyMedian: median(waits),
        firstReplyWorst: largest(waits),
        waitedOverFive,
        neverAnswered,
        hardChats: hardCount,
        hardMedian: median(hardWaits),
        hardWorst: largest(hardWaits),
        hardUnanswered,
        returning,
        returningGotOwn,
        ownAtWork,
        ownAtWorkGotOwn,
        stuckWithAbsent,
        longestWithAbsent,
        movedThreeTimes,
        mostMoves,
        answeredTwice,
        splitChats,
        unevenness,
        team: teamRows,
        serverErrors: http.serverErrors,
        requests: http.requests,
    };

    const lines = [];
    const line = (text = '') => lines.push(text);

    line('');
    line(`BLUEFIN TRAVEL · Monday ${DATE} · ${conversations.length} chats · seed ${seed}`);
    line('');
    line('Clients');
    line(`  First reply, typical (median)       ${minutesText(result.firstReplyMedian)}`);
    line(`  First reply, worst                  ${minutesText(result.firstReplyWorst)}`);
    line(`  Waited more than 5 min              ${waitedOverFive} (${percent(waitedOverFive, conversations.length)})`);
    line(`  Never got an answer                 ${neverAnswered}`);
    line(`  Hard chats (${hardCount}), typical / worst     ${minutesText(result.hardMedian)} / ${minutesText(result.hardWorst)}${hardUnanswered > 0 ? `, ${hardUnanswered} never answered` : ''}`);
    line(`  Returning clients who got their own consultant`);
    line(`    all of them                       ${returningGotOwn} of ${returning} (${percent(returningGotOwn, returning)})`);
    line(`    when that consultant was at work  ${ownAtWorkGotOwn} of ${ownAtWork} (${percent(ownAtWorkGotOwn, ownAtWork)})`);
    line(`  Left with someone who wasn't there  ${stuckWithAbsent} over 5 min, longest ${minutesText(longestWithAbsent)}`);
    line(`  Passed around 3 times or more       ${movedThreeTimes} (most: ${mostMoves})`);

    if (answeredTwice > 0 || splitChats > 0) {
        line(`  Answered by two people at once      ${answeredTwice}`);
        line(`  Follow-ups that opened a new chat   ${splitChats}`);
    }

    line('');
    line('Team                 first replies   hard ones   per hour at desk   typical wait   let go unanswered');

    for (const row of teamRows) {
        const name = row.name.padEnd(20);
        const answered = String(row.answered).padStart(13);
        const hard = String(row.hard).padStart(12);
        const perHour = String(row.perHour).padStart(18);
        const wait = minutesText(row.medianWait).padStart(14);
        const missed = String(row.missed).padStart(19);
        line(`  ${name}${answered}${hard}${perHour}${wait}${missed}`);
    }

    line(`  Busiest vs quietest (per hour at desk): ${unevenness === null ? 'someone answered nothing' : `${unevenness}x`}`);
    line('');

    if (http.serverErrors > 0) {
        line(`Your system failed ${http.serverErrors} of ${http.requests} requests. First problems:`);

        for (const problem of http.problems) {
            line(`  ${problem}`);
        }

        line('');
    }

    if (details) {
        line('Clients who waited over 5 min');
        line('  wrote   answered  client                 kind  own      held by (in order)');

        for (const conversation of conversations) {
            const answered = conversation.firstReplyAt !== null;

            if (answered && waitOf(conversation) <= 5) {
                continue;
            }

            const visit = conversation.visit;
            let answeredText = 'never';

            if (answered) {
                answeredText = clockText(conversation.firstReplyAt);
            }

            const kind = visit.hard ? 'hard' : 'easy';
            const own = visit.ownConsultantId ?? '-';
            const holders = conversation.holders.join(' > ') || 'nobody';

            line(
                `  ${clockText(conversation.startedAt)}   ${answeredText.padEnd(8)}  ${visit.client.name.padEnd(21)}  ` +
                    `${kind}  ${own.padEnd(7)}  ${holders}`,
            );
        }

        line('');
    }

    line('Summary (paste into DECISIONS.md)');
    line(
        `  seed ${seed} | median ${minutesText(result.firstReplyMedian)} | worst ${minutesText(result.firstReplyWorst)} | ` +
            `>5 min ${waitedOverFive} | never ${neverAnswered} | hard worst ${minutesText(result.hardWorst)} | ` +
            `own consultant ${percent(ownAtWorkGotOwn, ownAtWork)} | left with absent ${stuckWithAbsent} (longest ${minutesText(longestWithAbsent)}) | ` +
            `passed 3+ ${movedThreeTimes} | uneven ${unevenness ?? '-'}x | errors ${http.serverErrors}`,
    );
    line('');

    console.log(lines.join('\n'));

    return result;
}

/** The report as reviewers see it on Kendor's scorecard; ✓/✗ only where the answer is plain. */
export function scorecardOf(result) {
    const lines = [
        { label: 'First reply, typical', value: minutesText(result.firstReplyMedian), ok: null },
        { label: 'First reply, worst', value: minutesText(result.firstReplyWorst), ok: null },
        { label: 'Waited more than 5 min', value: String(result.waitedOverFive), ok: null },
        { label: 'Never got an answer', value: String(result.neverAnswered), ok: result.neverAnswered === 0 },
        { label: 'Hard chats, worst', value: minutesText(result.hardWorst), ok: null },
        {
            label: 'Returning clients who got their own consultant (when at work)',
            value: percent(result.ownAtWorkGotOwn, result.ownAtWork),
            ok: null,
        },
        {
            label: "Left with someone who wasn't there",
            value: `${result.stuckWithAbsent}, longest ${minutesText(result.longestWithAbsent)}`,
            ok: null,
        },
        { label: 'Passed around 3 times or more', value: String(result.movedThreeTimes), ok: null },
        { label: 'Answered by two people at once', value: String(result.answeredTwice), ok: result.answeredTwice === 0 },
        { label: 'Busiest vs quietest', value: result.unevenness === null ? 'someone answered nothing' : `${result.unevenness}x`, ok: null },
        { label: 'Requests your system failed', value: String(result.serverErrors), ok: result.serverErrors === 0 },
    ];

    return { groups: [{ title: `Monday, seed ${result.seed} (${result.chats} chats)`, lines }] };
}
