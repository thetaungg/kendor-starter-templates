import { type FormEvent, useState } from 'react';

import { api, setToken } from '../api';

export function LoginPage({ onSignIn }: { onSignIn: () => void }) {
    const [email, setEmail] = useState('kofi@spoonrun.test');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    async function submit(event: FormEvent) {
        event.preventDefault();
        setError('');

        try {
            const { token } = await api<{ token: string }>('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            setToken(token);
            onSignIn();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'could not sign in');
        }
    }

    return (
        <main className="login-page">
            <form className="login" onSubmit={submit}>
                <h1>Spoonrun Desk</h1>
                <label>
                    Email
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                </label>
                <label>
                    Password
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit">Sign in</button>
                <p className="muted">
                    Demo: kofi@spoonrun.test or ines@spoonrun.test, password <code>spoon</code>.
                </p>
            </form>
        </main>
    );
}
