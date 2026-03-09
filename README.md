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

3. Siapkan environment frontend untuk Supabase auth:

```bash
copy frontend\\.env.example frontend\\.env
```

Lalu isi `VITE_SUPABASE_ANON_KEY` di `frontend/.env`.

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

Login/register sekarang memakai Supabase Auth dari frontend.

## Supabase Table Setup (Cloud Save)

Jalankan file SQL berikut di Supabase SQL Editor:

`supabase-user-projects.sql`

SQL ini akan membuat tabel `public.user_projects` + policy RLS agar setiap user hanya bisa membaca/menulis datanya sendiri.

File SQL yang sama juga membuat tabel `public.analysis_entries` untuk menyimpan data hasil akuisisi halaman + output AI sebagai **1 entry per upload**.

## Email Verification

- Jika Supabase Auth mengharuskan email verification, user baru akan diminta verifikasi email dulu sebelum login.
- Di halaman auth sudah tersedia tombol **Kirim Ulang Email Verifikasi**.

## Role: User vs Admin

- `user`: bisa membuat entry (via upload) dan melihat entry.
- `admin`: bisa membuat, melihat, dan mengedit `entry_title` serta `entry_notes` pada entry.

Untuk menjadikan akun sebagai admin, jalankan SQL berikut (ganti UUID user):

```sql
insert into public.user_roles (user_id, role)
values ('YOUR_USER_UUID', 'admin')
on conflict (user_id) do update set role = 'admin', updated_at = now();
```

## Build

```bash
npm run build
```
