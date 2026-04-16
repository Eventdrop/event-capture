import { NextResponse } from 'next/server'
import { hasAdminSession } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { buildStoragePath } from '@/lib/eventdrop'

export const runtime = 'nodejs'

const BUCKET_NAME = 'event-uploads'

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

    if (kind !== 'cover' && kind !== 'background') {
      return NextResponse.json(
        { ok: false, error: 'Het type moet omslag of achtergrond zijn.' },
        { status: 400 }
      )
    }

    const { fileName } = buildStoragePath(file)
    const storagePath = `event-branding/${eventId}/${kind}-${fileName}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const supabase = createAdminSupabaseClient()

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })

    if (error) {
      throw error
    }

    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`

    await supabase
      .from('events')
      .update(
        kind === 'cover'
          ? { cover_image_url: url }
          : { background_image_url: url }
      )
      .eq('id', eventId)

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
