import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import type { VideoAccessGrant } from '@/lib/video-access'
import { getVideoStorageExtension } from '@/lib/video'

// Installed @supabase/storage-js StorageFileApi.createSignedUploadUrl documents
// a fixed two-hour lifetime (the API exposes no expiresIn option).
const SIGNED_UPLOAD_LIFETIME_MS = 2 * 60 * 60 * 1000
// Allow for signing latency, clock skew and uploads finishing near token expiry.
const UPLOAD_EXPIRY_GRACE_MS = 5 * 60 * 1000
const CLEANUP_BATCH_SIZE = 10
const BUCKET = 'event-videos'

export async function cleanupStaleVideoUploads(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  grant: VideoAccessGrant,
) {
  const cutoff = new Date(Date.now() - SIGNED_UPLOAD_LIFETIME_MS - UPLOAD_EXPIRY_GRACE_MS)
    .toISOString()
  const ownedVideos = () => supabase.from('event_videos')

  // Separate batches prevent failed tombstones from starving pending-slot recovery.
  const { data: pending, error: pendingError } = await ownedVideos()
    .select('id')
    .eq('event_id', grant.eventId)
    .eq('uploader_session_id', grant.uploaderSessionId)
    .eq('type', 'video_message')
    .eq('status', 'pending_upload')
    .lt('created_at', cutoff)
    .order('created_at')
    .order('id')
    .limit(CLEANUP_BATCH_SIZE)
  if (pendingError) throw pendingError

  for (const video of pending || []) {
    // Finalize and cleanup compete on the same pending_upload predicate. Never
    // remove an object merely because an earlier read said it was pending.
    const { error } = await ownedVideos()
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', video.id)
      .eq('event_id', grant.eventId)
      .eq('uploader_session_id', grant.uploaderSessionId)
      .eq('type', 'video_message')
      .eq('status', 'pending_upload')
      .lt('created_at', cutoff)
    if (error) throw error
  }

  const { data: failed, error: failedError } = await ownedVideos()
    .select('id, storage_path')
    .eq('event_id', grant.eventId)
    .eq('uploader_session_id', grant.uploaderSessionId)
    .eq('type', 'video_message')
    .eq('status', 'failed')
    .lt('created_at', cutoff)
    .order('updated_at')
    .order('id')
    .limit(CLEANUP_BATCH_SIZE)
  if (failedError) throw failedError

  for (const video of failed || []) {
    // Rotate attempts, including failures/invalid paths, so older tombstones do
    // not permanently monopolize the bounded batch. Retain them for late uploads
    // that may finish after expiry; failed rows can never be finalized.
    const { data: claimed, error: claimError } = await ownedVideos()
      .update({ updated_at: new Date().toISOString() })
      .eq('id', video.id)
      .eq('event_id', grant.eventId)
      .eq('uploader_session_id', grant.uploaderSessionId)
      .eq('type', 'video_message')
      .eq('status', 'failed')
      .eq('storage_path', video.storage_path)
      .lt('created_at', cutoff)
      .select('id')
      .maybeSingle()
    if (claimError) {
      console.error('Stale video cleanup claim failed')
      continue
    }
    if (!claimed) continue

    const prefix = `${grant.eventId}/${video.id}/original`
    const extension = getVideoStorageExtension(video.storage_path, prefix)
    if (!extension) continue

    try {
      const { error } = await supabase.storage.from(BUCKET).remove([`${prefix}.${extension}`])
      if (error && String(error.statusCode) !== '404') throw error
    } catch {
      console.error('Stale video object cleanup failed')
    }
  }
}
