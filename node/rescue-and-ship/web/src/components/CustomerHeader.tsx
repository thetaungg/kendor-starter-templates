import { useState } from 'react';

import { api } from '../api';

interface Props {
    customer: { id: number; name: string; phone: string };
    onBack: () => void;
}

/** The customer's name, which agents can correct (the provider often only knows a phone number). */
export function CustomerHeader({ customer, onBack }: Props) {
    const [name, setName] = useState(customer.name);
    const [editing, setEditing] = useState(false);

    async function save() {
        setEditing(false);

        if (name.trim() === '' || name === customer.name) {
            return;
        }

        await api(`/customers/${customer.id}`, { method: 'PATCH', body: JSON.stringify({ name }) });
    }

    return (
        <div className="customer">
            <button className="link back" onClick={onBack}>
                ‹ Back
            </button>
            {editing ? (
                <input
                    className="customer-name"
                    autoFocus
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onBlur={save}
                    onKeyDown={e => {
                        if (e.key === 'Enter') save();
                    }}
                />
            ) : (
                <h2 className="customer-name" title="Click to correct the name" onClick={() => setEditing(true)}>
                    {name}
                </h2>
            )}
            <span className="muted">{customer.phone}</span>
        </div>
    );
}
