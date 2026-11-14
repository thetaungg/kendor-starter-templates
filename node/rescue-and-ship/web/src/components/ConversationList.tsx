import { type Conversation, minutesAgo } from '../api';

interface Props {
    conversations: Conversation[];
    selectedId: number | null;
    onSelect: (id: number) => void;
}

function lastCustomerMessage(conversation: Conversation) {
    let last = null;

    for (const message of conversation.messages) {
        if (message.direction === 'in') {
            last = message;
        }
    }

    return last;
}

export function ConversationList({ conversations, selectedId, onSelect }: Props) {
    if (conversations.length === 0) {
        return <p className="empty">Nothing here right now.</p>;
    }

    return (
        <ul className="rows">
            {conversations.map(conversation => {
                const last = lastCustomerMessage(conversation);
                const classes = ['row'];

                if (conversation.id === selectedId) classes.push('selected');
                if (conversation.unread) classes.push('unread');

                return (
                    <li key={conversation.id}>
                        <button className={classes.join(' ')} onClick={() => onSelect(conversation.id)}>
                            <span className="row-top">
                                <strong>{conversation.customer.name}</strong>
                                {last && <span className="muted">{minutesAgo(last.createdAt)}</span>}
                            </span>
                            {last && <span className="preview">{last.body}</span>}
                            {conversation.orderRef && <span className="muted">Order {conversation.orderRef}</span>}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
