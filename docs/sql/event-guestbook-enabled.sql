alter table public.events
  add column if not exists guestbook_enabled boolean not null default true;
