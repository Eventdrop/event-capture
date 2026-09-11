import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { isEnabledVideoType } from '@/lib/video'
import { VIDEO_ACCESS_COOKIE_NAME, verifyVideoAccessGrant } from '@/lib/video-access'

export const runtime = 'nodejs'

const BUCKET = 'event-videos'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function failure(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, {
    status, headers: { 'Cache-Control': 'no-store' },
  })
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    return failure(403, 'Cross-origin request denied.')
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return failure(400, 'Invalid request.')
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return failure(400, 'Invalid request.')
  }
  const { videoId } = body as Record<string, unknown>
  if (Object.keys(body).length !== 1 || typeof videoId !== 'string' || !UUID.test(videoId)) {
    return failure(400, 'Only a valid videoId is accepted.')
  }

  try {
    const token = (await cookies()).get(VIDEO_ACCESS_COOKIE_NAME)?.value
    if (!token) return failure(401, 'Video access is required.')

    const supabase = createAdminSupabaseClient()
    const { data: video, error: videoError } = await supabase.from('event_videos')
      .select('id, event_id, uploader_session_id, type, status, storage_path')
      .eq('id', videoId)
      .maybeSingle()
    if (videoError) throw videoError
    if (!video) return failure(404, 'Video not found.')

    const grant = verifyVideoAccessGrant(token, video.event_id)
    if (!grant || video.event_id !== grant.eventId ||
      video.uploader_session_id !== grant.uploaderSessionId) {
      return failure(403, 'Video access is invalid or expired.')
    }
    if (video.type !== 'video_message' || !isEnabledVideoType(video.type)) {
      return failure(400, 'Video type is not enabled.')
    }
    // failed is the existing terminal status used for cancelled pending uploads.
    // Retain this tombstone and its ownership/path for authenticated cleanup retries.
    // It must never be revived; finalize only transitions pending_upload rows.
    if (video.status !== 'pending_upload' && video.status !== 'failed') {
      return failure(409, 'Video cannot be cancelled.')
    }

    const prefix = `${grant.eventId}/${video.id}/original`
    const extension = video.storage_path === `${prefix}.mp4` ? 'mp4'
      : video.storage_path === `${prefix}.webm` ? 'webm' : null
    if (!extension) return failure(422, 'Invalid video storage path.')
    const storagePath = `${prefix}.${extension}`

    if (video.status === 'pending_upload') {
      // Claim cancellation BEFORE touching Storage. A concurrent finalize either
      // wins this race (and its object is untouched) or cannot make the row ready.
      const { data: cancelled, error: cancelError } = await supabase.from('event_videos')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', video.id)
        .eq('event_id', grant.eventId)
        .eq('uploader_session_id', grant.uploaderSessionId)
        .eq('type', 'video_message')
        .eq('storage_path', storagePath)
        .eq('status', 'pending_upload')
        .select('id')
        .maybeSingle()
      if (cancelError) throw cancelError
      if (!cancelled) {
        const { data: current, error: currentError } = await supabase.from('event_videos')
          .select('status')
          .eq('id', video.id)
          .eq('event_id', grant.eventId)
          .eq('uploader_session_id', grant.uploaderSessionId)
          .eq('type', 'video_message')
          .eq('storage_path', storagePath)
          .maybeSingle()
        if (currentError) throw currentError
        if (current?.status !== 'failed') {
          return failure(409, 'Video state changed during cancellation.')
        }
      }
    }

    // Storage remove is safe for an absent object, including concurrent retries.
    // Do not roll back the tombstone on failure: a retry can finish cleanup, while
    // finalization remains blocked and the pending-upload admission slot is free.
    const { error: removeError } = await supabase.storage.from(BUCKET).remove([storagePath])
    if (removeError && String(removeError.statusCode) !== '404') throw removeError

    // Signed upload tokens are not revoked by deletion. Retain the path so a
    // retry (or future sweep after token expiry) can remove a late-arriving upload.
    return NextResponse.json({ ok: true, videoId: video.id, status: 'failed' }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    console.error('Video upload cancellation or cleanup failed')
    return failure(500, 'Video cancellation cleanup could not be completed. Retry cancellation.')
  }
}
