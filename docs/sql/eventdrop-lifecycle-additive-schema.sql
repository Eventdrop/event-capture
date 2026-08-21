-- EventDrop lifecycle additive schema migration.
-- Safe to run repeatedly. It only adds missing columns and indexes.
-- It does not drop, rename, or force NOT NULL on legacy data.

create extension if not exists pgcrypto;

create table if not exists public.admin_credentials (
  id text primary key,
  username text not null,
  password_hash text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.guest_access_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  event_slug text,
  email text not null,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.download_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  email text,
  download_type text not null,
  item_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.events
  add column if not exists album_name text;

alter table public.events
  add column if not exists slug text;

alter table public.events
  add column if not exists access_code text;

alter table public.events
  add column if not exists event_date date;

alter table public.events
  add column if not exists default_locale text;

alter table public.events
  add column if not exists cover_image_url text;

alter table public.events
  add column if not exists background_image_url text;

alter table public.events
  add column if not exists poster_template_url text;

alter table public.events
  add column if not exists story_template_url text;

alter table public.events
  add column if not exists allow_guest_share boolean not null default true;

alter table public.events
  add column if not exists allow_guest_download boolean not null default true;

alter table public.events
  add column if not exists allow_album_download boolean not null default true;

alter table public.events
  add column if not exists allow_guest_delete boolean not null default false;

alter table public.events
  add column if not exists allow_guest_poster boolean not null default false;

alter table public.uploads
  add column if not exists storage_path text;

alter table public.uploads
  add column if not exists file_name text;

alter table public.uploads
  add column if not exists share_code text;

alter table public.uploads
  add column if not exists guest_message text;

alter table public.uploads
  add column if not exists media_type text;

alter table public.uploads
  add column if not exists type text;

alter table public.uploads
  add column if not exists mime_type text;

create index if not exists events_slug_idx
  on public.events (slug)
  where slug is not null;

create index if not exists events_access_code_lookup_idx
  on public.events (access_code)
  where access_code is not null;

create index if not exists uploads_event_id_idx
  on public.uploads (event_id);

create index if not exists uploads_share_code_lookup_idx
  on public.uploads (share_code)
  where share_code is not null;

create index if not exists guest_access_logs_event_id_idx
  on public.guest_access_logs (event_id);

create index if not exists guest_access_logs_created_at_idx
  on public.guest_access_logs (created_at desc);

create index if not exists download_logs_event_id_idx
  on public.download_logs (event_id);

create index if not exists download_logs_created_at_idx
  on public.download_logs (created_at desc);
