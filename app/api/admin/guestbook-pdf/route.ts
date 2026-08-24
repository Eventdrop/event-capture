import fs from 'node:fs'
import path from 'node:path'
import PDFDocument from 'pdfkit'
import { hasAdminSession } from '@/lib/admin-auth'
import { type UploadRecord } from '@/lib/eventdrop'
import { normalizeEventRecord, type NormalizedEvent } from '@/lib/events'
import {
  buildGuestbookEntries,
  sanitizeGuestbookPdfFilename,
  type GuestbookEntry,
} from '@/lib/guestbook'
import { logOperation } from '@/lib/ops-log'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { withRetry } from '@/lib/with-retry'

export const runtime = 'nodejs'

const PAGE_MARGIN = 54
const FONT_REGULAR_PATHS = [
  path.join(
    process.cwd(),
    'node_modules/@fontsource/noto-sans/files/noto-sans-latin-ext-400-normal.woff'
  ),
  path.join(
    process.cwd(),
    'node_modules/@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff'
  ),
]
const FONT_BOLD_PATHS = [
  path.join(
    process.cwd(),
    'node_modules/@fontsource/noto-sans/files/noto-sans-latin-ext-700-normal.woff'
  ),
  path.join(
    process.cwd(),
    'node_modules/@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff'
  ),
]
const REGISTERED_FONTS = {
  bold: '',
  regular: '',
}

type PdfUploadRow = UploadRecord & {
  event_id?: string | null
}

type GuestbookMessageRow = {
  created_at?: string | null
  guestName?: string | null
  guest_name?: string | null
  message?: string | null
  related_upload_id?: string | null
}

function jsonError(message: string, status: number) {
  return Response.json(
    {
      ok: false,
      error: message,
    },
    { status }
  )
}

function formatPdfDate(value?: string | null) {
  if (!value) return ''

  try {
    return new Intl.DateTimeFormat('nl-NL', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Amsterdam',
    }).format(new Date(value))
  } catch {
    return ''
  }
}

function getEventTitle(event: NormalizedEvent) {
  return event.albumName || event.name || 'EventDrop'
}

async function fetchImageBuffer(url?: string | null) {
  if (!url || !/^https?:\/\//i.test(url)) return null

  try {
    const response = await fetch(url, { cache: 'no-store' })
    const contentType = response.headers.get('content-type') || ''

    if (!response.ok || !contentType.startsWith('image/')) return null

    const buffer = Buffer.from(await response.arrayBuffer())

    if (buffer.length === 0) return null

    return buffer
  } catch {
    return null
  }
}

function collectPdfBuffer(document: PDFKit.PDFDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []

    document.on('data', (chunk: Buffer) => chunks.push(chunk))
    document.on('end', () => resolve(Buffer.concat(chunks)))
    document.on('error', reject)
  })
}

function resolveFontPath(candidates: string[]) {
  return candidates.find((candidate) => candidate && fs.existsSync(candidate)) || ''
}

function registerFonts(document: PDFKit.PDFDocument) {
  const regularPath = resolveFontPath(FONT_REGULAR_PATHS)
  const boldPath = resolveFontPath(FONT_BOLD_PATHS)

  REGISTERED_FONTS.regular = ''
  REGISTERED_FONTS.bold = ''

  if (regularPath) {
    document.registerFont('NotoSans', regularPath)
    REGISTERED_FONTS.regular = 'NotoSans'
  }

  if (boldPath) {
    document.registerFont('NotoSansBold', boldPath)
    REGISTERED_FONTS.bold = 'NotoSansBold'
  }
}

function setRegularFont(document: PDFKit.PDFDocument) {
  const fontName = REGISTERED_FONTS.regular || REGISTERED_FONTS.bold

  if (!fontName) {
    throw new Error('No bundled PDF font could be registered.')
  }

  document.font(fontName)
}

function setBoldFont(document: PDFKit.PDFDocument) {
  const fontName = REGISTERED_FONTS.bold || REGISTERED_FONTS.regular

  if (!fontName) {
    throw new Error('No bundled PDF font could be registered.')
  }

  document.font(fontName)
}

function drawFooter(document: PDFKit.PDFDocument, event: NormalizedEvent) {
  const bottom = document.page.height - 34

  document
    .save()
    .moveTo(PAGE_MARGIN, bottom - 12)
    .lineTo(document.page.width - PAGE_MARGIN, bottom - 12)
    .lineWidth(0.4)
    .strokeColor('#D4DFEE')
    .stroke()

  setRegularFont(document)
  document
    .fontSize(8)
    .fillColor('#6A84A3')
    .text('EventDrop / Photobooth Holland', PAGE_MARGIN, bottom, {
      continued: false,
    })
    .text(`${getEventTitle(event)} · ${document.bufferedPageRange().count}`, PAGE_MARGIN, bottom, {
      align: 'right',
      width: document.page.width - PAGE_MARGIN * 2,
    })
    .restore()
}

function drawCoverPage(
  document: PDFKit.PDFDocument,
  event: NormalizedEvent,
  coverImage: Buffer | null
) {
  document.rect(0, 0, document.page.width, document.page.height).fill('#F8FBFE')

  if (coverImage) {
    try {
      document.image(coverImage, PAGE_MARGIN, 64, {
        align: 'center',
        fit: [document.page.width - PAGE_MARGIN * 2, 190],
        valign: 'center',
      })
    } catch {
      // Broken or unsupported image data should never block PDF export.
    }
  }

  const titleY = coverImage ? 300 : 220

  setBoldFont(document)
  document
    .fontSize(13)
    .fillColor('#F58220')
    .text('EVENTDROP', PAGE_MARGIN, titleY, {
      align: 'center',
      characterSpacing: 2,
      width: document.page.width - PAGE_MARGIN * 2,
    })
    .moveDown(0.8)
    .fontSize(34)
    .fillColor('#0B2742')
    .text('Digitaal Gastenboek', {
      align: 'center',
      width: document.page.width - PAGE_MARGIN * 2,
    })

  setRegularFont(document)
  document
    .moveDown(0.6)
    .fontSize(18)
    .fillColor('#33516F')
    .text(getEventTitle(event), {
      align: 'center',
      width: document.page.width - PAGE_MARGIN * 2,
    })

  if (event.eventDate) {
    document
      .moveDown(0.4)
      .fontSize(11)
      .fillColor('#6A84A3')
      .text(event.eventDate, {
        align: 'center',
        width: document.page.width - PAGE_MARGIN * 2,
      })
  }

  document
    .fontSize(9)
    .fillColor('#6A84A3')
    .text('EventDrop / Photobooth Holland', PAGE_MARGIN, document.page.height - 72, {
      align: 'center',
      width: document.page.width - PAGE_MARGIN * 2,
    })
}

function estimateCardHeight(document: PDFKit.PDFDocument, entry: GuestbookEntry) {
  const contentWidth = document.page.width - PAGE_MARGIN * 2 - 32
  const textWidth = entry.source === 'upload' ? contentWidth - 130 : contentWidth
  let height = 34

  if (entry.source === 'standalone' && entry.guestName) {
    height += 22
  }

  setRegularFont(document)
  height += document.heightOfString(entry.message, {
    width: textWidth,
  })

  return Math.max(
    height + 28,
    entry.source === 'upload' || entry.relatedUpload ? 136 : 96
  )
}

function drawMessageCard(input: {
  document: PDFKit.PDFDocument
  entry: GuestbookEntry
  event: NormalizedEvent
  photo?: Buffer | null
}) {
  const { document, entry, event, photo } = input
  const pageBottom = document.page.height - PAGE_MARGIN - 26
  const cardHeight = Math.min(
    estimateCardHeight(document, entry),
    pageBottom - PAGE_MARGIN
  )

  if (document.y + cardHeight > pageBottom) {
    drawFooter(document, event)
    document.addPage()
    document.y = PAGE_MARGIN
  }

  const x = PAGE_MARGIN
  const y = document.y
  const width = document.page.width - PAGE_MARGIN * 2

  document
    .save()
    .roundedRect(x, y, width, cardHeight, 14)
    .fill('#FFFFFF')
    .roundedRect(x, y, width, cardHeight, 14)
    .lineWidth(0.6)
    .strokeColor('#D4DFEE')
    .stroke()
    .restore()

  const innerX = x + 16
  const innerY = y + 16
  let textX = innerX
  let textWidth = width - 32

  if (photo) {
    try {
      document.image(photo, innerX, innerY, {
        fit: [104, 104],
        valign: 'center',
      })
      textX += 124
      textWidth -= 124
    } catch {
      // Ignore unsupported message photos.
    }
  }

  if (entry.source === 'standalone' && entry.guestName) {
    setBoldFont(document)
    document
      .fontSize(12)
      .fillColor('#0F3D66')
      .text(entry.guestName, textX, innerY, {
        width: textWidth,
      })
    document.y += 6
  } else {
    document.y = innerY
  }

  setRegularFont(document)
  document
    .fontSize(12)
    .fillColor('#0B2742')
    .text(entry.message, textX, document.y, {
      lineGap: 3,
      width: textWidth,
    })

  const date = formatPdfDate(entry.createdAt)

  if (date) {
    document
      .moveDown(0.5)
      .fontSize(8.5)
      .fillColor('#6A84A3')
      .text(date, textX, document.y, {
        width: textWidth,
      })
  }

  document.y = y + cardHeight + 14
}

async function buildGuestbookPdf(input: {
  coverImage: Buffer | null
  entries: GuestbookEntry[]
  event: NormalizedEvent
}) {
  const document = new PDFDocument({
    autoFirstPage: false,
    bufferPages: true,
    margins: {
      bottom: PAGE_MARGIN,
      left: PAGE_MARGIN,
      right: PAGE_MARGIN,
      top: PAGE_MARGIN,
    },
    size: 'A4',
  })
  const bufferPromise = collectPdfBuffer(document)

  registerFonts(document)
  document.addPage()
  drawCoverPage(document, input.event, input.coverImage)
  document.addPage()

  setBoldFont(document)
  document
    .fontSize(20)
    .fillColor('#0B2742')
    .text('Berichten', PAGE_MARGIN, PAGE_MARGIN)
    .moveDown(0.8)

  for (const entry of input.entries) {
    const photoUpload =
      entry.source === 'upload' ? entry.upload : entry.relatedUpload || null
    const photo = photoUpload ? await fetchImageBuffer(photoUpload.file_url) : null

    drawMessageCard({
      document,
      entry,
      event: input.event,
      photo,
    })
  }

  drawFooter(document, input.event)
  document.end()

  return bufferPromise
}

async function loadGuestbookData(eventId: string) {
  const supabase = createAdminSupabaseClient()
  const eventLookup = await withRetry(
    () => supabase.from('events').select('*').eq('id', eventId).maybeSingle(),
    {
      attempts: 3,
      delayMs: 250,
    }
  )

  if (eventLookup.error) throw eventLookup.error

  const event = normalizeEventRecord(eventLookup.data)

  if (!event) return { entries: [], event: null }

  const uploadsLookup = await withRetry(
    () =>
      supabase
        .from('uploads')
        .select('*')
        .eq('event_id', event.id)
        .not('guest_message', 'is', null)
        .order('created_at', { ascending: true })
        .limit(1000),
    {
      attempts: 3,
      delayMs: 250,
    }
  )

  if (uploadsLookup.error) throw uploadsLookup.error

  const standaloneLookup = await withRetry(
    () =>
      supabase
        .from('guestbook_messages')
        .select('guest_name,message,related_upload_id,created_at')
        .eq('event_id', event.id)
        .order('created_at', { ascending: true })
        .limit(1000),
    {
      attempts: 3,
      delayMs: 250,
    }
  )
  const standaloneMessages =
    standaloneLookup.error &&
    (standaloneLookup.error.message.includes('guestbook_messages') ||
      standaloneLookup.error.message.includes('does not exist'))
      ? []
      : ((standaloneLookup.data || []) as GuestbookMessageRow[])

  if (standaloneLookup.error && standaloneMessages.length === 0) {
    const message = standaloneLookup.error.message.toLowerCase()

    if (!message.includes('guestbook_messages') && !message.includes('does not exist')) {
      throw standaloneLookup.error
    }
  }

  return {
    entries: buildGuestbookEntries({
      sort: 'oldest',
      standaloneMessages,
      uploads: (uploadsLookup.data || []) as PdfUploadRow[],
    }),
    event,
  }
}

export async function GET(request: Request) {
  if (!(await hasAdminSession())) {
    return jsonError('Geen toegang.', 401)
  }

  const { searchParams } = new URL(request.url)
  const eventId = (searchParams.get('eventId') || '').trim()

  if (!eventId) {
    return jsonError('Event is verplicht.', 400)
  }

  try {
    const { entries, event } = await loadGuestbookData(eventId)

    if (!event) {
      return jsonError('Event niet gevonden.', 404)
    }

    if (entries.length === 0) {
      return jsonError('Geen berichten voor dit gastenboek.', 404)
    }

    const coverImage = await fetchImageBuffer(event.coverImageUrl)
    const pdf = await buildGuestbookPdf({
      coverImage,
      entries,
      event,
    })
    const filename = sanitizeGuestbookPdfFilename(getEventTitle(event))

    return new Response(new Uint8Array(pdf), {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdf.length),
        'Content-Type': 'application/pdf',
      },
    })
  } catch (error) {
    logOperation('error', 'admin-guestbook-pdf', 'Failed to export guestbook PDF', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return jsonError('Gastenboek PDF kon niet worden gemaakt.', 500)
  }
}
