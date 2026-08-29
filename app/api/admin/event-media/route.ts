import { NextResponse } from 'next/server'
import { hasAdminSession } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { buildStoragePath } from '@/lib/eventdrop'
import { logOperation } from '@/lib/ops-log'
import { withRetry } from '@/lib/with-retry'

export const runtime = 'nodejs'

const BUCKET_NAME = 'event-uploads'
const eventVisualColumns = {
  cover: 'cover_image_url',
  guestbookCover: 'guestbook_cover_image_url',
  background: 'background_image_url',
  posterTemplate: 'poster_template_url',
  storyTemplate: 'story_template_url',
} as const

type EventVisualKind = keyof typeof eventVisualColumns

function isEventVisualKind(value: string): value is EventVisualKind {
  return value in eventVisualColumns
}

function shouldCleanupPreviousTemplate(kind: EventVisualKind) {
  return kind === 'posterTemplate' || kind === 'storyTemplate'
}

function getBrandingStoragePathFromUrl(url: string) {
  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`
  const index = url.indexOf(marker)

  if (index === -1) return null

  return decodeURIComponent(url.slice(index + marker.length))
}

function resolvePreviousTemplateStoragePath(input: {
  eventId: string
  kind: EventVisualKind
  newStoragePath: string
  previousUrl: string
}) {
  if (!shouldCleanupPreviousTemplate(input.kind)) return null

  const previousPath = getBrandingStoragePathFromUrl(input.previousUrl.trim())
  const expectedPrefix = `event-branding/${input.eventId}/${input.kind}-`

  if (!previousPath) return null
  if (previousPath === input.newStoragePath) return null
  if (!previousPath.startsWith(expectedPrefix)) return null

  return previousPath
}

export async function POST(request: Request) {
  const authenticated = await hasAdminSession()

  if (!authenticated) {
    return NextResponse.json({ ok: false, error: 'Geen toegang.' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const eventId = `${formData.get('eventId') || ''}`.trim()
    const kind = `${formData.get('kind') || ''}`.trim()

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'Een bestand is verplicht.' }, { status: 400 })
    }

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: 'Een evenement ID is verplicht.' },
        { status: 400 }
      )
    }

    if (!isEventVisualKind(kind)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Het type moet omslag, gastenboek-omslag, achtergrond, A3-sjabloon of Story-sjabloon zijn.',
        },
        { status: 400 }
      )
    }

    const { fileName } = buildStoragePath(file)
    const storagePath = `event-branding/${eventId}/${kind}-${fileName}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const supabase = createAdminSupabaseClient()
    let previousTemplateUrl = ''

    if (shouldCleanupPreviousTemplate(kind)) {
      const { data: currentEvent, error: currentEventError } = await supabase
        .from('events')
        .select(eventVisualColumns[kind])
        .eq('id', eventId)
        .maybeSingle()

      if (currentEventError) throw currentEventError

      const currentEventRow = currentEvent as Record<string, unknown> | null
      previousTemplateUrl = String(currentEventRow?.[eventVisualColumns[kind]] || '').trim()
    }

    const { error } = await withRetry(
      () =>
        supabase.storage.from(BUCKET_NAME).upload(storagePath, buffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || undefined,
        }),
      {
        attempts: 3,
        delayMs: 250,
      }
    )

    if (error) {
      throw error
    }

    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`

    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({ [eventVisualColumns[kind]]: url })
      .eq('id', eventId)
      .select('*')
      .single()

    if (updateError) {
      await supabase.storage.from(BUCKET_NAME).remove([storagePath]).catch(() => null)

      const message = updateError.message.toLowerCase()
      if (
        message.includes(eventVisualColumns[kind]) ||
        message.includes('column') ||
        message.includes('schema cache') ||
        message.includes('could not find')
      ) {
        throw new Error(
          `Supabase events tablosunda \`${eventVisualColumns[kind]}\` kolonu eksik veya schema cache yenilenmedi. SQL dosyasindaki kolonlari ekleyip tekrar dene.`
        )
      }

      throw updateError
    }

    const savedUrl = String(updatedEvent?.[eventVisualColumns[kind]] || '').trim()

    if (savedUrl !== url) {
      throw new Error('Gorsel yuklendi ama album kaydina baglanamadi. Lutfen tekrar dene.')
    }

    const previousTemplatePath = resolvePreviousTemplateStoragePath({
      eventId,
      kind,
      newStoragePath: storagePath,
      previousUrl: previousTemplateUrl,
    })

    if (previousTemplatePath) {
      const { error: cleanupError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([previousTemplatePath])

      if (cleanupError) {
        logOperation('warn', 'admin-event-media', 'Previous template cleanup failed', {
          error: cleanupError.message,
          eventId,
          kind,
          storagePath: previousTemplatePath,
        })
      }
    }

    return NextResponse.json({ ok: true, url, storagePath, event: updatedEvent })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'De afbeelding kon niet worden geüpload.',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const authenticated = await hasAdminSession()

  if (!authenticated) {
    return NextResponse.json({ ok: false, error: 'Geen toegang.' }, { status: 401 })
  }

  try {
    const body = (await request.json().catch(() => null)) as
      | {
          eventId?: string
          kind?: string
        }
      | null
    const eventId = `${body?.eventId || ''}`.trim()
    const kind = `${body?.kind || ''}`.trim()

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: 'Een evenement ID is verplicht.' },
        { status: 400 }
      )
    }

    if (!isEventVisualKind(kind)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Het type moet omslag, gastenboek-omslag, achtergrond, A3-sjabloon of Story-sjabloon zijn.',
        },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()
    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update({ [eventVisualColumns[kind]]: null })
      .eq('id', eventId)
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, event: updatedEvent })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'De afbeelding kon niet worden verwijderd.',
      },
      { status: 500 }
    )
  }
}
