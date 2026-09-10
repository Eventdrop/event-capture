-- PROPOSED ONLY: EventDrop Video Core Phase 2. Review before applying.
-- Source of truth: lib/video.ts. Only video_message is enabled in V1;
-- event_video is represented here but must remain disabled in application policy.
-- No upload endpoints, guest grants, or client storage permissions are added.

begin;

create table if not exists public.event_videos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  type text not null check (type in ('video_message', 'event_video')),
  storage_path text unique,
  status text not null default 'pending_upload'
    check (status in ('pending_upload', 'uploaded', 'ready', 'failed', 'hidden')),
  mime_type text,
  size_bytes bigint check (size_bytes >= 0),
  duration_ms integer check (duration_ms >= 0),
  width integer check (width > 0),
  height integer check (height > 0),
  guest_name text,
  uploader_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Nullable upload metadata supports pending_upload and failed records.
-- uploader_session_id is an opaque server-validated identifier, not an auth.users FK.
-- Future server updates must maintain updated_at; no timestamp trigger is added.
-- MIME/codec/duration verification and type-specific limits belong to finalization.
create index if not exists event_videos_event_type_created_at_idx
  on public.event_videos (event_id, type, created_at);

alter table public.event_videos enable row level security;
revoke all on public.event_videos from public, anon, authenticated;
grant select, insert, update, delete on public.event_videos to service_role;

-- Restrictive guard also blocks clients if a permissive policy is later added.
-- Service-role access bypasses RLS and must remain exclusively server-side.
drop policy if exists event_videos_no_client_access on public.event_videos;
create policy event_videos_no_client_access
  on public.event_videos as restrictive
  for all to anon, authenticated
  using (false)
  with check (false);

-- PRIVATE bucket. Future server-generated paths:
-- <event-id>/<video-id>/original.<ext>
-- Playback will use short-lived signed URLs, never permanent public URLs.
-- V1 ceiling mirrors lib/video.ts: 25 * 1024 * 1024 bytes.
-- Do not enable longer event_video uploads without reviewing this bucket ceiling.
-- MIME allowlisting is deferred until supported recording formats are established.
insert into storage.buckets (id, name, public, file_size_limit)
values ('event-videos', 'event-videos', false, 26214400)
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit;

-- Bucket-specific restriction defeats existing broad permissive storage policies
-- for anon/authenticated roles. Other buckets, including event-uploads, are unchanged.
-- No permissive client upload/read/list/delete policy is introduced in Phase 2.
drop policy if exists event_videos_no_client_storage_access on storage.objects;
create policy event_videos_no_client_storage_access
  on storage.objects as restrictive
  for all to anon, authenticated
  using (bucket_id <> 'event-videos')
  with check (bucket_id <> 'event-videos');

-- Event deletion cascades metadata only. Future server deletion must also remove
-- the corresponding storage objects through the Storage API, with retry handling.
-- Supabase storage.objects RLS is managed by Supabase; do not alter shared grants.

commit;
