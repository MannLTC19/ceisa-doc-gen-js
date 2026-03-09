import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Load .env files from repository root (../.env, ../.env.local, etc.)
  // so frontend can read shared VITE_* variables stored at workspace root.
  envDir: '..',
  server: {
    proxy: {
      // proxy front‑end API calls during development to the backend service
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
