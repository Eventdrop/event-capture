-- EventDrop standalone guestbook messages.
-- Additive and safe to run repeatedly. Existing uploads.guest_message is kept.

create extension if not exists pgcrypto;

create table if not exists public.guestbook_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_name text,
  message text not null,
  related_upload_id uuid references public.uploads(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists guestbook_messages_event_created_at_idx
  on public.guestbook_messages (event_id, created_at desc);

create index if not exists guestbook_messages_related_upload_id_idx
  on public.guestbook_messages (related_upload_id)
  where related_upload_id is not null;

alter table public.guestbook_messages enable row level security;

drop policy if exists "No direct access to guestbook messages" on public.guestbook_messages;
create policy "No direct access to guestbook messages"
on public.guestbook_messages
for all
to public
using (false)
with check (false);
