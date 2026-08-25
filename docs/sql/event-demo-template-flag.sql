-- Add a non-destructive discriminator for reusable admin demo templates.
-- Existing events remain normal customer events by default.

alter table public.events
  add column if not exists is_demo_template boolean not null default false;

create index if not exists events_is_demo_template_idx
  on public.events (is_demo_template);
