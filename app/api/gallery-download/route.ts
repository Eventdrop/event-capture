import { NextResponse } from 'next/server'
import { hasAdminSession } from '@/lib/admin-auth'
import {
  getStoragePathFromUpload,
  getUploadShortFileName,
  type UploadRecord,
} from '@/lib/eventdrop'
import { normalizeEventRecord } from '@/lib/events'
import { logOperation } from '@/lib/ops-log'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { createZipStream, safeZipFileName, uniqueZipEntryName } from '@/lib/zip'

export const runtime = 'nodejs'

type DownloadRequestBody = {
  all?: boolean
  eventIdentifier?: string
  namesById?: Record<string, string>
  uploadIds?: string[]
}

const MAX_SELECTED_DOWNLOADS = 100
const MAX_ADMIN_ALBUM_DOWNLOADS = 500

function jsonError(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status })
}

async function downloadUploadBytes(upload: UploadRecord) {
  const storagePath = getStoragePathFromUpload(upload)

  if (!storagePath) {
    throw new Error('Uploadbestand kon niet worden gevonden.')
  }

  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase.storage
    .from('event-uploads')
    .download(storagePath)

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('Uploadbestand kon niet worden geladen.')
  }

  return new Uint8Array(await data.arrayBuffer())
}

function getZipName(eventName: string, selectedOnly: boolean) {
  const baseName = safeZipFileName(eventName || 'eventdrop-album', 'eventdrop-album')
  return `${baseName}${selectedOnly ? '-selectie' : ''}.zip`
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as DownloadRequestBody | null
    const eventIdentifier = body?.eventIdentifier?.trim() || ''
    const uploadIds = Array.isArray(body?.uploadIds)
      ? body.uploadIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : []
    const downloadAll = body?.all === true

    if (!eventIdentifier) {
      return jsonError('Een event ID is verplicht.', 400)
    }

    if (!downloadAll && uploadIds.length === 0) {
      return jsonError('Selecteer eerst minstens één item.', 400)
    }

    if (!downloadAll && uploadIds.length > MAX_SELECTED_DOWNLOADS) {
      return jsonError(
        `Je kunt maximaal ${MAX_SELECTED_DOWNLOADS} foto’s tegelijk downloaden.`,
        400
      )
    }

    const supabase = createAdminSupabaseClient()
    const idLookup = await supabase
      .from('events')
      .select('*')
      .eq('id', eventIdentifier)
      .maybeSingle()

    const slugLookup =
      !idLookup.data
        ? await supabase
            .from('events')
            .select('*')
            .eq('slug', eventIdentifier)
            .maybeSingle()
        : null

    const event = normalizeEventRecord(idLookup.data || slugLookup?.data || null)

    if (!event) {
      return jsonError('Deze galerij is niet gevonden.', 404)
    }

    if (downloadAll && !(await hasAdminSession())) {
      return jsonError('Alleen de beheerder kan het volledige album downloaden.', 401)
    }

    if (downloadAll && event.allowAlbumDownload === false) {
      return jsonError('Het volledige album downloaden is voor dit album uitgeschakeld.', 403)
    }

    if (!downloadAll && event.allowGuestDownload === false) {
      return jsonError('Downloaden is voor dit album uitgeschakeld.', 403)
    }

    const query = supabase
      .from('uploads')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: true })

    const { data, error } = downloadAll
      ? await query.limit(MAX_ADMIN_ALBUM_DOWNLOADS)
      : await query.in('id', uploadIds)

    if (error) throw error

    const uploads = ((data || []) as UploadRecord[]).filter((upload) =>
      downloadAll ? true : uploadIds.includes(upload.id)
    )

    if (uploads.length === 0) {
      return jsonError('Er zijn geen foto’s om te downloaden.', 404)
    }

    const namesById = body?.namesById || {}
    const usedNames = new Set<string>()

    async function* entries() {
      for (const upload of uploads) {
        const fallbackName = getUploadShortFileName(upload)
        const requestedName =
          typeof namesById[upload.id] === 'string' ? namesById[upload.id] : fallbackName

        yield {
          data: await downloadUploadBytes(upload),
          modifiedAt: upload.created_at ? new Date(upload.created_at) : undefined,
          name: uniqueZipEntryName(requestedName, usedNames),
        }
      }
    }

    const zipName = getZipName(event.albumName || event.name || eventIdentifier, !downloadAll)
    const stream = createZipStream(entries())

    return new Response(stream, {
      headers: {
        'Content-Disposition': `attachment; filename="${zipName}"`,
        'Content-Type': 'application/zip',
      },
    })
  } catch (error) {
    logOperation('error', 'gallery-download', 'Failed to create gallery ZIP', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return jsonError(
      error instanceof Error ? error.message : 'De download kon niet worden voorbereid.',
      500
    )
  }
}
