export interface Message {
    id: number;
    direction: 'in' | 'out' | 'note';
    agentName: string | null;
    body: string;
    createdAt: string;
}

export interface Conversation {
    id: number;
    teamId: number;
    status: 'open' | 'closed';
    assignedAgent: { id: number; name: string } | null;
    orderRef: string | null;
    customer: { id: number; name: string; phone: string };
    messages: Message[];
    unread: boolean;
}

export interface TeamLists {
    id: number;
    name: string;
    waiting: number[];
    mine: number[];
    done: number[];
}

export interface DeskData {
    agent: { id: number; name: string; email: string };
    currentTeamId: number;
    badge: number;
    teams: TeamLists[];
    conversations: Record<number, Conversation>;
}

export interface OrderDetails {
    ref: string;
    restaurant: string;
    items: string[];
    totalCents: number;
    status: string;
}

const TOKEN_KEY = 'spoonrun-desk-token';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

export class ApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
    }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    const token = getToken();

    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (init.body) headers.set('Content-Type', 'application/json');

    const response = await fetch(`/api${path}`, { ...init, headers });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new ApiError(body.error ?? `request failed (${response.status})`, response.status);
    }

    return body as T;
}

export function minutesAgo(iso: string): string {
    const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);

    if (minutes < 1) {
        return 'just now';
    }

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    return `${Math.floor(minutes / 60)} h ago`;
}

export function money(cents: number): string {
    return `€${(cents / 100).toFixed(2)}`;
}
