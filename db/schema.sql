-- Marques Family Secret Santa — Supabase schema
-- Run this once in the Supabase SQL editor for a fresh project.
-- The app only ever talks to these tables via the service role key on the
-- server, so Row Level Security is enabled with NO policies: the anon/public
-- key (if it ever leaked) could not read or write anything.

create extension if not exists pgcrypto;

-- 1. Participants: the nine family members, their PIN hashes, and lockout state.
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  pin_hash text,
  failed_attempts int not null default 0,
  total_failed_attempts int not null default 0,
  locked_until timestamptz,
  permanently_locked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table participants enable row level security;

-- 2. Exclusion rules: who each person is not allowed to draw.
create table if not exists exclusions (
  id uuid primary key default gen_random_uuid(),
  giver_name text not null,
  excluded_name text not null,
  unique (giver_name, excluded_name)
);

alter table exclusions enable row level security;

-- 3. Matches: the final draw result, once it has run.
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  giver_name text not null,
  receiver_name text not null,
  created_at timestamptz not null default now()
);

alter table matches enable row level security;

-- Singleton row tracking whether the draw has run, so it can only fire once.
create table if not exists draw_state (
  id int primary key default 1,
  completed boolean not null default false,
  completed_at timestamptz,
  constraint draw_state_singleton check (id = 1)
);

alter table draw_state enable row level security;

-- 4. Wishlist entries: gift ideas, visible to everyone, editable only by owner.
create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null,
  description text not null,
  link text,
  image_url text,
  created_at timestamptz not null default now()
);

alter table wishlist_items enable row level security;

-- Seed the nine participants (safe to re-run).
insert into participants (name) values
  ('Teresa'),
  ('Jaime'),
  ('Maria'),
  ('Miguel'),
  ('Rita'),
  ('Nuno'),
  ('Inês'),
  ('Joana'),
  ('Alice')
on conflict (name) do nothing;

-- Seed the draw_state singleton.
insert into draw_state (id, completed) values (1, false)
on conflict (id) do nothing;

-- Seed exclusion rules (mirrors src/lib/participants.ts — kept here too for
-- the "exclusion rules live in the database" requirement / troubleshooting).
insert into exclusions (giver_name, excluded_name) values
  ('Teresa', 'Teresa'),
  ('Teresa', 'Jaime'),
  ('Teresa', 'Maria'),
  ('Jaime', 'Jaime'),
  ('Jaime', 'Teresa'),
  ('Jaime', 'Maria'),
  ('Maria', 'Maria'),
  ('Maria', 'Jaime'),
  ('Maria', 'Teresa'),
  ('Miguel', 'Miguel'),
  ('Miguel', 'Alice'),
  ('Rita', 'Rita'),
  ('Rita', 'Nuno'),
  ('Nuno', 'Nuno'),
  ('Nuno', 'Rita'),
  ('Inês', 'Inês'),
  ('Inês', 'Nuno'),
  ('Inês', 'Miguel'),
  ('Inês', 'Alice'),
  ('Inês', 'Rita'),
  ('Inês', 'Joana'),
  ('Joana', 'Joana'),
  ('Joana', 'Miguel'),
  ('Joana', 'Alice'),
  ('Alice', 'Alice'),
  ('Alice', 'Miguel')
on conflict (giver_name, excluded_name) do nothing;
