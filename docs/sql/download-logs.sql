create extension if not exists pgcrypto;

create table if not exists public.download_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  email text,
  download_type text not null check (download_type in ('album', 'selection')),
  item_count integer not null default 0 check (item_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists download_logs_event_id_idx
  on public.download_logs (event_id);

create index if not exists download_logs_created_at_idx
  on public.download_logs (created_at desc);

alter table public.download_logs enable row level security;

revoke all on table public.download_logs from anon, authenticated;
