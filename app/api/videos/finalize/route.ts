import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { getVideoPolicy, getVideoStorageExtension, isSupportedVideoMimeType } from '@/lib/video'
import { VIDEO_ACCESS_COOKIE_NAME, verifyVideoAccessGrant } from '@/lib/video-access'

export const runtime = 'nodejs'

const BUCKET = 'event-videos'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function failure(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, {
    status, headers: { 'Cache-Control': 'no-store' },
  })
}

function success(videoId: string) {
  return NextResponse.json({ ok: true, videoId, status: 'ready' }, {
    headers: { 'Cache-Control': 'no-store' },
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

    // Resolve the expected event exclusively from the server-owned pending row.
    const grant = verifyVideoAccessGrant(token, video.event_id)
    if (!grant || video.event_id !== grant.eventId ||
      video.uploader_session_id !== grant.uploaderSessionId) {
      return failure(403, 'Video access is invalid or expired.')
    }
    const policy = getVideoPolicy('video_message')
    if (video.type !== 'video_message' || !policy.enabled) {
      return failure(400, 'Video type is not enabled.')
    }

    const { data: event, error: eventError } = await supabase.from('events')
      .select('video_messages_enabled')
      .eq('id', video.event_id)
      .maybeSingle()
    if (eventError) throw eventError
    if (event?.video_messages_enabled === false) {
      return failure(403, 'Video messages are disabled for this event.')
    }

    // An authenticated retry never rewrites metadata or revives hidden/failed records.
    if (video.status === 'ready') return success(video.id)
    if (video.status !== 'pending_upload') {
      return failure(409, 'Video is not pending upload.')
    }

    // Initiation stores the extension in storage_path; accept only its exact canonical paths.
    const prefix = `${grant.eventId}/${video.id}/original`
    const extension = getVideoStorageExtension(video.storage_path, prefix)
    if (!extension) return failure(422, 'Invalid video storage path.')
    const storagePath = `${prefix}.${extension}`
    const { data: object, error: objectError } = await supabase.storage.from(BUCKET)
      .info(storagePath)
    if (objectError) {
      if (String(objectError.statusCode) === '404') {
        return failure(409, 'Video upload is not available yet.')
      }
      throw objectError
    }
    if (!object || object.bucketId !== BUCKET || object.name !== storagePath) {
      return failure(422, 'Video object could not be verified.')
    }
    // Use Storage's standard fields, never uploader-supplied custom metadata.
    const sizeBytes = object.size
    const mimeType = typeof object.contentType === 'string'
      ? object.contentType.split(';', 1)[0].trim().toLowerCase() : null
    if (!mimeType || !isSupportedVideoMimeType(extension, mimeType)) {
      return failure(422, 'Unsupported video MIME type.')
    }
    if (typeof sizeBytes !== 'number' || !Number.isSafeInteger(sizeBytes) || sizeBytes <= 0) {
      return failure(422, 'Invalid video size metadata.')
    }
    if (sizeBytes > policy.maxSizeBytes) {
      return failure(413, 'Video exceeds the maximum upload size.')
    }

    // Compare-and-set makes concurrent finalizations safe. Do not delete objects on
    // failure: another request may already have finalized this same immutable upload.
    const { data: updated, error: updateError } = await supabase.from('event_videos')
      .update({
        status: 'ready', mime_type: mimeType, size_bytes: sizeBytes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', video.id)
      .eq('event_id', grant.eventId)
      .eq('uploader_session_id', grant.uploaderSessionId)
      .eq('type', 'video_message')
      .eq('storage_path', storagePath)
      .eq('status', 'pending_upload')
      .select('id')
      .maybeSingle()
    if (updateError) throw updateError
    if (updated) return success(updated.id)

    const { data: current, error: currentError } = await supabase.from('event_videos')
      .select('status')
      .eq('id', video.id)
      .eq('event_id', grant.eventId)
      .eq('uploader_session_id', grant.uploaderSessionId)
      .eq('type', 'video_message')
      .eq('storage_path', storagePath)
      .maybeSingle()
    if (currentError) throw currentError
    if (current?.status === 'ready') return success(video.id)
    return failure(409, 'Video state changed during finalization.')
  } catch {
    console.error('Video upload finalization failed')
    return failure(500, 'Video upload could not be finalized.')
  }
}
