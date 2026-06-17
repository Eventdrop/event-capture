import { NextResponse } from 'next/server'
import { hasAdminSession } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { buildStoragePath } from '@/lib/eventdrop'
import { withRetry } from '@/lib/with-retry'

export const runtime = 'nodejs'

const BUCKET_NAME = 'event-uploads'
const eventVisualColumns = {
  cover: 'cover_image_url',
  background: 'background_image_url',
  posterTemplate: 'poster_template_url',
  storyTemplate: 'story_template_url',
} as const

type EventVisualKind = keyof typeof eventVisualColumns

function isEventVisualKind(value: string): value is EventVisualKind {
  return value in eventVisualColumns
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
        { ok: false, error: 'Het type moet omslag, achtergrond, A3-sjabloon of Story-sjabloon zijn.' },
        { status: 400 }
      )
    }

    const { fileName } = buildStoragePath(file)
    const storagePath = `event-branding/${eventId}/${kind}-${fileName}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const supabase = createAdminSupabaseClient()

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
