import { useEffect, useState } from 'react';

import type { Conversation, DeskData } from '../api';
import { load } from '../prefetch';
import { useDesk } from '../useDesk';
import { ConversationList } from './ConversationList';
import { ConversationPane } from './ConversationPane';
import { TeamSwitcher } from './TeamSwitcher';

type Tab = 'waiting' | 'mine' | 'done';

const TAB_LABELS: Record<Tab, string> = {
    waiting: 'Waiting',
    mine: 'Mine',
    done: 'Done',
};

const TABS: Tab[] = ['waiting', 'mine', 'done'];

function rowsFor(desk: DeskData, teamId: number, tab: Tab): Conversation[] {
    const rows: Conversation[] = [];

    for (const team of desk.teams) {
        if (team.id !== teamId) {
            continue;
        }

        for (const id of team[tab]) {
            const conversation = desk.conversations[id];

            if (conversation) {
                rows.push(conversation);
            }
        }
    }

    return rows;
}

export function Desk({ onSignOut }: { onSignOut: () => void }) {
    const { desk, version, refresh } = useDesk();
    const [teamId, setTeamId] = useState<number | null>(null);
    const [tab, setTab] = useState<Tab>('waiting');
    const [rows, setRows] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        if (!desk) {
            return;
        }

        setTeamId(desk.currentTeamId);
        setRows(rowsFor(desk, desk.currentTeamId, tab));
    }, [desk, tab]);

    async function switchTeam(id: number) {
        setTeamId(id);

        try {
            await load(`/teams/${id}/open`);
        } catch (err) {
            console.error(err);
        }
    }

    if (!desk) {
        return <p className="loading">Loading the desk…</p>;
    }

    let selected: Conversation | null = null;

    if (selectedId !== null && desk.conversations[selectedId]) {
        selected = desk.conversations[selectedId];
    }

    return (
        <div className="desk">
            <header className="top">
                <span className="brand">Spoonrun Desk</span>
                <TeamSwitcher teams={desk.teams} currentId={teamId} onSwitch={switchTeam} />
                <nav className="tabs">
                    {TABS.map(name => (
                        <button
                            key={name}
                            className={name === tab ? 'tab current' : 'tab'}
                            onClick={() => setTab(name)}
                        >
                            {TAB_LABELS[name]}
                            {name === 'mine' && desk.badge > 0 && <span className="badge">{desk.badge}</span>}
                        </button>
                    ))}
                </nav>
                <span className="me">
                    {desk.agent.name}{' '}
                    <button className="link" onClick={onSignOut}>
                        Sign out
                    </button>
                </span>
            </header>
            <div className={selected ? 'panes has-open' : 'panes'} key={version}>
                <aside className="list">
                    <ConversationList conversations={rows} selectedId={selectedId} onSelect={setSelectedId} />
                </aside>
                {selected ? (
                    <ConversationPane
                        conversation={selected}
                        agentId={desk.agent.id}
                        onChanged={refresh}
                        onBack={() => setSelectedId(null)}
                    />
                ) : (
                    <section className="conversation empty-pane">
                        <p className="muted">Pick a conversation.</p>
                    </section>
                )}
            </div>
        </div>
    );
}
