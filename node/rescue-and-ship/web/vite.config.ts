import kendor from '@kendordev/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// kendor() makes the dev server work behind the Kendor sandbox proxy; it does nothing elsewhere.
export default defineConfig({
    root: 'web',
    plugins: [react(), kendor()],
    server: {
        proxy: {
            '/api': process.env.API_PROXY ?? 'http://127.0.0.1:3000',
        },
    },
});
