import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { hasAdminSession } from '@/lib/admin-auth'
import {
  EVENT_ACCESS_COOKIE_NAME,
  hasEventAccess,
} from '@/lib/event-access'
import { getStoragePathFromUpload } from '@/lib/eventdrop'
import { normalizeEventRecord } from '@/lib/events'
import { logOperation } from '@/lib/ops-log'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function DELETE(
  _request: Request,
  context: RouteContext<'/api/uploads/[id]'>
) {
  const { id } = await context.params

  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Een upload ID is verplicht.',
      },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminSupabaseClient()
    const { data: upload, error: uploadError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', id)
      .single()

    if (uploadError) throw uploadError
    if (!upload) {
      return NextResponse.json(
        {
          ok: false,
          error: 'De upload is niet gevonden.',
        },
        { status: 404 }
      )
    }

    const adminAllowed = await hasAdminSession()

    if (!adminAllowed) {
      const eventId = `${upload.event_id || ''}`.trim()

      if (!eventId) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Geen toegang.',
          },
          { status: 401 }
        )
      }

      const { data: eventRecord, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (eventError) throw eventError

      const event = normalizeEventRecord(eventRecord)
      const cookieStore = await cookies()
      const accessCookie = cookieStore.get(EVENT_ACCESS_COOKIE_NAME)?.value

      if (!event || !hasEventAccess(accessCookie, event.slug || event.id)) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Geen toegang.',
          },
          { status: 401 }
        )
      }

      if (event.allowGuestDelete !== true) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Verwijderen is voor dit album uitgeschakeld.',
          },
          { status: 403 }
        )
      }
    }

    const storagePath = getStoragePathFromUpload(upload)

    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from('event-uploads')
        .remove([storagePath])

      if (storageError) throw storageError
    }

    const { error: deleteError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({ ok: true })
  } catch (error) {
    logOperation('error', 'uploads-delete', 'Failed to delete upload', {
      error: error instanceof Error ? error.message : 'Unknown error',
      uploadId: id,
    })
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'De upload kon niet worden verwijderd.',
      },
      { status: 500 }
    )
  }
}
