import { NextResponse } from 'next/server'
import { hasAdminSession } from '@/lib/admin-auth'
import { getStoragePathFromUpload, type UploadRecord } from '@/lib/eventdrop'
import { logOperation } from '@/lib/ops-log'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { buildEventInsertPayload, cleanRepeatedEventLabel } from '@/lib/events'
import { normalizeGuestbookPdfTheme } from '@/lib/guestbook-pdf-theme'
import type { Locale } from '@/lib/i18n'
import { withRetry } from '@/lib/with-retry'

export const runtime = 'nodejs'

type AdminGuestMessage = {
  id?: string | null
  guest_name?: string | null
  message: string
  file_name: string | null
  related_upload_id?: string | null
  created_at: string | null
  source?: 'guestbook' | 'upload'
}

function sortGuestMessages(messages: AdminGuestMessage[]) {
  return [...messages].sort((left, right) => {
    const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0
    const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0

    return rightTime - leftTime
  })
}

function appendGuestMessage(
  messagesByEvent: Record<string, AdminGuestMessage[]>,
  eventId: string,
  message: AdminGuestMessage
) {
  messagesByEvent[eventId] = sortGuestMessages([
    ...(messagesByEvent[eventId] || []),
    message,
  ])
}

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
    let guestMessagesByEvent: Record<string, AdminGuestMessage[]> = {}
    let downloadStatsByEvent: Record<
      string,
      { downloads: number; files: number; posters: number; stories: number; lastEmail: string | null; lastDownloadedAt: string | null }
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

      try {
        const guestMessagesQuery = await withRetry(
          () =>
            supabase
              .from('uploads')
              .select('*')
              .in('event_id', eventIds)
              .order('created_at', { ascending: false })
              .limit(1000),
          {
            attempts: 3,
            delayMs: 250,
          }
        )

        if (!guestMessagesQuery.error) {
          guestMessagesByEvent = ((guestMessagesQuery.data || []) as Array<{
            event_id?: string | null
            file_name?: string | null
            guest_message?: string | null
            id?: string | null
            created_at?: string | null
          }>).reduce<typeof guestMessagesByEvent>((accumulator, item) => {
            const eventId = item.event_id || ''
            const message = (item.guest_message || '').trim()

            if (!eventId || !message) {
              return accumulator
            }

            appendGuestMessage(accumulator, eventId, {
              id: item.id || null,
              message,
              file_name: item.file_name || null,
              created_at: item.created_at || null,
              source: 'upload',
            })

            return accumulator
          }, {})
        }
      } catch (guestMessagesError) {
        logOperation('warn', 'admin-events', 'Failed to load guest messages', {
          error: guestMessagesError instanceof Error ? guestMessagesError.message : 'Unknown error',
        })
      }

      try {
        const standaloneMessagesQuery = await withRetry(
          () =>
            supabase
              .from('guestbook_messages')
              .select('id,event_id,guest_name,message,related_upload_id,created_at')
              .in('event_id', eventIds)
              .order('created_at', { ascending: false })
              .limit(1000),
          {
            attempts: 3,
            delayMs: 250,
          }
        )

        if (!standaloneMessagesQuery.error) {
          ((standaloneMessagesQuery.data || []) as Array<{
            event_id?: string | null
            guest_name?: string | null
            id?: string | null
            message?: string | null
            related_upload_id?: string | null
            created_at?: string | null
          }>).forEach((item) => {
            const eventId = item.event_id || ''
            const message = (item.message || '').trim()

            if (!eventId || !message) return

            appendGuestMessage(guestMessagesByEvent, eventId, {
              guest_name: item.guest_name || null,
              id: item.id || null,
              message,
              file_name: null,
              related_upload_id: item.related_upload_id || null,
              created_at: item.created_at || null,
              source: 'guestbook',
            })
          })
        }
      } catch (standaloneMessagesError) {
        logOperation('warn', 'admin-events', 'Failed to load standalone guestbook messages', {
          error:
            standaloneMessagesError instanceof Error
              ? standaloneMessagesError.message
              : 'Unknown error',
        })
      }


      try {
        const downloadLogsQuery = await withRetry(
          () =>
            supabase
              .from('download_logs')
              .select('event_id,email,download_type,item_count,created_at')
              .in('event_id', eventIds)
              .order('created_at', { ascending: false })
              .limit(5000),
          {
            attempts: 2,
            delayMs: 200,
          }
        )

        if (!downloadLogsQuery.error) {
          downloadStatsByEvent = ((downloadLogsQuery.data || []) as Array<{
            event_id?: string | null
            email?: string | null
            item_count?: number | null
            download_type?: string | null
            created_at?: string | null
          }>).reduce<typeof downloadStatsByEvent>((accumulator, item) => {
            const eventId = item.event_id || ''
            if (!eventId) return accumulator

            const current = accumulator[eventId] || {
              downloads: 0,
              files: 0,
              posters: 0,
              stories: 0,
              lastEmail: null,
              lastDownloadedAt: null,
            }
            if (item.download_type === 'poster') {
              current.posters += 1
            } else if (item.download_type === 'story') {
              current.stories += 1
            } else {
              current.downloads += 1
              current.files += Number(item.item_count || 0)
            }
            if (!current.lastDownloadedAt) {
              current.lastEmail = item.email || null
              current.lastDownloadedAt = item.created_at || null
            }
            accumulator[eventId] = current
            return accumulator
          }, {})
        }
      } catch (downloadStatsError) {
        logOperation('warn', 'admin-events', 'Failed to load download stats', {
          error: downloadStatsError instanceof Error ? downloadStatsError.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      ok: true,
      events,
      guestAccessByEvent,
      guestMessagesByEvent,
      downloadStatsByEvent,
    })
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
        defaultLocale?: Locale
        accessCode?: string
        accessCodeEnabled?: boolean
        isDemoTemplate?: boolean
        coverImageUrl?: string
        guestbookCoverImageUrl?: string | null
        backgroundImageUrl?: string
        posterTemplateUrl?: string
        storyTemplateUrl?: string
        allowGuestShare?: boolean
        allowGuestDownload?: boolean
        allowAlbumDownload?: boolean
        allowGuestDelete?: boolean
        allowGuestPoster?: boolean
        guestbookEnabled?: boolean
        photostripEnabled?: boolean
        photostripBackgroundUrl?: string | null
        guestbookPdfTheme?: string
      }
    | null

  const name = body?.name?.trim() || ''
  const albumName = body?.albumName?.trim() || ''
  const eventDate = body?.eventDate || ''
  const defaultLocale = body?.defaultLocale || 'nl'
  const accessCode = body?.accessCode?.trim() || ''
  const accessCodeEnabled = body?.accessCodeEnabled !== false
  const isDemoTemplate = body?.isDemoTemplate === true
  const coverImageUrl = body?.coverImageUrl?.trim() || ''
  const guestbookCoverImageUrl = body?.guestbookCoverImageUrl?.trim() || ''
  const backgroundImageUrl = body?.backgroundImageUrl?.trim() || ''
  const posterTemplateUrl = body?.posterTemplateUrl?.trim() || ''
  const storyTemplateUrl = body?.storyTemplateUrl?.trim() || ''
  const allowGuestShare = body?.allowGuestShare !== false
  const allowGuestDownload = body?.allowGuestDownload !== false
  const allowAlbumDownload = body?.allowAlbumDownload !== false
  const allowGuestDelete = body?.allowGuestDelete === true
  const allowGuestPoster = body?.allowGuestPoster === true
  const guestbookEnabled = body?.guestbookEnabled !== false
  const photostripEnabled = body?.photostripEnabled === true
  const photostripBackgroundUrl = body?.photostripBackgroundUrl?.trim() || ''
  const guestbookPdfTheme = normalizeGuestbookPdfTheme(body?.guestbookPdfTheme)

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
      defaultLocale,
      accessCode,
      accessCodeEnabled,
      isDemoTemplate,
      coverImageUrl,
      guestbookCoverImageUrl,
      backgroundImageUrl,
      posterTemplateUrl,
      storyTemplateUrl,
      allowGuestShare,
      allowGuestDownload,
      allowAlbumDownload,
      allowGuestDelete,
      allowGuestPoster,
      guestbookEnabled,
      photostripEnabled,
      photostripBackgroundUrl,
      guestbookPdfTheme,
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
      if (isDemoTemplate) {
        throw new Error(
          'Supabase mist nog is_demo_template. Run eerst de demo template SQL migration.'
        )
      }

      const posterTemplatePayload =
        'poster_template_url' in payload ? payload.poster_template_url : null
      const storyTemplatePayload =
        'story_template_url' in payload ? payload.story_template_url : null
      const withoutAccessCode = {
        name: payload.name,
        album_name: payload.album_name,
        slug: payload.slug,
        event_date: payload.event_date,
        cover_image_url: payload.cover_image_url,
        background_image_url: payload.background_image_url,
        ...(posterTemplatePayload ? { poster_template_url: posterTemplatePayload } : {}),
        ...(storyTemplatePayload ? { story_template_url: storyTemplatePayload } : {}),
        allow_guest_share: payload.allow_guest_share,
        allow_guest_download: payload.allow_guest_download,
        allow_album_download: payload.allow_album_download,
        allow_guest_delete: payload.allow_guest_delete,
        allow_guest_poster: payload.allow_guest_poster,
        photostrip_enabled: payload.photostrip_enabled,
        photostrip_background_url: payload.photostrip_background_url,
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

    if (!createdRecord?.id) {
      throw new Error('Supabase heeft geen nieuw event teruggegeven.')
    }

    if (isDemoTemplate && createdRecord.is_demo_template !== true) {
      throw new Error('Master Demo is aangemaakt zonder is_demo_template=true.')
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
        eventDate?: string | null
        allowGuestShare?: boolean
        allowGuestDownload?: boolean
        allowAlbumDownload?: boolean
        allowGuestDelete?: boolean
        allowGuestPoster?: boolean
        guestbookEnabled?: boolean
        photostripEnabled?: boolean
        guestbookPdfTheme?: string
        guestbookCoverImageUrl?: string | null
        photostripBackgroundUrl?: string | null
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
    const updatePayload: Record<string, string | boolean | null> = {
      allow_guest_share: body?.allowGuestShare !== false,
      allow_guest_download: body?.allowGuestDownload !== false,
      allow_album_download: body?.allowAlbumDownload !== false,
      allow_guest_delete: body?.allowGuestDelete === true,
      allow_guest_poster: body?.allowGuestPoster === true,
      guestbook_enabled: body?.guestbookEnabled !== false,
      photostrip_enabled: body?.photostripEnabled === true,
      guestbook_pdf_theme: normalizeGuestbookPdfTheme(body?.guestbookPdfTheme),
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
      updatePayload.name = cleanRepeatedEventLabel(name)
    }

    if (albumName !== undefined) {
      if (!albumName) {
        return NextResponse.json(
          { ok: false, error: 'Vul een albumnaam in.' },
          { status: 400 }
        )
      }
      updatePayload.album_name = cleanRepeatedEventLabel(albumName)
    }

    if (body && 'eventDate' in body) {
      updatePayload.event_date = body.eventDate?.trim() || null
    }

    if (body && 'guestbookCoverImageUrl' in body) {
      updatePayload.guestbook_cover_image_url = body.guestbookCoverImageUrl?.trim() || null
    }

    if (body && 'photostripBackgroundUrl' in body) {
      updatePayload.photostrip_background_url = body.photostripBackgroundUrl?.trim() || null
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
      message.includes('allow_guest_delete') ||
      message.includes('guestbook_enabled') ||
      message.includes('photostrip_enabled') ||
      message.includes('photostrip_background_url') ||
      message.includes('guestbook_pdf_theme') ||
      message.includes('guestbook_cover_image_url') ||
      message.includes('event_date')
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
