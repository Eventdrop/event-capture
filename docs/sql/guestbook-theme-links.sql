-- Short, event-scoped Guestbook theme-selection links. No customer data or raw codes.
create table if not exists public.guestbook_theme_links (
  id uuid primary key,
  code_hash text not null unique check (code_hash ~ '^[0-9a-f]{64}$'),
  event_id uuid not null references public.events(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists guestbook_theme_links_event_idx
  on public.guestbook_theme_links (event_id, created_at desc);

alter table public.guestbook_theme_links enable row level security;
revoke all on public.guestbook_theme_links from anon, authenticated;
grant select, insert, update, delete on public.guestbook_theme_links to service_role;
-- No public policies: only server-side service-role access is permitted.
