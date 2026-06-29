import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  getStoragePathFromUpload,
  getUploadShortFileName,
  type UploadRecord,
} from '@/lib/eventdrop'
import { normalizeEventRecord } from '@/lib/events'
import { logOperation } from '@/lib/ops-log'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { createZipStream, safeZipFileName, uniqueZipEntryName } from '@/lib/zip'
import {
  EVENT_ACCESS_COOKIE_NAME,
  parseEventAccessCookie,
} from '@/lib/event-access'

export const runtime = 'nodejs'

type DownloadRequestBody = {
  all?: boolean
  albumPackage?: boolean
  eventIdentifier?: string
  namesById?: Record<string, string>
  packageNumber?: number
  uploadIds?: string[]
}

type DownloadInput = {
  albumPackage?: boolean
  all?: boolean
  eventIdentifier: string
  namesById?: Record<string, string>
  packageNumber?: number
  uploadIds: string[]
}

const MAX_SELECTED_DOWNLOADS = 100
const MAX_ALBUM_DOWNLOADS = 500

async function recordDownload(input: {
  eventId: string
  downloadType: 'album' | 'selection'
  itemCount: number
}) {
  try {
    const cookieStore = await cookies()
    const grants = parseEventAccessCookie(
      cookieStore.get(EVENT_ACCESS_COOKIE_NAME)?.value
    )
    const email = grants.find((grant) => grant.eventId === input.eventId)?.email || null
    const supabase = createAdminSupabaseClient()
    const { error } = await supabase.from('download_logs').insert([{
      event_id: input.eventId,
      email,
      download_type: input.downloadType,
      item_count: input.itemCount,
    }])

    if (error) {
      logOperation('warn', 'gallery-download', 'Download counter could not be saved', {
        error: error.message,
      })
    }
  } catch (error) {
    logOperation('warn', 'gallery-download', 'Download counter could not be saved', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

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

function getZipName(eventName: string, selectedOnly: boolean, packageNumber?: number) {
  const baseName = safeZipFileName(eventName || 'eventdrop-album', 'eventdrop-album')
  const suffix = packageNumber
    ? `-pakket-${packageNumber}`
    : selectedOnly
      ? '-selectie'
      : ''

  return `${baseName}${suffix}.zip`
}

function getAsciiDownloadFileName(fileName: string) {
  const extension = fileName.toLowerCase().endsWith('.zip') ? '.zip' : ''
  const baseName = extension ? fileName.slice(0, -extension.length) : fileName
  const asciiBaseName = baseName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]+/g, '-')
    .replace(/[\\/:*?"<>|;=]+/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/-+/g, '-')
    .replace(/^[\s.-]+|[\s.-]+$/g, '')
    .slice(0, 140)

  return `${asciiBaseName || 'eventdrop-album'}${extension || '.zip'}`
}

function getDownloadContentDisposition(fileName: string) {
  const asciiFileName = getAsciiDownloadFileName(fileName)
  const encodedFileName = encodeURIComponent(fileName)
    .replace(/['()]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/\*/g, '%2A')

  return `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`
}

async function createGalleryDownloadResponse(input: DownloadInput) {
  try {
    const eventIdentifier = input.eventIdentifier.trim()
    const uploadIds = input.uploadIds.filter((id) => id.length > 0)
    const downloadAll = input.all === true
    const albumPackage = input.albumPackage === true

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

    if ((downloadAll || albumPackage) && event.allowAlbumDownload === false) {
      return jsonError('Het volledige album downloaden is voor dit album uitgeschakeld.', 403)
    }

    if (event.allowGuestDownload === false) {
      return jsonError('Downloaden is voor dit album uitgeschakeld.', 403)
    }

    const query = supabase
      .from('uploads')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: true })

    const { data, error } = downloadAll
      ? await query.limit(MAX_ALBUM_DOWNLOADS)
      : await query.in('id', uploadIds)

    if (error) throw error

    const uploads = ((data || []) as UploadRecord[]).filter((upload) =>
      downloadAll ? true : uploadIds.includes(upload.id)
    )

    if (uploads.length === 0) {
      return jsonError('Er zijn geen foto’s om te downloaden.', 404)
    }

    await recordDownload({
      eventId: event.id,
      downloadType: downloadAll || albumPackage ? 'album' : 'selection',
      itemCount: uploads.length,
    })

    const namesById = input.namesById || {}
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

    const zipName = getZipName(
      event.albumName || event.name || eventIdentifier,
      !downloadAll && !albumPackage,
      input.packageNumber
    )
    const stream = createZipStream(entries())

    return new Response(stream, {
      headers: {
        'Content-Disposition': getDownloadContentDisposition(zipName),
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

export async function GET(request: Request) {
  const url = new URL(request.url)
  const uploadIds = (url.searchParams.get('uploadIds') || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
  const packageNumber = Number(url.searchParams.get('packageNumber') || '')

  return createGalleryDownloadResponse({
    albumPackage: url.searchParams.get('albumPackage') === 'true',
    all: url.searchParams.get('all') === 'true',
    eventIdentifier: url.searchParams.get('eventIdentifier') || '',
    packageNumber: Number.isFinite(packageNumber) && packageNumber > 0 ? packageNumber : undefined,
    uploadIds,
  })
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as DownloadRequestBody | null
  const uploadIds = Array.isArray(body?.uploadIds)
    ? body.uploadIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
    : []

  return createGalleryDownloadResponse({
    albumPackage: body?.albumPackage === true,
    all: body?.all === true,
    eventIdentifier: body?.eventIdentifier || '',
    namesById: body?.namesById || {},
    packageNumber: body?.packageNumber,
    uploadIds,
  })
}
