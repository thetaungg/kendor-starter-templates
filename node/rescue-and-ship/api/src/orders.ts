/**
 * Spoonrun's orders system. Treat it as someone else's service: you can't change it, only call it.
 *
 * - `latestOrderFor(phone)` finds the most recent order for a phone number, or null. It usually
 *   answers in a few hundred milliseconds; for some numbers it takes well over a second.
 * - `orderDetails(ref)` returns what's in an order and where it is. It takes about a second.
 *
 * Answers are made up but always the same for the same phone number or order.
 */

export interface OrderDetails {
    ref: string;
    restaurant: string;
    items: string[];
    totalCents: number;
    status: string;
}

const RESTAURANTS = ['Tasca do Zé', 'Burger Lab Baixa', 'Sushi Mar', 'Pizzeria Nonna', 'Bowl & Co', 'Taco Loco'];
const DISHES = ['Bitoque', 'Cheeseburger', 'Salmon poke', 'Margherita', 'Falafel bowl', 'Chicken tacos', 'Lemonade', 'Pastel de nata'];
const STATUSES = ['Being cooked', 'Rider on the way', 'Delivered', 'Rider waiting at the restaurant'];

function hashOf(text: string): number {
    let hash = 7;

    for (const char of text) {
        hash = (hash * 31 + char.charCodeAt(0)) % 1_000_003;
    }

    return hash;
}

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function latestOrderFor(phone: string): Promise<string | null> {
    const hash = hashOf(phone);
    const slow = hash % 10 < 4;

    if (slow) {
        await wait(1300 + (hash % 300));
    } else {
        await wait(60 + (hash % 120));
    }

    if (hash % 17 === 0) {
        return null;
    }

    return `SR-${40000 + (hash % 9000)}`;
}

export async function orderDetails(ref: string): Promise<OrderDetails> {
    const hash = hashOf(ref);

    await wait(800 + (hash % 300));

    const items: string[] = [];
    const count = 1 + (hash % 3);

    for (let n = 0; n < count; n += 1) {
        items.push(DISHES[(hash + n * 5) % DISHES.length]);
    }

    return {
        ref,
        restaurant: RESTAURANTS[hash % RESTAURANTS.length],
        items,
        totalCents: 900 + (hash % 3000),
        status: STATUSES[hash % STATUSES.length],
    };
}
