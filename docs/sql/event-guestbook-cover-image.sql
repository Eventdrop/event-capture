alter table public.events
  add column if not exists guestbook_cover_image_url text null;
