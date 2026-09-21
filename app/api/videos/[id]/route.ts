import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { VIDEO_ACCESS_COOKIE_NAME, verifyVideoAccessGrant } from '@/lib/video-access'
import { getVideoStorageExtension } from '@/lib/video'

export const runtime = 'nodejs'

const BUCKET = 'event-videos'

function failure(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function DELETE(
  _request: Request,
  context: RouteContext<'/api/videos/[id]'>
) {
  const { id } = await context.params

  if (!id) return failure(400, 'Video ID is required.')

  try {
    const supabase = createAdminSupabaseClient()
    const { data: video, error: videoError } = await supabase.from('event_videos')
      .select('id, event_id, uploader_session_id, type, status, storage_path')
      .eq('id', id)
      .maybeSingle()

    if (videoError) throw videoError
    if (!video) return failure(404, 'Video not found.')

    const token = (await cookies()).get(VIDEO_ACCESS_COOKIE_NAME)?.value
    const grant = verifyVideoAccessGrant(token, video.event_id)
    if (!grant || grant.eventId !== video.event_id) {
      return failure(403, 'Video access is invalid or expired.')
    }

    if (video.type !== 'video_message' || video.status !== 'ready') {
      return failure(409, 'Video cannot be deleted.')
    }

    const { data: event, error: eventError } = await supabase.from('events')
      .select('allow_guest_delete, video_messages_enabled')
      .eq('id', video.event_id)
      .maybeSingle()
    if (eventError) throw eventError
    if (event?.video_messages_enabled === false) {
      return failure(403, 'Video messages are disabled for this event.')
    }

    const canDelete =
      event?.allow_guest_delete === true ||
      video.uploader_session_id === grant.uploaderSessionId

    if (!canDelete) {
      return failure(403, 'Deleting videos is disabled for this event.')
    }

    const prefix = `${grant.eventId}/${video.id}/original`
    const extension = getVideoStorageExtension(video.storage_path, prefix)
    if (!extension) return failure(422, 'Invalid video storage path.')

    const storagePath = `${prefix}.${extension}`
    const { error: removeError } = await supabase.storage.from(BUCKET).remove([storagePath])
    if (removeError && String(removeError.statusCode) !== '404') throw removeError

    const { error: deleteError } = await supabase.from('event_videos')
      .delete()
      .eq('id', video.id)
      .eq('event_id', grant.eventId)
      .eq('type', 'video_message')
      .eq('status', 'ready')
      .eq('storage_path', storagePath)

    if (deleteError) throw deleteError

    return NextResponse.json({ ok: true, videoId: video.id }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    console.error('Ready video deletion failed')
    return failure(500, 'Video could not be deleted.')
  }
}
