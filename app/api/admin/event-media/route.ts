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

    const { error: updateError } = await supabase
      .from('events')
      .update({ [eventVisualColumns[kind]]: url })
      .eq('id', eventId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ ok: true, url, storagePath })
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
