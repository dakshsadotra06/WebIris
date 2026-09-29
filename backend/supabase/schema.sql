-- WebIris schema — run this in the Supabase SQL editor.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  goal text,
  url text,
  status text default 'running',
  created_at timestamptz default now()
);

create table if not exists steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references runs(id) on delete cascade,
  n int,
  reasoning text,
  action jsonb,
  valid boolean,
  screenshot_path text,
  created_at timestamptz default now()
);
