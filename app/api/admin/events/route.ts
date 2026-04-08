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
      .limit(50)

    if (error) throw error
    const events = data || []
    const eventIds = events.map((event) => event.id).filter(Boolean)
    let guestAccessByEvent: Record<
      string,
      { email: string; created_at: string | null }[]
    > = {}

    if (eventIds.length > 0) {
      try {
        const guestAccessQuery = await supabase
          .from('guest_access_logs')
          .select('event_id,email,created_at')
          .in('event_id', eventIds)
          .order('created_at', { ascending: false })
          .limit(200)

        if (!guestAccessQuery.error) {
          guestAccessByEvent = ((guestAccessQuery.data || []) as Array<{
            event_id?: string | null
            email?: string | null
            created_at?: string | null
          }>).reduce<Record<string, { email: string; created_at: string | null }[]>>(
            (accumulator, item) => {
              const eventId = item.event_id || ''
              const email = item.email || ''

              if (!eventId || !email) {
                return accumulator
              }

              const current = accumulator[eventId] || []
              const alreadyListed = current.some(
                (entry) => entry.email.toLowerCase() === email.toLowerCase()
              )

              if (alreadyListed || current.length >= 5) {
                return accumulator
              }

              accumulator[eventId] = [
                ...current,
                {
                  email,
                  created_at: item.created_at || null,
                },
              ]

              return accumulator
            },
            {}
          )
        }
      } catch (guestAccessError) {
        console.error('Failed to load guest access logs', guestAccessError)
      }
    }

    return NextResponse.json({ ok: true, events, guestAccessByEvent })
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
      accessCodeEnabled?: boolean
      coverImageUrl?: string
      backgroundImageUrl?: string
      allowGuestShare?: boolean
      allowGuestDownload?: boolean
      allowGuestDelete?: boolean
      }
    | null

  const name = body?.name?.trim() || ''
  const albumName = body?.albumName?.trim() || ''
  const eventDate = body?.eventDate || ''
  const accessCode = body?.accessCode?.trim() || ''
  const accessCodeEnabled = body?.accessCodeEnabled !== false
  const coverImageUrl = body?.coverImageUrl?.trim() || ''
  const backgroundImageUrl = body?.backgroundImageUrl?.trim() || ''
  const allowGuestShare = body?.allowGuestShare !== false
  const allowGuestDownload = body?.allowGuestDownload !== false
  const allowGuestDelete = body?.allowGuestDelete === true

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
      accessCodeEnabled,
      coverImageUrl,
      backgroundImageUrl,
      allowGuestShare,
      allowGuestDownload,
      allowGuestDelete,
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
        allow_guest_share: payload.allow_guest_share,
        allow_guest_download: payload.allow_guest_download,
        allow_guest_delete: payload.allow_guest_delete,
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

export async function PATCH(request: Request) {
  const unauthorized = await ensureAdmin()
  if (unauthorized) return unauthorized

  const body = (await request.json().catch(() => null)) as
    | {
        id?: string
        allowGuestShare?: boolean
        allowGuestDownload?: boolean
        allowGuestDelete?: boolean
      }
    | null

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
    const richUpdate = await supabase
      .from('events')
      .update({
        allow_guest_share: body?.allowGuestShare !== false,
        allow_guest_download: body?.allowGuestDownload !== false,
        allow_guest_delete: body?.allowGuestDelete === true,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (!richUpdate.error) {
      return NextResponse.json({ ok: true, event: richUpdate.data })
    }

    const message = richUpdate.error.message.toLowerCase()
    const canFallback =
      message.includes('column') ||
      message.includes('schema cache') ||
      message.includes('could not find')

    if (!canFallback) {
      throw richUpdate.error
    }

    const fallbackRecord = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (fallbackRecord.error) throw fallbackRecord.error

    return NextResponse.json({ ok: true, event: fallbackRecord.data, legacy: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to update event settings.',
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
