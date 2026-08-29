import { NextResponse } from 'next/server'
import { logOperation } from '@/lib/ops-log'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

const BUCKET_NAME = 'event-uploads'

type StorageBrandingFile = {
  created_at?: string | null
  name: string
  updated_at?: string | null
}

function buildPublicUrl(storagePath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing.')
  }

  return `${baseUrl}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`
}

function parseBrandingTimestamp(name: string, prefix: string) {
  const match = name.match(
    new RegExp(`^${prefix}(\\d{2})-(\\d{2})-(\\d{4})-(\\d{2})-(\\d{2})-(\\d{2})-`)
  )

  if (!match) return 0

  const [, day, month, year, hour, minute, second] = match
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  ).getTime()
}

function getBrandingFileTimestamp(file: StorageBrandingFile, prefix: string) {
  const updatedAt = file.updated_at ? new Date(file.updated_at).getTime() : 0
  const createdAt = file.created_at ? new Date(file.created_at).getTime() : 0

  return Math.max(
    Number.isFinite(updatedAt) ? updatedAt : 0,
    Number.isFinite(createdAt) ? createdAt : 0,
    parseBrandingTimestamp(file.name, prefix)
  )
}

function findNewestBrandingFile(
  files: StorageBrandingFile[] | null | undefined,
  prefix: string
) {
  return (files || [])
    .filter((file) => file.name.startsWith(prefix))
    .sort((left, right) => {
      const timestampDelta =
        getBrandingFileTimestamp(right, prefix) -
        getBrandingFileTimestamp(left, prefix)

      return timestampDelta || right.name.localeCompare(left.name)
    })[0]
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
    const posterTemplateFromRow = `${event.poster_template_url || ''}`.trim()
    const storyTemplateFromRow = `${event.story_template_url || ''}`.trim()

    if (coverFromRow && backgroundFromRow && posterTemplateFromRow && storyTemplateFromRow) {
      return NextResponse.json({
        ok: true,
        coverImageUrl: coverFromRow,
        backgroundImageUrl: backgroundFromRow,
        posterTemplateUrl: posterTemplateFromRow,
        storyTemplateUrl: storyTemplateFromRow,
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

    const latestCover = findNewestBrandingFile(files, 'cover-')
    const latestBackground = findNewestBrandingFile(files, 'background-')
    const latestPosterTemplate = findNewestBrandingFile(files, 'posterTemplate-')
    const latestStoryTemplate = findNewestBrandingFile(files, 'storyTemplate-')

    return NextResponse.json({
      ok: true,
      coverImageUrl: coverFromRow || (latestCover
        ? buildPublicUrl(`event-branding/${event.id}/${latestCover.name}`)
        : ''),
      backgroundImageUrl: backgroundFromRow || (latestBackground
        ? buildPublicUrl(`event-branding/${event.id}/${latestBackground.name}`)
        : ''),
      posterTemplateUrl: posterTemplateFromRow || (latestPosterTemplate
        ? buildPublicUrl(`event-branding/${event.id}/${latestPosterTemplate.name}`)
        : ''),
      storyTemplateUrl: storyTemplateFromRow || (latestStoryTemplate
        ? buildPublicUrl(`event-branding/${event.id}/${latestStoryTemplate.name}`)
        : ''),
    })
  } catch (error) {
    logOperation('error', 'public-branding', 'Failed to resolve event branding', {
      error: error instanceof Error ? error.message : 'Unknown error',
      identifier,
    })
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
