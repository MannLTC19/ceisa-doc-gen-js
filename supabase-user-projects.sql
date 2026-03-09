-- Run this in Supabase SQL Editor
-- Stores one project JSON per authenticated user.

create table if not exists public.user_projects (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  project_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_projects enable row level security;

-- Users can read only their own project row.
create policy if not exists "user_projects_select_own"
on public.user_projects
for select
using (auth.uid() = user_id);

-- Users can insert only their own row.
create policy if not exists "user_projects_insert_own"
on public.user_projects
for insert
with check (auth.uid() = user_id);

-- Users can update only their own row.
create policy if not exists "user_projects_update_own"
on public.user_projects
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Stores each processed upload as one row (single entry like export snapshot).
create table if not exists public.analysis_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text,
  entry_title text,
  entry_notes text,
  source_file_name text,
  total_pages int,
  parsed_pages int,
  acquired_data jsonb not null,
  ai_output jsonb not null,
  usage_meta jsonb,
  created_at timestamptz not null default now()
);

alter table public.analysis_entries enable row level security;

alter table public.analysis_entries add column if not exists entry_title text;
alter table public.analysis_entries add column if not exists entry_notes text;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'admin')) default 'user',
  updated_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

create policy if not exists "user_roles_select_own"
on public.user_roles
for select
using (auth.uid() = user_id);

create policy if not exists "analysis_entries_select_own"
on public.analysis_entries
for select
using (auth.uid() = user_id);

create policy if not exists "analysis_entries_select_admin"
on public.analysis_entries
for select
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  )
);

create policy if not exists "analysis_entries_insert_own"
on public.analysis_entries
for insert
with check (auth.uid() = user_id);

create policy if not exists "analysis_entries_update_admin"
on public.analysis_entries
for update
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  )
);
