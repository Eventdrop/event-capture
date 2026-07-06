alter table public.events
  add column if not exists default_locale text not null default 'nl';

alter table public.events
  drop constraint if exists events_default_locale_check;

alter table public.events
  add constraint events_default_locale_check
  check (default_locale in ('nl', 'en', 'de', 'fr', 'tr'));
