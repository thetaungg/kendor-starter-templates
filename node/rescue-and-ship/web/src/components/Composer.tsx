import { type FormEvent, useState } from 'react';

import { api } from '../api';

export function Composer({ conversationId, onSent }: { conversationId: number; onSent: () => void }) {
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    async function send(event: FormEvent) {
        event.preventDefault();

        if (draft.trim() === '') {
            return;
        }

        setSending(true);
        setError('');

        try {
            await api(`/conversations/${conversationId}/reply`, {
                method: 'POST',
                body: JSON.stringify({ text: draft }),
            });
            setDraft('');
            onSent();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'could not send');
        } finally {
            setSending(false);
        }
    }

    return (
        <form className="composer" onSubmit={send}>
            {error && <p className="error">{error}</p>}
            <textarea
                rows={2}
                placeholder="Write a reply…"
                value={draft}
                onChange={e => setDraft(e.target.value)}
            />
            <button type="submit" disabled={sending}>
                Send
            </button>
        </form>
    );
}
