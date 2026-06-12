import { NextResponse } from 'next/server'
import { hasAdminSession } from '@/lib/admin-auth'
import { getStoragePathFromUpload, type UploadRecord } from '@/lib/eventdrop'
import { logOperation } from '@/lib/ops-log'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { buildEventInsertPayload } from '@/lib/events'
import { withRetry } from '@/lib/with-retry'

export const runtime = 'nodejs'

async function ensureAdmin() {
  const authenticated = await hasAdminSession()

  if (!authenticated) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Geen toegang.',
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
    const { data, error } = await withRetry(
      () =>
        supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
      {
        attempts: 3,
        delayMs: 250,
      }
    )

    if (error) throw error
    const events = data || []
    const eventIds = events.map((event) => event.id).filter(Boolean)
    let guestAccessByEvent: Record<
      string,
      { email: string; created_at: string | null }[]
    > = {}

    if (eventIds.length > 0) {
      try {
        const guestAccessQuery = await withRetry(
          () =>
            supabase
              .from('guest_access_logs')
              .select('event_id,email,created_at')
              .in('event_id', eventIds)
              .order('created_at', { ascending: false })
              .limit(1000),
          {
            attempts: 3,
            delayMs: 250,
          }
        )

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

              if (alreadyListed) {
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
        logOperation('warn', 'admin-events', 'Failed to load guest access logs', {
          error: guestAccessError instanceof Error ? guestAccessError.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({ ok: true, events, guestAccessByEvent })
  } catch (error) {
    logOperation('error', 'admin-events', 'Failed to load events', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'De evenementen konden niet worden geladen.',
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
      allowAlbumDownload?: boolean
      allowGuestDelete?: boolean
      allowGuestPoster?: boolean
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
  const allowAlbumDownload = body?.allowAlbumDownload !== false
  const allowGuestDelete = body?.allowGuestDelete === true
  const allowGuestPoster = body?.allowGuestPoster === true

  if (!name || !albumName) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Vul een evenementnaam en albumnaam in.',
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
      allowAlbumDownload,
      allowGuestDelete,
      allowGuestPoster,
    })

    const richInsert = await withRetry(
      () => supabase.from('events').insert([payload]).select('*').single(),
      {
        attempts: 3,
        delayMs: 250,
      }
    )

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
        allow_guest_poster: payload.allow_guest_poster,
        expires_at: payload.expires_at,
      }

      const fallbackInsert = await withRetry(
        () =>
          supabase.from('events').insert([withoutAccessCode]).select('*').single(),
        {
          attempts: 3,
          delayMs: 250,
        }
      )

      if (!fallbackInsert.error) {
        createdRecord = fallbackInsert.data
      } else {
        const minimalInsert = await withRetry(
          () =>
            supabase
              .from('events')
              .insert([{ name: `${name} - ${albumName}` }])
              .select('*')
              .single(),
          {
            attempts: 3,
            delayMs: 250,
          }
        )

        if (minimalInsert.error) throw minimalInsert.error
        createdRecord = minimalInsert.data
      }
    }

    return NextResponse.json({ ok: true, event: createdRecord })
  } catch (error) {
    logOperation('error', 'admin-events', 'Failed to create event', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Het evenement kon niet worden aangemaakt.',
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
        name?: string
        albumName?: string
        allowGuestShare?: boolean
        allowGuestDownload?: boolean
        allowAlbumDownload?: boolean
        allowGuestDelete?: boolean
        allowGuestPoster?: boolean
      }
    | null

  const id = body?.id || ''

  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Een evenement ID is verplicht.',
      },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminSupabaseClient()
    const updatePayload: Record<string, string | boolean> = {
      allow_guest_share: body?.allowGuestShare !== false,
      allow_guest_download: body?.allowGuestDownload !== false,
      allow_album_download: body?.allowAlbumDownload !== false,
      allow_guest_delete: body?.allowGuestDelete === true,
      allow_guest_poster: body?.allowGuestPoster === true,
    }
    const name = body?.name?.trim()
    const albumName = body?.albumName?.trim()

    if (name !== undefined) {
      if (!name) {
        return NextResponse.json(
          { ok: false, error: 'Vul een evenementnaam in.' },
          { status: 400 }
        )
      }
      updatePayload.name = name
    }

    if (albumName !== undefined) {
      if (!albumName) {
        return NextResponse.json(
          { ok: false, error: 'Vul een albumnaam in.' },
          { status: 400 }
        )
      }
      updatePayload.album_name = albumName
    }

    const richUpdate = await withRetry(
      () =>
        supabase
          .from('events')
          .update(updatePayload)
          .eq('id', id)
          .select('*')
          .single(),
      {
        attempts: 3,
        delayMs: 250,
      }
    )

    if (!richUpdate.error) {
      return NextResponse.json({ ok: true, event: richUpdate.data })
    }

    const message = richUpdate.error.message.toLowerCase()
    if (
      message.includes('allow_guest_poster') ||
      message.includes('allow_album_download') ||
      message.includes('allow_guest_share') ||
      message.includes('allow_guest_download') ||
      message.includes('allow_guest_delete')
    ) {
      throw new Error(
        'Supabase mist nog een instellingen-kolom. Run eerst de nieuwste SQL in de juiste Supabase projectdatabase.'
      )
    }

    const canFallback =
      message.includes('column') ||
      message.includes('schema cache') ||
      message.includes('could not find')

    if (!canFallback) {
      throw richUpdate.error
    }

    const fallbackRecord = await withRetry(
      () => supabase.from('events').select('*').eq('id', id).single(),
      {
        attempts: 3,
        delayMs: 250,
      }
    )

    if (fallbackRecord.error) throw fallbackRecord.error

    return NextResponse.json({ ok: true, event: fallbackRecord.data, legacy: true })
  } catch (error) {
    logOperation('error', 'admin-events', 'Failed to update event controls', {
      error: error instanceof Error ? error.message : 'Unknown error',
      eventId: id,
    })
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'De instellingen van het evenement konden niet worden bijgewerkt.',
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
        error: 'Een evenement ID is verplicht.',
      },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminSupabaseClient()
    const uploadsLookup = await withRetry(
      () => supabase.from('uploads').select('*').eq('event_id', id),
      {
        attempts: 3,
        delayMs: 250,
      }
    )

    if (uploadsLookup.error) throw uploadsLookup.error

    const uploads = (uploadsLookup.data || []) as UploadRecord[]
    const storagePaths = uploads
      .map((upload) => getStoragePathFromUpload(upload))
      .filter((value): value is string => Boolean(value))

    if (storagePaths.length > 0) {
      const { error: storageError } = await withRetry(
        () => supabase.storage.from('event-uploads').remove(storagePaths),
        {
          attempts: 3,
          delayMs: 250,
        }
      )

      if (storageError) throw storageError
    }

    if (uploads.length > 0) {
      const uploadIds = uploads.map((upload) => upload.id)
      const { error: uploadsDeleteError } = await withRetry(
        () => supabase.from('uploads').delete().in('id', uploadIds),
        {
          attempts: 3,
          delayMs: 250,
        }
      )

      if (uploadsDeleteError) throw uploadsDeleteError
    }

    const { error } = await withRetry(
      () => supabase.from('events').delete().eq('id', id),
      {
        attempts: 3,
        delayMs: 250,
      }
    )

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    logOperation('error', 'admin-events', 'Failed to delete event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      eventId: id,
    })
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Het evenement kon niet worden verwijderd.',
      },
      { status: 500 }
    )
  }
}
