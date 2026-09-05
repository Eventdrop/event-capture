import { NextResponse } from 'next/server'

import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const liveToken = id?.trim() || ''

  const isValidLiveToken =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      liveToken
    )

  if (!isValidLiveToken) {
    return NextResponse.json(
      { ok: false, error: 'Live uitzending niet gevonden.' },
      { status: 404 }
    )
  }

  const supabase = createAdminSupabaseClient()

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, name, album_name')
    .eq('live_token', liveToken)
    .eq('live_enabled', true)
    .maybeSingle()

  if (eventError) {
    console.error('Live event lookup failed', eventError)
    return NextResponse.json(
      { ok: false, error: 'Live event kon niet worden geladen.' },
      { status: 500 }
    )
  }

  if (!event?.id) {
    return NextResponse.json(
      { ok: false, error: 'Event niet gevonden.' },
      { status: 404 }
    )
  }

  const { data: uploads, error: uploadsError } = await supabase
    .from('uploads')
    .select('id, file_url, created_at')
    .eq('event_id', event.id)
    .order('created_at', { ascending: true })

  if (uploadsError) {
    console.error('Live uploads lookup failed', uploadsError)
    return NextResponse.json(
      { ok: false, error: 'Foto’s konden niet worden geladen.' },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      ok: true,
      event: {
        id: event.id,
        name: event.album_name || event.name || 'EventDrop Live',
      },
      photos: (uploads || []).filter((upload) => Boolean(upload.file_url)),
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  )
}
