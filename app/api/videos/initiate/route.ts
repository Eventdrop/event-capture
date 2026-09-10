import { randomUUID } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { isEnabledVideoType } from '@/lib/video'
import { VIDEO_ACCESS_COOKIE_NAME, verifyVideoAccessGrant } from '@/lib/video-access'

export const runtime = 'nodejs'

const BUCKET = 'event-videos'
const MAX_PENDING_UPLOADS = 3
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function failure(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status })
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
  const { identifier, type, extension } = body as Record<string, unknown>
  if (typeof identifier !== 'string' || !identifier.trim() || identifier.length > 200) {
    return failure(400, 'Invalid event identifier.')
  }
  if (type !== 'video_message' || !isEnabledVideoType(type)) {
    return failure(400, 'Video type is not enabled.')
  }
  if (extension !== 'mp4' && extension !== 'webm') {
    return failure(400, 'Unsupported video extension.')
  }

  try {
    const token = (await cookies()).get(VIDEO_ACCESS_COOKIE_NAME)?.value
    if (!token) return failure(401, 'Video access is required.')

    const supabase = createAdminSupabaseClient()
    const eventIdentifier = identifier.trim()
    const { data: event, error: eventError } = await supabase.from('events')
      .select('id')
      .eq(UUID.test(eventIdentifier) ? 'id' : 'slug', eventIdentifier)
      .maybeSingle()
    if (eventError) throw eventError
    if (!event) return failure(404, 'Event not found.')

    const grant = verifyVideoAccessGrant(token, event.id)
    if (!grant) return failure(403, 'Video access is invalid or expired.')

    // Best-effort admission limit; concurrent requests are not serialized across instances.
    const { count, error: countError } = await supabase.from('event_videos')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id)
      .eq('uploader_session_id', grant.uploaderSessionId)
      .eq('status', 'pending_upload')
    if (countError || count === null) throw new Error('Pending upload count unavailable')
    if (count >= MAX_PENDING_UPLOADS) {
      return failure(429, 'Too many pending video uploads.')
    }

    const videoId = randomUUID()
    const storagePath = `${event.id}/${videoId}/original.${extension}`
    const { error: insertError } = await supabase.from('event_videos').insert({
      id: videoId,
      event_id: event.id,
      type,
      status: 'pending_upload',
      uploader_session_id: grant.uploaderSessionId,
      storage_path: storagePath,
    })
    if (insertError) throw insertError

    try {
      const { data, error } = await supabase.storage.from(BUCKET)
        .createSignedUploadUrl(storagePath, { upsert: false })
      if (error || !data?.token || !data.signedUrl || data.path !== storagePath) {
        throw new Error('Signed video upload unavailable')
      }
      return NextResponse.json({
        ok: true,
        videoId,
        bucket: BUCKET,
        path: storagePath,
        token: data.token,
        signedUrl: data.signedUrl,
      }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
    } catch {
      try {
        const { error } = await supabase.from('event_videos').delete()
          .eq('id', videoId)
          .eq('event_id', event.id)
          .eq('status', 'pending_upload')
        if (error) throw error
      } catch {
        console.error('Video initiation pending-row cleanup failed', { videoId })
      }
      throw new Error('Signed video upload unavailable')
    }
  } catch {
    console.error('Video upload initiation failed')
    return failure(500, 'Video upload could not be initiated.')
  }
}
