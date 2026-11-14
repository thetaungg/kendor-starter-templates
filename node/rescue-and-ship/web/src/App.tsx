import { useState } from 'react';

import { getToken, setToken } from './api';
import { Desk } from './components/Desk';
import { LoginPage } from './components/LoginPage';

export function App() {
    const [signedIn, setSignedIn] = useState(Boolean(getToken()));

    function signOut() {
        setToken(null);
        setSignedIn(false);
    }

    if (!signedIn) {
        return <LoginPage onSignIn={() => setSignedIn(true)} />;
    }

    return <Desk onSignOut={signOut} />;
}
