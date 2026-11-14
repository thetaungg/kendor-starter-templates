import { useEffect, useRef, useState } from 'react';

import { api, type Conversation } from '../api';
import { Composer } from './Composer';
import { CustomerHeader } from './CustomerHeader';
import { OrderCard } from './OrderCard';

interface Props {
    conversation: Conversation;
    agentId: number;
    onChanged: () => void;
    onBack: () => void;
}

function time(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ConversationPane({ conversation, agentId, onChanged, onBack }: Props) {
    const messagesRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState('');
    const isMine = conversation.assignedAgent?.id === agentId;

    useEffect(() => {
        const element = messagesRef.current;

        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    }, [conversation.id, conversation.messages.length]);

    useEffect(() => {
        if (!isMine || !conversation.unread) {
            return;
        }

        api(`/conversations/${conversation.id}/read`, { method: 'POST' })
            .then(onChanged)
            .catch(err => console.error(err));
    }, [conversation.id, conversation.unread, isMine, onChanged]);

    async function act(action: 'take' | 'close') {
        setError('');

        try {
            await api(`/conversations/${conversation.id}/${action}`, { method: 'POST' });
            onChanged();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'something went wrong');
        }
    }

    let owner = 'Waiting for someone to take it';

    if (conversation.status === 'closed') {
        owner = 'Done';
    } else if (isMine) {
        owner = 'Yours';
    } else if (conversation.assignedAgent) {
        owner = `${conversation.assignedAgent.name} has this`;
    }

    return (
        <section className="conversation">
            <header className="conversation-head">
                <CustomerHeader customer={conversation.customer} onBack={onBack} />
                <div className="actions">
                    <span className="muted">{owner}</span>
                    {conversation.status === 'open' && !isMine && (
                        <button onClick={() => act('take')}>Take</button>
                    )}
                    {conversation.status === 'open' && isMine && (
                        <button className="secondary" onClick={() => act('close')}>
                            Done
                        </button>
                    )}
                </div>
            </header>
            {error && <p className="error">{error}</p>}
            <OrderCard conversationId={conversation.id} />
            <div className="messages" ref={messagesRef}>
                {conversation.messages.map(message => (
                    <div key={message.id} className={`message ${message.direction}`}>
                        {message.direction === 'out' && <span className="who">{message.agentName}</span>}
                        <p>{message.body}</p>
                        <span className="muted">{time(message.createdAt)}</span>
                    </div>
                ))}
            </div>
            {isMine && conversation.status === 'open' && (
                <Composer conversationId={conversation.id} onSent={onChanged} />
            )}
        </section>
    );
}
