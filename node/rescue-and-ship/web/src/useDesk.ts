import { useCallback, useEffect, useRef, useState } from 'react';

import { api, type DeskData } from './api';

const REFRESH_EVERY_MS = 1500;

export function useDesk() {
    const [desk, setDesk] = useState<DeskData | null>(null);
    const [version, setVersion] = useState(0);
    const lastSeen = useRef('');

    const refresh = useCallback(async () => {
        try {
            const next = await api<DeskData>('/desk');
            const json = JSON.stringify(next);

            if (json === lastSeen.current) {
                return;
            }

            lastSeen.current = json;
            setDesk(next);
            setVersion(current => current + 1);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        refresh();

        const timer = window.setInterval(refresh, REFRESH_EVERY_MS);

        return () => window.clearInterval(timer);
    }, [refresh]);

    return { desk, version, refresh };
}
