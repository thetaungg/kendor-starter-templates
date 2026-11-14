import { prefetch } from '../prefetch';

interface Props {
    teams: { id: number; name: string }[];
    currentId: number | null;
    onSwitch: (teamId: number) => void;
}

export function TeamSwitcher({ teams, currentId, onSwitch }: Props) {
    return (
        <nav className="teams">
            {teams.map(team => (
                <a
                    key={team.id}
                    href={`/teams/${team.id}`}
                    className={team.id === currentId ? 'team current' : 'team'}
                    onMouseEnter={() => prefetch(`/teams/${team.id}/open`)}
                    onClick={event => {
                        event.preventDefault();
                        onSwitch(team.id);
                    }}
                >
                    {team.name}
                </a>
            ))}
        </nav>
    );
}
