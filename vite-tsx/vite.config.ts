import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import kendor from '@kendordev/vite'

// kendor() makes this dev server reachable + HMR-correct behind the Kendor sandbox proxy
// (host / allowedHosts / origin / HMR derived from the injected KENDOR_VITE_ORIGIN). It is a no-op
// off-platform, so this config runs unchanged for plain local development.
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), kendor()],
})
