-- EventDrop required columns for admin visuals, poster/story templates, and guest messages.
-- Run this in the correct Supabase project SQL Editor.

alter table public.events
  add column if not exists cover_image_url text;

alter table public.events
  add column if not exists background_image_url text;

alter table public.events
  add column if not exists poster_template_url text;

alter table public.events
  add column if not exists story_template_url text;

alter table public.uploads
  add column if not exists share_code text;

alter table public.uploads
  add column if not exists guest_message text;

create unique index if not exists uploads_share_code_idx
  on public.uploads (share_code)
  where share_code is not null;
