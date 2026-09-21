import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { VIDEO_ACCESS_COOKIE_NAME, verifyVideoAccessGrant } from '@/lib/video-access'
import { getVideoStorageExtension } from '@/lib/video'

export const runtime = 'nodejs'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PAGE_SIZE = 24
const PLAYBACK_SECONDS = 10 * 60

function reply(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const identifier = params.get('identifier')?.trim()
  const offsetText = params.get('offset') || '0'
  const offset = Number(offsetText)
  if (!identifier || identifier.length > 200 || !/^\d+$/.test(offsetText) ||
    !Number.isSafeInteger(offset) || offset > 1000000 ||
    [...params.keys()].some(key => key !== 'identifier' && key !== 'offset')) {
    return reply({ ok: false, error: 'Invalid request.' }, 400)
  }
  try {
    const token = (await cookies()).get(VIDEO_ACCESS_COOKIE_NAME)?.value
    if (!token) return reply({ ok: false, error: 'Event access is required.' }, 401)
    const supabase = createAdminSupabaseClient()
    const { data: event, error: eventError } = await supabase.from('events')
      .select('id, allow_guest_delete, video_messages_enabled').eq(UUID.test(identifier) ? 'id' : 'slug', identifier).maybeSingle()
    if (eventError) throw eventError
    if (!event) return reply({ ok: false, error: 'Event not found.' }, 404)
    const grant = verifyVideoAccessGrant(token, event.id)
    if (!grant) return reply({ ok: false, error: 'Event access is invalid or expired.' }, 403)
    if (event.video_messages_enabled === false) {
      return reply({ ok: false, error: 'Video messages are disabled for this event.' }, 403)
    }

    // Event-wide viewing, unlike cancellation which is uploader-specific.
    const { data: rows, error } = await supabase.from('event_videos')
      .select('id, created_at, storage_path, uploader_session_id')
      .eq('event_id', grant.eventId).eq('type', 'video_message').eq('status', 'ready')
      .order('created_at', { ascending: false }).order('id', { ascending: false })
      .range(offset, offset + PAGE_SIZE)
    if (error) throw error
    const expiresIn = Math.min(PLAYBACK_SECONDS, grant.expiresAt - Math.floor(Date.now() / 1000))
    if (expiresIn <= 0) return reply({ ok: false, error: 'Event access has expired.' }, 403)
    const videos = await Promise.all((rows || []).slice(0, PAGE_SIZE).map(async video => {
      const safe = {
        id: video.id,
        canDelete: event.allow_guest_delete === true || video.uploader_session_id === grant.uploaderSessionId,
        createdAt: video.created_at,
        playbackUrl: null as string | null,
        extension: null as 'mp4' | 'webm' | 'mov' | null,
      }
      // Only sign the canonical path of a server-loaded ready row. A bad/missing
      // object affects this card only, never the rest of the gallery.
      const prefix = `${grant.eventId}/${video.id}/original`
      const extension = getVideoStorageExtension(video.storage_path, prefix)
      if (!extension) return safe
      safe.extension = extension
      try {
        const { data, error: signError } = await supabase.storage.from('event-videos')
          .createSignedUrl(`${prefix}.${extension}`, expiresIn)
        if (!signError && data?.signedUrl) safe.playbackUrl = data.signedUrl
      } catch {
        // Retain stable identity and let the card offer a refresh.
      }
      return safe
    }))
    return reply({ ok: true, videos, hasMore: (rows?.length || 0) > PAGE_SIZE })
  } catch {
    console.error('Video message gallery could not be loaded')
    return reply({ ok: false, error: 'Video messages could not be loaded.' }, 500)
  }
}
