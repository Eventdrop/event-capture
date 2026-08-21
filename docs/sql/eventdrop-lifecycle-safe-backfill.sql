-- EventDrop lifecycle safe backfill.
-- Safe to run repeatedly after eventdrop-lifecycle-additive-schema.sql.
-- It only fills display/access/upload metadata used by the app.

update public.events
set album_name = name
where album_name is null
  and name is not null;

update public.events
set default_locale = 'nl'
where default_locale is null;

update public.uploads
set media_type = coalesce(nullif(media_type, ''), nullif(type, ''), 'photo')
where media_type is null
   or media_type = '';

update public.uploads
set type = coalesce(nullif(type, ''), nullif(media_type, ''), 'photo')
where type is null
   or type = '';

update public.uploads
set storage_path = substring(
    file_url
    from '/storage/v1/object/public/event-uploads/([^?#]+)'
  )
where (storage_path is null or storage_path = '')
  and file_url ~ '^https://[^/]+/storage/v1/object/public/event-uploads/[^?#]+$'
  and substring(file_url from '/storage/v1/object/public/event-uploads/([^?#]+)') !~ '(^/|(^|/)\.\.(/|$)|^https?://|^event-branding/)';

update public.uploads
set file_name = regexp_replace(storage_path, '^.*/', '')
where (file_name is null or file_name = '')
  and storage_path is not null
  and storage_path <> ''
  and storage_path !~ '(^/|(^|/)\.\.(/|$)|^https?://)';

-- Event and photo deletion is manual from the admin panel.
-- This backfill does not set retention or expiry fields.
