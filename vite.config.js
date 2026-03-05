import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Manually parse .env.local into process.env
const envPath = resolve(process.cwd(), '.env.local');
console.log('[vite proxy] Looking for .env.local at:', envPath);
try {
  const envLocal = readFileSync(envPath, 'utf-8');
  for (const line of envLocal.split(/\r?\n/)) {  // handle Windows CRLF + Unix LF
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, ''); // strip optional quotes
    process.env[key] = val;
  }
  console.log('[vite proxy] .env.local parsed successfully');
} catch (e) { console.log('[vite proxy] Failed to read .env.local:', e.message); }

// DEBUG — remove after confirming key loads correctly
console.log('[vite proxy] API key loaded:', process.env.VITE_ANTHROPIC_API_KEY ? `sk-ant-...${process.env.VITE_ANTHROPIC_API_KEY.slice(-4)}` : 'NOT FOUND ❌');

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  server: {
    proxy: {
      '/anthropic': {
        target:       'https://api.anthropic.com',
        changeOrigin: true,
        rewrite:      (path) => path.replace(/^\/anthropic/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-api-key',         process.env.VITE_ANTHROPIC_API_KEY || '');
            proxyReq.setHeader('anthropic-version', '2023-06-01');
            proxyReq.setHeader('content-type',      'application/json');
          });
        },
      },
    },
  },
});