import { NextResponse } from 'next/server'
import { hasAdminSession } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { buildEventInsertPayload } from '@/lib/events'

export const runtime = 'nodejs'

async function ensureAdmin() {
  const authenticated = await hasAdminSession()

  if (!authenticated) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Unauthorized.',
      },
      { status: 401 }
    )
  }

  return null
}

export async function GET() {
  const unauthorized = await ensureAdmin()
  if (unauthorized) return unauthorized

  try {
    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) throw error

    return NextResponse.json({ ok: true, events: data || [] })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load events.',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdmin()
  if (unauthorized) return unauthorized

  const body = (await request.json().catch(() => null)) as
    | {
        name?: string
        albumName?: string
        eventDate?: string
        accessCode?: string
        coverImageUrl?: string
        backgroundImageUrl?: string
      }
    | null

  const name = body?.name?.trim() || ''
  const albumName = body?.albumName?.trim() || ''
  const eventDate = body?.eventDate || ''
  const accessCode = body?.accessCode?.trim() || ''
  const coverImageUrl = body?.coverImageUrl?.trim() || ''
  const backgroundImageUrl = body?.backgroundImageUrl?.trim() || ''

  if (!name || !albumName) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Event name and album name are required.',
      },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminSupabaseClient()
    const payload = buildEventInsertPayload({
      name,
      albumName,
      eventDate,
      accessCode,
      coverImageUrl,
      backgroundImageUrl,
    })

    const richInsert = await supabase.from('events').insert([payload]).select('*').single()

    let createdRecord = richInsert.data

    if (richInsert.error) {
      const withoutAccessCode = {
        name: payload.name,
        album_name: payload.album_name,
        slug: payload.slug,
        event_date: payload.event_date,
        cover_image_url: payload.cover_image_url,
        background_image_url: payload.background_image_url,
        expires_at: payload.expires_at,
      }

      const fallbackInsert = await supabase
        .from('events')
        .insert([withoutAccessCode])
        .select('*')
        .single()

      if (!fallbackInsert.error) {
        createdRecord = fallbackInsert.data
      } else {
        const minimalInsert = await supabase
          .from('events')
          .insert([{ name: `${name} - ${albumName}` }])
          .select('*')
          .single()

        if (minimalInsert.error) throw minimalInsert.error
        createdRecord = minimalInsert.data
      }
    }

    return NextResponse.json({ ok: true, event: createdRecord })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to create event.',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await ensureAdmin()
  if (unauthorized) return unauthorized

  const body = (await request.json().catch(() => null)) as { id?: string } | null
  const id = body?.id || ''

  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Event id is required.',
      },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminSupabaseClient()
    const { error } = await supabase.from('events').delete().eq('id', id)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to delete event.',
      },
      { status: 500 }
    )
  }
}
