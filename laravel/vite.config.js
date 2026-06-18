import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import kendor from '@kendordev/vite';

// Laravel runs Vite on its OWN origin (`php artisan serve` serves the page on a different host), so the
// asset URLs the laravel-vite-plugin writes to the `hot` file + the HMR socket must target Vite's public
// origin, not the page's. kendor() does exactly that from the injected KENDOR_VITE_ORIGIN (the split-
// origin `{port}-{sid}.preview.<domain>` host), plus host/allowedHosts. It is a no-op off-platform, so
// this config still runs fine for plain local development.
export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        kendor(),
    ],
});
