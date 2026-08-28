alter table public.events
  add column if not exists guestbook_pdf_theme text not null default 'wedding';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'events_guestbook_pdf_theme_check'
  ) then
    alter table public.events
      add constraint events_guestbook_pdf_theme_check
      check (guestbook_pdf_theme in ('wedding', 'birthday', 'elegant', 'business'));
  end if;
end $$;
