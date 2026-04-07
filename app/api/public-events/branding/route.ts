import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

const BUCKET_NAME = 'event-uploads'

function buildPublicUrl(storagePath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing.')
  }

  return `${baseUrl}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const identifier = searchParams.get('identifier')?.trim() || ''

  if (!identifier) {
    return NextResponse.json(
      { ok: false, error: 'Event identifier is required.' },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminSupabaseClient()

    const idLookup = await supabase
      .from('events')
      .select('*')
      .eq('id', identifier)
      .single()

    const slugLookup =
      idLookup.error && !idLookup.data
        ? await supabase
            .from('events')
            .select('*')
            .eq('slug', identifier)
            .single()
        : null

    const event = idLookup.data || slugLookup?.data || null

    if (!event?.id) {
      return NextResponse.json(
        { ok: false, error: 'Event not found.' },
        { status: 404 }
      )
    }

    const coverFromRow = `${event.cover_image_url || ''}`.trim()
    const backgroundFromRow = `${event.background_image_url || ''}`.trim()

    if (coverFromRow || backgroundFromRow) {
      return NextResponse.json({
        ok: true,
        coverImageUrl: coverFromRow,
        backgroundImageUrl: backgroundFromRow,
      })
    }

    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`event-branding/${event.id}`, {
        limit: 50,
        sortBy: { column: 'name', order: 'desc' },
      })

    if (error) {
      throw error
    }

    const latestCover = files?.find((file) => file.name.startsWith('cover-'))
    const latestBackground = files?.find((file) =>
      file.name.startsWith('background-')
    )

    return NextResponse.json({
      ok: true,
      coverImageUrl: latestCover
        ? buildPublicUrl(`event-branding/${event.id}/${latestCover.name}`)
        : '',
      backgroundImageUrl: latestBackground
        ? buildPublicUrl(`event-branding/${event.id}/${latestBackground.name}`)
        : '',
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to resolve event branding.',
      },
      { status: 500 }
    )
  }
}
