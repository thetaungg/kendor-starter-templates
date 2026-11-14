import { useEffect, useState } from 'react';

import { api, money, type OrderDetails } from '../api';

export function OrderCard({ conversationId }: { conversationId: number }) {
    const [order, setOrder] = useState<OrderDetails | null>(null);

    useEffect(() => {
        let cancelled = false;

        setOrder(null);

        api<{ order: OrderDetails | null }>(`/conversations/${conversationId}/order`)
            .then(body => {
                if (!cancelled) setOrder(body.order);
            })
            .catch(err => console.error(err));

        return () => {
            cancelled = true;
        };
    }, [conversationId]);

    if (!order) {
        return null;
    }

    return (
        <div className="order">
            <div>
                <strong>Order {order.ref}</strong> · {order.restaurant}
            </div>
            <div className="muted">{order.items.join(', ')}</div>
            <div>
                {money(order.totalCents)} · <span className="status">{order.status}</span>
            </div>
        </div>
    );
}
