import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import PDFDocument from 'pdfkit'
import { hasAdminSession } from '@/lib/admin-auth'
import { type UploadRecord } from '@/lib/eventdrop'
import { normalizeEventRecord, type NormalizedEvent } from '@/lib/events'
import {
  buildGuestbookEntries,
  sanitizeGuestbookPdfFilename,
  type GuestbookEntry,
} from '@/lib/guestbook'
import {
  guestbookPdfThemeLabels,
  normalizeGuestbookPdfTheme,
  type GuestbookPdfThemeKey,
} from '@/lib/guestbook-pdf-theme'
import { heightOfRichPdfText, renderRichPdfText } from '@/lib/pdf-rich-text'
import { logOperation } from '@/lib/ops-log'
import { brand } from '@/lib/brand'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { withRetry } from '@/lib/with-retry'

export const runtime = 'nodejs'

const PAGE_MARGIN = 54
const CARD_GAP = 14
const CARD_PADDING = 16
const DATE_FONT_SIZE = 8.5
const FOOTER_RESERVED_HEIGHT = 42
const MESSAGE_FONT_SIZE = 12
const NAME_FONT_SIZE = 12
const THUMBNAIL_GAP = 20
const THUMBNAIL_SIZE = 104
const WEDDING_COVER_BACKGROUND_PATH = path.join(
  process.cwd(),
  'public/pdf-assets/wedding/wedding-cover-background.png'
)
const WEDDING_MESSAGE_BACKGROUND_PATH = path.join(
  process.cwd(),
  'public/pdf-assets/wedding/wedding-message-background.png'
)
const WEDDING_PHOTO_MASK_PATH = path.join(
  process.cwd(),
  'public/pdf-assets/wedding/wedding-photo-mask.png'
)
const WEDDING_SCRIPT_FONT_PATH = path.join(
  process.cwd(),
  'public/pdf-fonts/WeddingScript.ttf'
)
const FONT_REGULAR_PATHS = [
  path.join(process.cwd(), 'public/pdf-fonts/NotoSans-Regular.ttf'),
]
const FONT_BOLD_PATHS = [
  path.join(process.cwd(), 'public/pdf-fonts/NotoSans-Bold.ttf'),
]
const REGISTERED_FONTS = {
  bold: '',
  regular: '',
}
type PdfTheme = {
  accent: string
  background: string
  border: string
  card: string
  footer: string
  heading: string
  muted: string
  name: string
  stripe: string
  subheading: string
}
type WeddingPdfAssets = {
  coverBackground: string
  messageBackground: string
  photoMask: string
  scriptFont: string
}
type PngImage = {
  channels: 3 | 4
  data: Buffer
  height: number
  width: number
}
type WeddingPhotoMask = {
  bounds: {
    height: number
    width: number
    x: number
    y: number
  }
  overlay: Buffer
}
type ResolvedPdfFonts = {
  bold: string
  regular: string
}

const PDF_THEMES: Record<GuestbookPdfThemeKey, PdfTheme> = {
  birthday: {
    accent: '#EC4899',
    background: '#FFF8EB',
    border: '#F8C7DD',
    card: '#FFFFFF',
    footer: '#A4516F',
    heading: '#6D214F',
    muted: '#9D637D',
    name: '#B42364',
    stripe: '#FDBA3B',
    subheading: '#7C3457',
  },
  business: {
    accent: '#0F766E',
    background: '#F4F7F8',
    border: '#C6D5DA',
    card: '#FFFFFF',
    footer: '#536A73',
    heading: '#102A36',
    muted: '#607680',
    name: '#17485C',
    stripe: '#0F766E',
    subheading: '#29485A',
  },
  elegant: {
    accent: '#C59B46',
    background: '#F8F6F0',
    border: '#DED6C4',
    card: '#FFFFFF',
    footer: '#746B5C',
    heading: '#202126',
    muted: '#756D64',
    name: '#4D4538',
    stripe: '#C59B46',
    subheading: '#3B3A35',
  },
  wedding: {
    accent: '#D98AA3',
    background: '#FFF7F7',
    border: '#EBC7CE',
    card: '#FFFFFF',
    footer: '#8C6670',
    heading: '#4B2F35',
    muted: '#8D6E75',
    name: '#7D4050',
    stripe: '#F3C5D4',
    subheading: '#67424B',
  },
}

let weddingPhotoMaskCache: WeddingPhotoMask | null = null

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

function getEventPdfThemeKey(event: NormalizedEvent) {
  return normalizeGuestbookPdfTheme(event.guestbookPdfTheme)
}

function getEventPdfTheme(event: NormalizedEvent) {
  return PDF_THEMES[getEventPdfThemeKey(event)]
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

function resolveRequiredPdfFonts(): ResolvedPdfFonts {
  const regularPath = resolveFontPath(FONT_REGULAR_PATHS)
  const boldPath = resolveFontPath(FONT_BOLD_PATHS)

  if (!regularPath || !boldPath) {
    throw new Error('Noto Sans font asset missing')
  }

  return {
    bold: boldPath,
    regular: regularPath,
  }
}

function resolveRequiredWeddingPdfAssets(): WeddingPdfAssets {
  if (
    !fs.existsSync(WEDDING_COVER_BACKGROUND_PATH) ||
    !fs.existsSync(WEDDING_MESSAGE_BACKGROUND_PATH) ||
    !fs.existsSync(WEDDING_PHOTO_MASK_PATH) ||
    !fs.existsSync(WEDDING_SCRIPT_FONT_PATH)
  ) {
    throw new Error('Wedding PDF asset missing')
  }

  return {
    coverBackground: WEDDING_COVER_BACKGROUND_PATH,
    messageBackground: WEDDING_MESSAGE_BACKGROUND_PATH,
    photoMask: WEDDING_PHOTO_MASK_PATH,
    scriptFont: WEDDING_SCRIPT_FONT_PATH,
  }
}

function registerFonts(document: PDFKit.PDFDocument, fonts: ResolvedPdfFonts) {
  REGISTERED_FONTS.regular = ''
  REGISTERED_FONTS.bold = ''

  document.registerFont('NotoSans', fonts.regular)
  document.registerFont('NotoSansBold', fonts.bold)
  REGISTERED_FONTS.regular = 'NotoSans'
  REGISTERED_FONTS.bold = 'NotoSansBold'
}

function setRegularFont(document: PDFKit.PDFDocument) {
  if (!REGISTERED_FONTS.regular) {
    throw new Error('Noto Sans font asset missing')
  }

  document.font(REGISTERED_FONTS.regular)
}

function setBoldFont(document: PDFKit.PDFDocument) {
  if (!REGISTERED_FONTS.bold) {
    throw new Error('Noto Sans font asset missing')
  }

  document.font(REGISTERED_FONTS.bold)
}

function drawThemeBackground(document: PDFKit.PDFDocument, theme: PdfTheme) {
  document.rect(0, 0, document.page.width, document.page.height).fill(theme.background)

  document
    .save()
    .circle(document.page.width - 56, 52, 74)
    .lineWidth(0.6)
    .strokeColor(theme.border)
    .stroke()
    .circle(52, document.page.height - 58, 46)
    .lineWidth(0.6)
    .strokeColor(theme.border)
    .stroke()
    .restore()
}

function drawThemeAccent(document: PDFKit.PDFDocument, theme: PdfTheme) {
  document
    .save()
    .moveTo(PAGE_MARGIN, PAGE_MARGIN + 34)
    .lineTo(PAGE_MARGIN + 72, PAGE_MARGIN + 34)
    .lineWidth(2.2)
    .strokeColor(theme.accent)
    .stroke()
    .restore()
}

function drawWeddingCoverBackground(document: PDFKit.PDFDocument, backgroundPath: string) {
  document.image(backgroundPath, 0, 0, {
    align: 'center',
    fit: [document.page.width, document.page.height],
    valign: 'center',
  })
}

function paethPredictor(left: number, up: number, upLeft: number) {
  const predictor = left + up - upLeft
  const leftDistance = Math.abs(predictor - left)
  const upDistance = Math.abs(predictor - up)
  const upLeftDistance = Math.abs(predictor - upLeft)

  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) return left
  if (upDistance <= upLeftDistance) return up
  return upLeft
}

function decodePng(buffer: Buffer): PngImage {
  if (!buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    throw new Error('Wedding PDF PNG asset is invalid')
  }

  let offset = 8
  let width = 0
  let height = 0
  let bitDepth = 0
  let colorType = 0
  const idatChunks: Buffer[] = []

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset)
    offset += 4
    const type = buffer.subarray(offset, offset + 4).toString('ascii')
    offset += 4
    const chunk = buffer.subarray(offset, offset + length)
    offset += length + 4

    if (type === 'IHDR') {
      width = chunk.readUInt32BE(0)
      height = chunk.readUInt32BE(4)
      bitDepth = chunk[8]
      colorType = chunk[9]
      const interlace = chunk[12]
      if (bitDepth !== 8 || interlace !== 0 || (colorType !== 2 && colorType !== 6)) {
        throw new Error('Wedding PDF PNG asset must be non-interlaced RGB or RGBA')
      }
    } else if (type === 'IDAT') {
      idatChunks.push(chunk)
    } else if (type === 'IEND') {
      break
    }
  }

  const channels = colorType === 6 ? 4 : 3
  const bytesPerPixel = channels
  const stride = width * bytesPerPixel
  const raw = zlib.inflateSync(Buffer.concat(idatChunks))
  const data = Buffer.alloc(width * height * channels)
  let rawOffset = 0
  let previousRow = Buffer.alloc(stride)

  for (let y = 0; y < height; y += 1) {
    const filter = raw[rawOffset]
    rawOffset += 1
    const scanline = raw.subarray(rawOffset, rawOffset + stride)
    rawOffset += stride
    const row = Buffer.alloc(stride)

    for (let index = 0; index < stride; index += 1) {
      const left = index >= bytesPerPixel ? row[index - bytesPerPixel] : 0
      const up = previousRow[index] || 0
      const upLeft = index >= bytesPerPixel ? previousRow[index - bytesPerPixel] || 0 : 0
      let value = scanline[index]

      if (filter === 1) {
        value = (value + left) & 255
      } else if (filter === 2) {
        value = (value + up) & 255
      } else if (filter === 3) {
        value = (value + Math.floor((left + up) / 2)) & 255
      } else if (filter === 4) {
        value = (value + paethPredictor(left, up, upLeft)) & 255
      } else if (filter !== 0) {
        throw new Error('Wedding PDF PNG asset has an unsupported filter')
      }

      row[index] = value
    }

    row.copy(data, y * stride)
    previousRow = row
  }

  return { channels, data, height, width }
}

function crc32(buffer: Buffer) {
  let crc = ~0

  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }

  return ~crc >>> 0
}

function pngChunk(type: string, data: Buffer) {
  const typeBuffer = Buffer.from(type, 'ascii')
  const lengthBuffer = Buffer.alloc(4)
  const crcBuffer = Buffer.alloc(4)

  lengthBuffer.writeUInt32BE(data.length, 0)
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0)

  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer])
}

function encodeRgbaPng(width: number, height: number, data: Buffer) {
  const rows: Buffer[] = []
  const stride = width * 4

  for (let y = 0; y < height; y += 1) {
    rows.push(Buffer.concat([Buffer.from([0]), data.subarray(y * stride, (y + 1) * stride)]))
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = 6

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', zlib.deflateSync(Buffer.concat(rows), { level: 6 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

function resolveWeddingPhotoMask(assets: WeddingPdfAssets): WeddingPhotoMask {
  if (weddingPhotoMaskCache) return weddingPhotoMaskCache

  const background = decodePng(fs.readFileSync(assets.coverBackground))
  const mask = decodePng(fs.readFileSync(assets.photoMask))

  if (
    background.width !== mask.width ||
    background.height !== mask.height ||
    mask.channels !== 4
  ) {
    throw new Error('Wedding PDF photo mask must match the cover background size')
  }

  const overlay = Buffer.alloc(background.width * background.height * 4)
  let minX = background.width
  let minY = background.height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < background.height; y += 1) {
    for (let x = 0; x < background.width; x += 1) {
      const pixelIndex = y * background.width + x
      const maskOffset = pixelIndex * mask.channels
      const backgroundOffset = pixelIndex * background.channels
      const overlayOffset = pixelIndex * 4
      const maskAlpha = mask.data[maskOffset + 3]

      if (maskAlpha > 0) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }

      overlay[overlayOffset] = background.data[backgroundOffset]
      overlay[overlayOffset + 1] = background.data[backgroundOffset + 1]
      overlay[overlayOffset + 2] = background.data[backgroundOffset + 2]
      overlay[overlayOffset + 3] = 255 - maskAlpha
    }
  }

  if (maxX < minX || maxY < minY) {
    throw new Error('Wedding PDF photo mask has no visible area')
  }

  const scaleX = 595.28 / background.width
  const scaleY = 841.89 / background.height

  weddingPhotoMaskCache = {
    bounds: {
      height: (maxY - minY + 1) * scaleY,
      width: (maxX - minX + 1) * scaleX,
      x: minX * scaleX,
      y: minY * scaleY,
    },
    overlay: encodeRgbaPng(background.width, background.height, overlay),
  }

  return weddingPhotoMaskCache
}

function drawWeddingCoverPhoto(
  document: PDFKit.PDFDocument,
  coverImage: Buffer | null,
  assets: WeddingPdfAssets
) {
  const mask = resolveWeddingPhotoMask(assets)
  const { height, width, x, y } = mask.bounds

  if (coverImage) {
    try {
      document.image(coverImage, x, y, {
        align: 'center',
        cover: [width, height],
        valign: 'center',
      })
    } catch {
      document.rect(x, y, width, height).fill('#F6EEE2')
    }
  } else {
    document.rect(x, y, width, height).fill('#F6EEE2')
  }

  document.image(mask.overlay, 0, 0, {
    align: 'center',
    fit: [document.page.width, document.page.height],
    valign: 'center',
  })
}

function formatWeddingCoverDate(value?: string | null) {
  if (!value) return ''

  try {
    const parts = new Intl.DateTimeFormat('nl-NL', {
      day: '2-digit',
      month: 'long',
      timeZone: 'Europe/Amsterdam',
      year: 'numeric',
    }).formatToParts(new Date(value))
    const day = parts.find((part) => part.type === 'day')?.value
    const month = parts.find((part) => part.type === 'month')?.value
    const year = parts.find((part) => part.type === 'year')?.value

    if (!day || !month || !year) return ''

    return `${day} | ${month.toUpperCase()} | ${year}`
  } catch {
    return ''
  }
}

function formatWeddingMessageDate(value?: string | null) {
  if (!value) return ''

  try {
    const date = new Date(value)
    const datePart = new Intl.DateTimeFormat('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'Europe/Amsterdam',
      year: 'numeric',
    }).format(date)
    const timePart = new Intl.DateTimeFormat('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Amsterdam',
    }).format(date)

    return `${datePart} · ${timePart}`
  } catch {
    return ''
  }
}

function splitWeddingCoverNameText(
  document: PDFKit.PDFDocument,
  text: string,
  width: number
) {
  if (document.widthOfString(text) <= width) return [text]

  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= 1) return [text]

  let bestLines = [text]
  let bestScore = Number.POSITIVE_INFINITY

  for (let index = 1; index < words.length; index += 1) {
    const firstLine = words.slice(0, index).join(' ')
    const secondLine = words.slice(index).join(' ')
    const firstWidth = document.widthOfString(firstLine)
    const secondWidth = document.widthOfString(secondLine)
    const maxWidth = Math.max(firstWidth, secondWidth)
    const balance = Math.abs(firstWidth - secondWidth)
    const score = maxWidth * 2 + balance

    if (score < bestScore) {
      bestScore = score
      bestLines = [firstLine, secondLine]
    }
  }

  return bestLines
}

function drawWeddingCoverNameText(input: {
  document: PDFKit.PDFDocument
  fontSize: number
  lineStepRatio: number
  maxHeight: number
  minFontSize: number
  text: string
  width: number
  x: number
  y: number
}) {
  const { document, fontSize, lineStepRatio, maxHeight, minFontSize, text, width, x, y } =
    input
  let currentFontSize = fontSize
  let lines = [text]

  while (currentFontSize > minFontSize) {
    document.fontSize(currentFontSize)
    lines = splitWeddingCoverNameText(document, text, width)
    const lineStep = currentFontSize * lineStepRatio
    const totalHeight =
      lines.length === 1 ? currentFontSize : currentFontSize + lineStep * (lines.length - 1)

    if (
      lines.length <= 2 &&
      totalHeight <= maxHeight &&
      lines.every((line) => document.widthOfString(line) <= width)
    ) {
      break
    }
    currentFontSize -= 1
  }

  const lineStep = currentFontSize * lineStepRatio
  const startY = lines.length === 1 ? y + lineStep * 0.46 : y

  lines.slice(0, 2).forEach((line, index) => {
    document.fontSize(currentFontSize).text(line, x, startY + lineStep * index, {
      align: 'center',
      lineBreak: false,
      width,
    })
  })
}

function drawFooter(
  document: PDFKit.PDFDocument,
  event: NormalizedEvent,
  theme: PdfTheme
) {
  const bottom = document.page.height - 34
  const previousY = document.y

  document
    .save()
    .moveTo(PAGE_MARGIN, bottom - 12)
    .lineTo(document.page.width - PAGE_MARGIN, bottom - 12)
    .lineWidth(0.4)
    .strokeColor(theme.border)
    .stroke()

  setRegularFont(document)
  document
    .fontSize(8)
    .fillColor(theme.footer)
    .text(`${brand.name} / Photobooth Holland`, PAGE_MARGIN, bottom, {
      continued: false,
      height: 10,
      lineBreak: false,
      width: document.page.width - PAGE_MARGIN * 2,
    })
    .text(`${getEventTitle(event)} · ${document.bufferedPageRange().count}`, PAGE_MARGIN, bottom, {
      align: 'right',
      height: 10,
      lineBreak: false,
      width: document.page.width - PAGE_MARGIN * 2,
    })
    .restore()

  document.y = previousY
}

function drawWeddingFooter(document: PDFKit.PDFDocument) {
  const previousY = document.y
  const footerY = document.page.height - 44

  setRegularFont(document)
  document
    .fontSize(7.8)
    .fillColor('#5C604C')
    .text(
      `${brand.website.replace(/^https?:\/\//, '')}  •  ${brand.email}`,
      PAGE_MARGIN,
      footerY,
      {
        align: 'center',
        height: 11,
        lineBreak: false,
        width: document.page.width - PAGE_MARGIN * 2,
      }
    )

  document.y = previousY
}

function drawWeddingMessageBackground(
  document: PDFKit.PDFDocument,
  assets: WeddingPdfAssets
) {
  document.image(assets.messageBackground, 0, 0, {
    align: 'center',
    fit: [document.page.width, document.page.height],
    valign: 'center',
  })
}

function getPageContentBottom(document: PDFKit.PDFDocument) {
  return document.page.height - PAGE_MARGIN - FOOTER_RESERVED_HEIGHT
}

function getWeddingMessageContentBottom(document: PDFKit.PDFDocument) {
  return document.page.height - 78
}

function getWeddingMessageContentWidth(document: PDFKit.PDFDocument) {
  return document.page.width - 168
}

function getWeddingMessageContentX(document: PDFKit.PDFDocument) {
  return (document.page.width - getWeddingMessageContentWidth(document)) / 2
}

function entryHasPhoto(entry: GuestbookEntry, photo?: Buffer | null) {
  return Boolean(photo && (entry.source === 'upload' || entry.relatedUpload))
}

function estimateCardHeight(
  document: PDFKit.PDFDocument,
  entry: GuestbookEntry,
  photo?: Buffer | null
) {
  const hasPhoto = entryHasPhoto(entry, photo)
  const contentWidth = document.page.width - PAGE_MARGIN * 2 - CARD_PADDING * 2
  const textWidth = hasPhoto
    ? contentWidth - THUMBNAIL_SIZE - THUMBNAIL_GAP
    : contentWidth
  let height = CARD_PADDING * 2

  if (entry.source === 'standalone' && entry.guestName) {
    setBoldFont(document)
    document.fontSize(NAME_FONT_SIZE)
    height += document.heightOfString(entry.guestName, {
      width: textWidth,
    })
    height += 6
  }

  setRegularFont(document)
  document.fontSize(MESSAGE_FONT_SIZE)
  height += document.heightOfString(entry.message, {
    lineGap: 3,
    width: textWidth,
  })

  const date = formatWeddingMessageDate(entry.createdAt)

  if (date) {
    document.fontSize(DATE_FONT_SIZE)
    height += 6
    height += document.heightOfString(date, {
      width: textWidth,
    })
  }

  return Math.max(height, hasPhoto ? CARD_PADDING * 2 + THUMBNAIL_SIZE : 72)
}

function estimateWeddingCardHeight(
  document: PDFKit.PDFDocument,
  entry: GuestbookEntry,
  photo?: Buffer | null
) {
  const hasPhoto = entryHasPhoto(entry, photo)
  const cardPadding = 13
  const thumbnailSize = 58
  const contentWidth = getWeddingMessageContentWidth(document) - cardPadding * 2
  const textWidth = hasPhoto ? contentWidth - thumbnailSize - 14 : contentWidth
  const guestName =
    entry.source === 'standalone' && entry.guestName ? entry.guestName : 'Gast'
  const date = formatWeddingMessageDate(entry.createdAt)
  let height = cardPadding * 2

  setBoldFont(document)
  document.fontSize(10.2)
  const nameHeight = document.heightOfString(guestName, {
    height: 14,
    lineBreak: false,
    width: Math.max(84, textWidth - 122),
  })

  setRegularFont(document)
  document.fontSize(7.3)
  const dateHeight = date
    ? document.heightOfString(date, {
        align: 'right',
        height: 10,
        lineBreak: false,
        width: 112,
      })
    : 0

  height += Math.max(14, nameHeight, dateHeight)
  height += 8

  document.fontSize(10.4)
  height += heightOfRichPdfText(document, entry.message, {
    font: REGISTERED_FONTS.regular,
    fontSize: 10.4,
    lineGap: 2,
    width: textWidth,
  })

  return Math.max(height, hasPhoto ? cardPadding * 2 + thumbnailSize : 72)
}

function drawWeddingCoverPage(
  document: PDFKit.PDFDocument,
  event: NormalizedEvent,
  coverImage: Buffer | null,
  assets: WeddingPdfAssets
) {
  drawWeddingCoverBackground(document, assets.coverBackground)
  drawWeddingCoverPhoto(document, coverImage, assets)

  document.font(assets.scriptFont).fillColor('#24452D')
  drawWeddingCoverNameText({
    document,
    fontSize: 44,
    lineStepRatio: 0.94,
    maxHeight: 56,
    minFontSize: 20,
    text: getEventTitle(event),
    width: 370,
    x: (document.page.width - 370) / 2,
    y: 636,
  })

  const eventDate = formatWeddingCoverDate(event.eventDate)

  if (eventDate) {
    setRegularFont(document)
    document
      .fontSize(10)
      .fillColor('#24452D')
      .text(eventDate, 144, 734, {
        align: 'center',
        characterSpacing: 1.2,
        lineBreak: false,
        width: 307,
      })
  }
}

function drawCoverPage(
  document: PDFKit.PDFDocument,
  event: NormalizedEvent,
  coverImage: Buffer | null,
  theme: PdfTheme
) {
  drawThemeBackground(document, theme)

  if (coverImage) {
    try {
      document
        .roundedRect(PAGE_MARGIN - 6, 58, document.page.width - PAGE_MARGIN * 2 + 12, 202, 18)
        .lineWidth(0.8)
        .strokeColor(theme.border)
        .stroke()
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
    .fillColor(theme.accent)
    .text(guestbookPdfThemeLabels[normalizeGuestbookPdfTheme(event.guestbookPdfTheme)].toUpperCase(), PAGE_MARGIN, titleY, {
      align: 'center',
      characterSpacing: 2,
      width: document.page.width - PAGE_MARGIN * 2,
    })
    .moveDown(0.8)
    .fontSize(34)
    .fillColor(theme.heading)
    .text('Digitaal Gastenboek', {
      align: 'center',
      width: document.page.width - PAGE_MARGIN * 2,
    })

  setRegularFont(document)
  document
    .moveDown(0.6)
    .fontSize(18)
    .fillColor(theme.subheading)
    .text(getEventTitle(event), {
      align: 'center',
      width: document.page.width - PAGE_MARGIN * 2,
    })

  if (event.eventDate) {
    document
      .moveDown(0.4)
      .fontSize(11)
      .fillColor(theme.muted)
      .text(event.eventDate, {
        align: 'center',
        width: document.page.width - PAGE_MARGIN * 2,
      })
  }

  document
    .fontSize(9)
    .fillColor(theme.footer)
    .text(`${brand.name} / Photobooth Holland · ${brand.website}`, PAGE_MARGIN, document.page.height - 72, {
      align: 'center',
      width: document.page.width - PAGE_MARGIN * 2,
    })
}

function drawGuestbookPageHeader(document: PDFKit.PDFDocument, theme: PdfTheme) {
  drawThemeBackground(document, theme)
  document.y = PAGE_MARGIN
  setBoldFont(document)
  document
    .fontSize(20)
    .fillColor(theme.heading)
    .text('Berichten', PAGE_MARGIN, PAGE_MARGIN)
    .moveDown(0.8)
  drawThemeAccent(document, theme)
}

function drawWeddingGuestbookPageHeader(
  document: PDFKit.PDFDocument,
  _event: NormalizedEvent,
  assets: WeddingPdfAssets
) {
  drawWeddingMessageBackground(document, assets)
  document.y = 244
}

function drawMessageCard(input: {
  document: PDFKit.PDFDocument
  entry: GuestbookEntry
  photo?: Buffer | null
  theme: PdfTheme
}) {
  const { document, entry, photo, theme } = input
  const hasPhoto = entryHasPhoto(entry, photo)
  const cardHeight = estimateCardHeight(document, entry, photo)

  const x = PAGE_MARGIN
  const y = document.y
  const width = document.page.width - PAGE_MARGIN * 2

  document
    .save()
    .roundedRect(x, y, width, cardHeight, 10)
    .fill(theme.card)
    .rect(x, y, 5, cardHeight)
    .fill(theme.stripe)
    .roundedRect(x, y, width, cardHeight, 10)
    .lineWidth(0.6)
    .strokeColor(theme.border)
    .stroke()
    .restore()

  const innerX = x + 16
  const innerY = y + 16
  let textX = innerX
  let textWidth = width - 32

  if (hasPhoto && photo) {
    try {
      document.image(photo, innerX, innerY, {
        fit: [THUMBNAIL_SIZE, THUMBNAIL_SIZE],
        valign: 'center',
      })
      textX += THUMBNAIL_SIZE + THUMBNAIL_GAP
      textWidth -= THUMBNAIL_SIZE + THUMBNAIL_GAP
    } catch {
      // Ignore unsupported message photos.
    }
  }

  if (entry.source === 'standalone' && entry.guestName) {
    setBoldFont(document)
    document
      .fontSize(NAME_FONT_SIZE)
      .fillColor(theme.name)
      .text(entry.guestName, textX, innerY, {
        width: textWidth,
      })
    document.y += 6
  } else {
    document.y = innerY
  }

  setRegularFont(document)
  document
    .fontSize(MESSAGE_FONT_SIZE)
    .fillColor(theme.heading)
    .text(entry.message, textX, document.y, {
      lineGap: 3,
      width: textWidth,
    })

  const date = formatPdfDate(entry.createdAt)

  if (date) {
    document
      .moveDown(0.5)
      .fontSize(DATE_FONT_SIZE)
      .fillColor(theme.muted)
      .text(date, textX, document.y, {
        width: textWidth,
      })
  }

  document.y = y + cardHeight + CARD_GAP
}

function drawWeddingMessageCard(input: {
  document: PDFKit.PDFDocument
  entry: GuestbookEntry
  photo?: Buffer | null
}) {
  const { document, entry, photo } = input
  const hasPhoto = entryHasPhoto(entry, photo)
  const cardHeight = estimateWeddingCardHeight(document, entry, photo)
  const width = getWeddingMessageContentWidth(document)
  const x = getWeddingMessageContentX(document)
  const y = document.y
  const cardPadding = 13
  const thumbnailSize = 58

  document
    .save()
    .roundedRect(x, y, width, cardHeight, 8)
    .fill('#FFFCF5')
    .roundedRect(x, y, width, cardHeight, 8)
    .lineWidth(0.5)
    .strokeColor('#D5B45B')
    .stroke()
    .restore()

  let textX = x + cardPadding
  let textWidth = width - cardPadding * 2
  const innerY = y + cardPadding

  if (hasPhoto && photo) {
    try {
      document
        .save()
        .roundedRect(x + cardPadding, innerY, thumbnailSize, thumbnailSize, 6)
        .clip()
        .image(photo, x + cardPadding, innerY, {
          align: 'center',
          cover: [thumbnailSize, thumbnailSize],
          valign: 'center',
        })
        .restore()

      textX += thumbnailSize + 14
      textWidth -= thumbnailSize + 14
    } catch {
      textX = x + cardPadding
      textWidth = width - cardPadding * 2
    }
  }

  const guestName =
    entry.source === 'standalone' && entry.guestName ? entry.guestName : 'Gast'
  const date = formatWeddingMessageDate(entry.createdAt)
  const dateWidth = 112

  setBoldFont(document)
  document
    .fontSize(10.2)
    .fillColor('#24452D')
    .text(guestName, textX, innerY, {
      height: 14,
      lineBreak: false,
      width: Math.max(84, textWidth - dateWidth - 10),
    })

  if (date) {
    setRegularFont(document)
    document
      .fontSize(7.3)
      .fillColor('#7A7157')
      .text(date, textX + textWidth - dateWidth, innerY + 1, {
        align: 'right',
        height: 10,
        lineBreak: false,
        width: dateWidth,
      })
  }

  renderRichPdfText(document, entry.message, {
    color: '#33412E',
    font: REGISTERED_FONTS.regular,
    fontSize: 10.4,
    lineGap: 2,
    width: textWidth,
    x: textX,
    y: innerY + 22,
  })

  document.y = y + cardHeight + 11
}

async function buildGuestbookPdf(input: {
  coverImage: Buffer | null
  entries: GuestbookEntry[]
  event: NormalizedEvent
}) {
  const fonts = resolveRequiredPdfFonts()
  const themeKey = getEventPdfThemeKey(input.event)
  const theme = getEventPdfTheme(input.event)
  const weddingAssets =
    themeKey === 'wedding' ? resolveRequiredWeddingPdfAssets() : null
  const document = new PDFDocument({
    autoFirstPage: false,
    bufferPages: true,
    font: fonts.regular,
    margins: {
      bottom: PAGE_MARGIN,
      left: PAGE_MARGIN,
      right: PAGE_MARGIN,
      top: PAGE_MARGIN,
    },
    size: 'A4',
  })
  const bufferPromise = collectPdfBuffer(document)

  registerFonts(document, fonts)
  setRegularFont(document)
  document.addPage()
  if (themeKey === 'wedding' && weddingAssets) {
    drawWeddingCoverPage(document, input.event, input.coverImage, weddingAssets)
  } else {
    drawCoverPage(document, input.event, input.coverImage, theme)
  }
  document.addPage()
  if (themeKey === 'wedding' && weddingAssets) {
    drawWeddingGuestbookPageHeader(document, input.event, weddingAssets)
  } else {
    drawGuestbookPageHeader(document, theme)
  }
  let entriesOnCurrentPage = 0

  for (const entry of input.entries) {
    const photoUpload =
      entry.source === 'upload' ? entry.upload : entry.relatedUpload || null
    const photo = photoUpload ? await fetchImageBuffer(photoUpload.file_url) : null
    const cardHeight =
      themeKey === 'wedding'
        ? estimateWeddingCardHeight(document, entry, photo)
        : estimateCardHeight(document, entry, photo)

    if (
      entriesOnCurrentPage > 0 &&
      document.y + cardHeight >
        (themeKey === 'wedding'
          ? getWeddingMessageContentBottom(document)
          : getPageContentBottom(document))
    ) {
      if (themeKey === 'wedding' && weddingAssets) {
        drawWeddingFooter(document)
      } else {
        drawFooter(document, input.event, theme)
      }
      document.addPage()
      if (themeKey === 'wedding' && weddingAssets) {
        drawWeddingGuestbookPageHeader(document, input.event, weddingAssets)
      } else {
        drawGuestbookPageHeader(document, theme)
      }
      entriesOnCurrentPage = 0
    }

    if (themeKey === 'wedding') {
      drawWeddingMessageCard({
        document,
        entry,
        photo,
      })
    } else {
      drawMessageCard({
        document,
        entry,
        photo,
        theme,
      })
    }
    entriesOnCurrentPage += 1
  }

  if (themeKey === 'wedding' && weddingAssets) {
    drawWeddingFooter(document)
  } else {
    drawFooter(document, input.event, theme)
  }
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

    const coverImage = await fetchImageBuffer(
      event.guestbookCoverImageUrl || event.coverImageUrl
    )
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
