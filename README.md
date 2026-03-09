# CEISA Doc Generator (Frontend + Backend)

Project ini sudah dipisah menjadi 2 package:

- `frontend`: aplikasi React + Vite
- `backend`: API proxy Express untuk request ke Anthropic

## Struktur

```text
.
├─ frontend/
│  ├─ src/
│  └─ package.json
├─ backend/
│  ├─ src/server.js
│  └─ package.json
└─ package.json (workspace root)
```

## Setup

1. Install dependencies dari root:

```bash
npm install
```

2. Siapkan environment backend:

```bash
copy backend\\.env.example backend\\.env
```

Lalu isi `ANTHROPIC_API_KEY` di `backend/.env`.

## Menjalankan

Jalankan backend:

```bash
npm run dev:backend
```

Jalankan frontend (terminal terpisah):

```bash
npm run dev:frontend
```

Atau jalankan keduanya sekaligus (1 terminal):

```bash
npm run dev:all
```

Frontend akan call endpoint `/api/anthropic/v1/messages` dan diproxy ke backend saat development.

## Build

```bash
npm run build
```
