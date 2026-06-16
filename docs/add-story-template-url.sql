-- Add this once in Supabase SQL Editor before uploading Instagram Story templates.
alter table public.events
  add column if not exists story_template_url text;
