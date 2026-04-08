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

create index if not exists guest_access_logs_event_id_idx
  on public.guest_access_logs (event_id);

create index if not exists guest_access_logs_created_at_idx
  on public.guest_access_logs (created_at desc);
