'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { LANGUAGE_STORAGE_KEY, useLanguage } from '@/app/_components/language-provider'
import { SiteFooter } from '@/app/_components/site-footer'
import { getPublicMediaUrl } from '@/lib/app-url'
import {
  getUploadShareKey,
  getUploadShortFileName,
  type UploadRecord,
} from '@/lib/eventdrop'
import { normalizeEventRecord, type NormalizedEvent } from '@/lib/events'
import {
  buildGuestbookEntries,
  formatGuestbookDate,
  type GuestbookStandaloneRecord,
} from '@/lib/guestbook'
import { shareMedia } from '@/lib/share-media'
import { supabase } from '@/lib/supabase'
import { locales, type Locale } from '@/lib/i18n'

const POSTER_WIDTH = 2480
const POSTER_HEIGHT = 3508
const POSTER_MAX_TILES = 12
const MIXED_POSTER_PORTRAIT_TILES = 8
const MIXED_POSTER_LANDSCAPE_TILES = 4
const PHOTOSTRIP_MIN_HEIGHT_RATIO = 2.4
const STORY_WIDTH = 1080
const STORY_HEIGHT = 1920
const POSTER_MARGIN = 56
const POSTER_FOOTER_HEIGHT = 160
const POSTER_LOGO_URL = '/photobooth-holland-logo.png'
const ORIENTATION_CONFIG = {
  portraitMaxRatio: 0.9,
  landscapeMinRatio: 1.1,
  softCropMaxDelta: 0.36,
}
const POSTER_PHOTO_AREA = {
  topAreaHeight: 720,
  photoAreaHeight: 2608,
  bottomAreaHeight: 180,
  photoAreaInsetX: 120,
  photoAreaInsetY: 40,
}
const POSTER_TEMPLATE_PHOTO_AREA = {
  x: POSTER_PHOTO_AREA.photoAreaInsetX,
  y: POSTER_PHOTO_AREA.topAreaHeight + POSTER_PHOTO_AREA.photoAreaInsetY,
  width: POSTER_WIDTH - POSTER_PHOTO_AREA.photoAreaInsetX * 2,
  height: POSTER_PHOTO_AREA.photoAreaHeight - POSTER_PHOTO_AREA.photoAreaInsetY * 2,
}
const MIXED_POSTER_GRID = {
  columnGap: 24,
  columnWidth: 542,
  landscapeHeight: 450,
  middlePortraitHeight: 730,
  rowGap: 24,
  stackGap: 24,
  tallPortraitHeight: 924,
  x: 120,
  y: 660,
}
const MIXED_POSTER_GRID_X = {
  column1: MIXED_POSTER_GRID.x,
  column2: MIXED_POSTER_GRID.x + MIXED_POSTER_GRID.columnWidth + MIXED_POSTER_GRID.columnGap,
  column3:
    MIXED_POSTER_GRID.x +
    (MIXED_POSTER_GRID.columnWidth + MIXED_POSTER_GRID.columnGap) * 2,
  column4:
    MIXED_POSTER_GRID.x +
    (MIXED_POSTER_GRID.columnWidth + MIXED_POSTER_GRID.columnGap) * 3,
}
const MIXED_POSTER_GRID_Y = {
  top: MIXED_POSTER_GRID.y,
  topLandscape2:
    MIXED_POSTER_GRID.y +
    MIXED_POSTER_GRID.landscapeHeight +
    MIXED_POSTER_GRID.stackGap,
  middle:
    MIXED_POSTER_GRID.y +
    MIXED_POSTER_GRID.tallPortraitHeight +
    MIXED_POSTER_GRID.rowGap,
  bottom:
    MIXED_POSTER_GRID.y +
    MIXED_POSTER_GRID.tallPortraitHeight +
    MIXED_POSTER_GRID.rowGap +
    MIXED_POSTER_GRID.middlePortraitHeight +
    MIXED_POSTER_GRID.rowGap,
  bottomLandscape2:
    MIXED_POSTER_GRID.y +
    MIXED_POSTER_GRID.tallPortraitHeight +
    MIXED_POSTER_GRID.rowGap +
    MIXED_POSTER_GRID.middlePortraitHeight +
    MIXED_POSTER_GRID.rowGap +
    MIXED_POSTER_GRID.landscapeHeight +
    MIXED_POSTER_GRID.stackGap,
}
const MIXED_POSTER_LANDSCAPE_WIDTH =
  MIXED_POSTER_GRID.columnWidth * 2 + MIXED_POSTER_GRID.columnGap
const STORY_LAYOUT = {
  portrait: [
    { x: 42, y: 405, width: 492, height: 656 },
    { x: 546, y: 405, width: 492, height: 656 },
    { x: 42, y: 1073, width: 492, height: 656 },
    { x: 546, y: 1073, width: 492, height: 656 },
  ],
  landscape: [
    { x: 42, y: 560, width: 492, height: 288 },
    { x: 546, y: 560, width: 492, height: 288 },
    { x: 42, y: 860, width: 492, height: 288 },
    { x: 546, y: 860, width: 492, height: 288 },
    { x: 42, y: 1160, width: 492, height: 288 },
    { x: 546, y: 1160, width: 492, height: 288 },
    { x: 42, y: 1460, width: 492, height: 288 },
    { x: 546, y: 1460, width: 492, height: 288 },
  ],
}
const POSTER_DESIGN_EXAMPLES = {
  color: [
    { label: 'Portrait Poster', src: '/design-examples/memory-a3-portrait.webp' },
    { label: 'Landscape Poster', src: '/design-examples/memory-a3-landscape.webp' },
    { label: 'Mixed Poster', src: '/design-examples/memory-a3-mix.webp' },
  ],
  grayscale: [
    { label: 'Portrait Poster', src: '/design-examples/memory-a3-portrait-bw.webp' },
    { label: 'Landscape Poster', src: '/design-examples/memory-a3-landscape-bw.webp' },
    { label: 'Mixed Poster', src: '/design-examples/memory-a3-mix-bw.webp' },
  ],
}
const STORY_DESIGN_EXAMPLES = [
  { label: 'Portrait Story', src: '/design-examples/story-portrait.webp' },
  { label: 'Landscape Story', src: '/design-examples/story-landscape.webp' },
]
const primaryGradientClass =
  'border border-white/20 bg-[linear-gradient(135deg,#7f1424_0%,#b91f32_55%,#e32636_100%)] text-white shadow-[0_8px_18px_rgba(127,20,36,0.22)] transition duration-150 hover:-translate-y-px hover:shadow-[0_10px_22px_rgba(127,20,36,0.28)] active:translate-y-0 active:shadow-[0_5px_12px_rgba(127,20,36,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e32636]/30'
const neutralButtonClass =
  'border border-neutral-200 bg-neutral-100 text-neutral-700 shadow-sm transition duration-150 hover:-translate-y-px hover:border-neutral-300 hover:bg-white hover:text-neutral-950 hover:shadow-[0_8px_18px_rgba(20,20,20,0.08)] active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e32636]/25'
const disabledButtonClass =
  'cursor-not-allowed border border-neutral-200 bg-stone-200 text-stone-500 shadow-none'
const primaryRoundButtonClass =
  'border border-white/20 bg-[linear-gradient(135deg,#7f1424_0%,#b91f32_55%,#e32636_100%)] text-white shadow-[0_6px_18px_rgba(127,20,36,0.26)] transition duration-150 hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(127,20,36,0.32)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(127,20,36,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e32636]/35'
const neutralRoundButtonClass =
  'border border-white/75 bg-white/92 text-neutral-800 shadow-[0_4px_14px_rgba(0,0,0,0.16)] backdrop-blur transition duration-150 hover:-translate-y-px hover:bg-white hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e32636]/30'
const POSTER_LAYOUTS = {
  portrait: [
    { x: 120, y: 760, width: 536, height: 820 },
    { x: 688, y: 760, width: 536, height: 820 },
    { x: 1256, y: 760, width: 536, height: 820 },
    { x: 1824, y: 760, width: 536, height: 820 },
    { x: 120, y: 1612, width: 536, height: 820 },
    { x: 688, y: 1612, width: 536, height: 820 },
    { x: 1256, y: 1612, width: 536, height: 820 },
    { x: 1824, y: 1612, width: 536, height: 820 },
    { x: 120, y: 2464, width: 536, height: 820 },
    { x: 688, y: 2464, width: 536, height: 820 },
    { x: 1256, y: 2464, width: 536, height: 820 },
    { x: 1824, y: 2464, width: 536, height: 820 },
  ],
  landscape: [
    { x: 120, y: 760, width: 724, height: 607 },
    { x: 878, y: 760, width: 724, height: 607 },
    { x: 1636, y: 760, width: 724, height: 607 },
    { x: 120, y: 1399, width: 724, height: 607 },
    { x: 878, y: 1399, width: 724, height: 607 },
    { x: 1636, y: 1399, width: 724, height: 607 },
    { x: 120, y: 2038, width: 724, height: 607 },
    { x: 878, y: 2038, width: 724, height: 607 },
    { x: 1636, y: 2038, width: 724, height: 607 },
    { x: 120, y: 2677, width: 724, height: 607 },
    { x: 878, y: 2677, width: 724, height: 607 },
    { x: 1636, y: 2677, width: 724, height: 607 },
  ],
  mixed: [
    {
      x: MIXED_POSTER_GRID_X.column1,
      y: MIXED_POSTER_GRID_Y.top,
      width: MIXED_POSTER_GRID.columnWidth,
      height: MIXED_POSTER_GRID.tallPortraitHeight,
      orientation: 'portrait',
    },
    {
      x: MIXED_POSTER_GRID_X.column2,
      y: MIXED_POSTER_GRID_Y.top,
      width: MIXED_POSTER_LANDSCAPE_WIDTH,
      height: MIXED_POSTER_GRID.landscapeHeight,
      orientation: 'landscape',
    },
    {
      x: MIXED_POSTER_GRID_X.column2,
      y: MIXED_POSTER_GRID_Y.topLandscape2,
      width: MIXED_POSTER_LANDSCAPE_WIDTH,
      height: MIXED_POSTER_GRID.landscapeHeight,
      orientation: 'landscape',
    },
    {
      x: MIXED_POSTER_GRID_X.column4,
      y: MIXED_POSTER_GRID_Y.top,
      width: MIXED_POSTER_GRID.columnWidth,
      height: MIXED_POSTER_GRID.tallPortraitHeight,
      orientation: 'portrait',
    },
    {
      x: MIXED_POSTER_GRID_X.column1,
      y: MIXED_POSTER_GRID_Y.middle,
      width: MIXED_POSTER_GRID.columnWidth,
      height: MIXED_POSTER_GRID.middlePortraitHeight,
      orientation: 'portrait',
    },
    {
      x: MIXED_POSTER_GRID_X.column2,
      y: MIXED_POSTER_GRID_Y.middle,
      width: MIXED_POSTER_GRID.columnWidth,
      height: MIXED_POSTER_GRID.middlePortraitHeight,
      orientation: 'portrait',
    },
    {
      x: MIXED_POSTER_GRID_X.column3,
      y: MIXED_POSTER_GRID_Y.middle,
      width: MIXED_POSTER_GRID.columnWidth,
      height: MIXED_POSTER_GRID.middlePortraitHeight,
      orientation: 'portrait',
    },
    {
      x: MIXED_POSTER_GRID_X.column4,
      y: MIXED_POSTER_GRID_Y.middle,
      width: MIXED_POSTER_GRID.columnWidth,
      height: MIXED_POSTER_GRID.middlePortraitHeight,
      orientation: 'portrait',
    },
    {
      x: MIXED_POSTER_GRID_X.column1,
      y: MIXED_POSTER_GRID_Y.bottom,
      width: MIXED_POSTER_GRID.columnWidth,
      height: MIXED_POSTER_GRID.tallPortraitHeight,
      orientation: 'portrait',
    },
    {
      x: MIXED_POSTER_GRID_X.column2,
      y: MIXED_POSTER_GRID_Y.bottom,
      width: MIXED_POSTER_LANDSCAPE_WIDTH,
      height: MIXED_POSTER_GRID.landscapeHeight,
      orientation: 'landscape',
    },
    {
      x: MIXED_POSTER_GRID_X.column2,
      y: MIXED_POSTER_GRID_Y.bottomLandscape2,
      width: MIXED_POSTER_LANDSCAPE_WIDTH,
      height: MIXED_POSTER_GRID.landscapeHeight,
      orientation: 'landscape',
    },
    {
      x: MIXED_POSTER_GRID_X.column4,
      y: MIXED_POSTER_GRID_Y.bottom,
      width: MIXED_POSTER_GRID.columnWidth,
      height: MIXED_POSTER_GRID.tallPortraitHeight,
      orientation: 'portrait',
    },
  ],
}

type CanvasImageResource = {
  image: HTMLImageElement
  objectUrl: string
}

type DesignFormat = 'poster' | 'story'
type GalleryView = 'photos' | 'guestbook' | 'designs' | 'downloads'
type DesignMode =
  | 'posterPortrait'
  | 'posterLandscape'
  | 'posterMixed'
  | 'storyPortrait'
  | 'storyLandscape'
type PhotoOrientation = 'landscape' | 'portrait' | 'neutral'

type FaceFocus = {
  x: number
  y: number
}

type PosterPhoto = {
  image: HTMLImageElement
  originalIndex: number
  orientation: PhotoOrientation
  ratio: number
  focus?: FaceFocus
}

type PhotoMetrics = {
  orientation: PhotoOrientation
  ratio: number
}

const DESIGN_MODE_CONFIG: Record<
  DesignMode,
  {
    allowedOrientations: PhotoOrientation[]
    format: DesignFormat
    max: number
  }
> = {
  posterLandscape: {
    allowedOrientations: ['landscape', 'neutral'],
    format: 'poster',
    max: 12,
  },
  posterMixed: {
    allowedOrientations: ['landscape', 'portrait'],
    format: 'poster',
    max: 12,
  },
  posterPortrait: {
    allowedOrientations: ['portrait', 'neutral'],
    format: 'poster',
    max: 12,
  },
  storyLandscape: {
    allowedOrientations: ['landscape', 'neutral'],
    format: 'story',
    max: 8,
  },
  storyPortrait: {
    allowedOrientations: ['portrait', 'neutral'],
    format: 'story',
    max: 4,
  },
}

function getPhotoMetricsFromImage(image: HTMLImageElement): PhotoMetrics {
  const ratio = getImageRatio(image)

  return {
    orientation: getPhotoOrientation(ratio),
    ratio,
  }
}

function getFallbackPhotoMetrics(): PhotoMetrics {
  return {
    orientation: 'neutral',
    ratio: 1,
  }
}

type FaceDetectorResult = {
  boundingBox: DOMRectReadOnly
}

type FaceDetectorConstructor = new (options?: {
  fastMode?: boolean
  maxDetectedFaces?: number
}) => {
  detect(image: CanvasImageSource): Promise<FaceDetectorResult[]>
}

function sanitizeDownloadName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
}

function loadCanvasImage(url: string): Promise<CanvasImageResource> {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Afbeelding kon niet worden geladen (${response.status}).`)
      }

      return response.blob()
    })
    .then(
      (blob) =>
        new Promise<CanvasImageResource>((resolve, reject) => {
          const objectUrl = window.URL.createObjectURL(blob)
          const image = new window.Image()

          image.onload = () => resolve({ image, objectUrl })
          image.onerror = () => {
            window.URL.revokeObjectURL(objectUrl)
            reject(new Error('Afbeelding kon niet in de poster worden geplaatst.'))
          }
          image.src = objectUrl
        })
    )
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const scaledWidth = image.naturalWidth * scale
  const scaledHeight = image.naturalHeight * scale
  const sourceX = x + (width - scaledWidth) / 2
  const sourceY = y + (height - scaledHeight) / 2

  context.drawImage(image, sourceX, sourceY, scaledWidth, scaledHeight)
}

function drawFocusedCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  focus?: FaceFocus
) {
  const imageWidth = image.naturalWidth || image.width
  const imageHeight = image.naturalHeight || image.height
  const scale = Math.max(width / imageWidth, height / imageHeight)
  const scaledWidth = imageWidth * scale
  const scaledHeight = imageHeight * scale
  const focusX = focus ? focus.x * scaledWidth : scaledWidth / 2
  const focusY = focus ? focus.y * scaledHeight : scaledHeight / 2
  const minX = x + width - scaledWidth
  const minY = y + height - scaledHeight
  const sourceX = Math.min(x, Math.max(minX, x + width / 2 - focusX))
  const sourceY = Math.min(y, Math.max(minY, y + height / 2 - focusY))

  context.drawImage(image, sourceX, sourceY, scaledWidth, scaledHeight)
}

function drawContainImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight)
  const scaledWidth = image.naturalWidth * scale
  const scaledHeight = image.naturalHeight * scale
  const targetX = x + (width - scaledWidth) / 2
  const targetY = y + (height - scaledHeight) / 2

  context.drawImage(image, targetX, targetY, scaledWidth, scaledHeight)
}

function getImageRatio(image: HTMLImageElement) {
  const width = image.naturalWidth || image.width
  const height = image.naturalHeight || image.height

  return width && height ? width / height : 1
}

function getPhotoOrientation(ratio: number): PhotoOrientation {
  if (ratio > ORIENTATION_CONFIG.landscapeMinRatio) return 'landscape'
  if (ratio < ORIENTATION_CONFIG.portraitMaxRatio) return 'portrait'
  return 'neutral'
}

function formatEventDateForShell(value: string | null, locale: Locale) {
  if (!value) return ''

  const dateParts = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  const date = dateParts
    ? new Date(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3]))
    : new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatSuitablePhotoShortage(count: number, required: number, locale: Locale) {
  if (locale === 'en') {
    return `${count} suitable photos are available. This design needs ${required} photos.`
  }

  if (locale === 'fr') {
    return `${count} photos adaptées sont disponibles. Cette création nécessite ${required} photos.`
  }

  if (locale === 'de') {
    return `${count} passende Fotos sind verfügbar. Für dieses Design werden ${required} Fotos benötigt.`
  }

  if (locale === 'tr') {
    return `${count} uygun fotograf var. Bu tasarim icin ${required} fotograf gerekiyor.`
  }

  return `Er zijn ${count} geschikte foto's beschikbaar. Voor dit ontwerp zijn ${required} foto's nodig.`
}

function GalleryNavIcon({ icon }: { icon: GalleryView }) {
  if (icon === 'photos') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
        <path d="M4 8.5h3.3l1.4-2h6.6l1.4 2H20v9H4v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }

  if (icon === 'guestbook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
        <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H19v13.5H7.5A2.5 2.5 0 0 0 5 20V6.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 9.5c1.2-1.7 4.8-1.7 6 0 1 1.5-.4 3.1-3 4.7-2.6-1.6-4-3.2-3-4.7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    )
  }

  if (icon === 'designs') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
        <path d="M5 5h6v6H5V5Zm8 2h6m-6 4h6M5 15h14v4H5v-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="m17.5 3 .5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5.5-1.2Z" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
      <path d="M12 4v10m0 0 4-4m-4 4-4-4M5 18.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

async function detectFaceFocus(image: HTMLImageElement): Promise<FaceFocus | undefined> {
  const faceDetector = (window as Window & { FaceDetector?: FaceDetectorConstructor }).FaceDetector

  if (!faceDetector) return undefined

  try {
    const detector = new faceDetector({ fastMode: true, maxDetectedFaces: 8 })
    const faces = await detector.detect(image)

    if (faces.length === 0) return undefined

    const bounds = faces.reduce(
      (accumulator, face) => {
        const box = face.boundingBox

        return {
          bottom: Math.max(accumulator.bottom, box.y + box.height),
          left: Math.min(accumulator.left, box.x),
          right: Math.max(accumulator.right, box.x + box.width),
          top: Math.min(accumulator.top, box.y),
        }
      },
      {
        bottom: Number.NEGATIVE_INFINITY,
        left: Number.POSITIVE_INFINITY,
        right: Number.NEGATIVE_INFINITY,
        top: Number.POSITIVE_INFINITY,
      }
    )
    const width = image.naturalWidth || image.width
    const height = image.naturalHeight || image.height

    if (!width || !height) return undefined

    return {
      x: Math.min(1, Math.max(0, (bounds.left + bounds.right) / 2 / width)),
      y: Math.min(1, Math.max(0, (bounds.top + bounds.bottom) / 2 / height)),
    }
  } catch {
    return undefined
  }
}

function drawPosterTitle(
  context: CanvasRenderingContext2D,
  title: string,
  x: number,
  y: number,
  maxWidth: number
) {
  const words = title.trim().split(/\s+/)
  const lines: string[] = []
  let currentLine = ''

  context.fillStyle = '#fff'
  context.font = '700 58px Arial, sans-serif'

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word

    if (context.measureText(candidate).width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = candidate
    }

    if (lines.length === 2) break
  }

  if (currentLine && lines.length < 2) {
    lines.push(currentLine)
  }

  const lineHeight = 70

  lines.slice(0, 2).forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight)
  })

  return y + Math.max(1, lines.length) * lineHeight
}

function drawPhotoSlot(
  context: CanvasRenderingContext2D,
  photo: PosterPhoto,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: { fit?: 'smart' | 'cover' }
) {
  const { image } = photo
  const imageWidth = image.naturalWidth || image.width
  const imageHeight = image.naturalHeight || image.height
  const fit = options?.fit || 'smart'
  const slotRatio = width / height
  const imageRatio = imageWidth && imageHeight ? imageWidth / imageHeight : slotRatio
  const ratioDelta = Math.abs(Math.log(imageRatio / slotRatio))
  const canUseSoftCrop = fit === 'cover' || ratioDelta <= ORIENTATION_CONFIG.softCropMaxDelta

  context.save()
  context.beginPath()
  context.rect(x, y, width, height)
  context.clip()

  if (canUseSoftCrop) {
    drawFocusedCoverImage(context, image, x, y, width, height, photo.focus)
  } else {
    drawContainImage(context, image, x, y, width, height)
  }
  context.restore()
}

function applyCanvasGrayscale(context: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = context.getImageData(0, 0, width, height)
  const { data } = imageData

  for (let index = 0; index < data.length; index += 4) {
    const gray = Math.round(data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114)
    data[index] = gray
    data[index + 1] = gray
    data[index + 2] = gray
  }

  context.putImageData(imageData, 0, 0)
}

function hasTransparentPixelsInArea(
  image: HTMLImageElement,
  area: { x: number; y: number; width: number; height: number }
) {
  const canvas = document.createElement('canvas')
  canvas.width = POSTER_WIDTH
  canvas.height = POSTER_HEIGHT

  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context) return true

  drawContainImage(context, image, 0, 0, POSTER_WIDTH, POSTER_HEIGHT)

  const data = context.getImageData(area.x, area.y, area.width, area.height).data
  const sampleStride = 80
  let transparentSamples = 0
  let totalSamples = 0

  for (let index = 3; index < data.length; index += sampleStride) {
    totalSamples += 1

    if (data[index] < 245) {
      transparentSamples += 1
    }
  }

  return totalSamples === 0 || transparentSamples / totalSamples > 0.01
}

function drawPosterGrid(
  context: CanvasRenderingContext2D,
  photos: PosterPhoto[],
  mode: Extract<DesignMode, 'posterPortrait' | 'posterLandscape' | 'posterMixed'>,
  _options?: { grayscale?: boolean }
) {
  if (mode === 'posterMixed') {
    const portraitPhotos = photos.filter((photo) => photo.orientation === 'portrait')
    const landscapePhotos = photos.filter((photo) => photo.orientation === 'landscape')
    let portraitIndex = 0
    let landscapeIndex = 0

    POSTER_LAYOUTS.mixed.forEach((slot) => {
      const photo =
        slot.orientation === 'portrait'
          ? portraitPhotos[portraitIndex++]
          : landscapePhotos[landscapeIndex++]

      if (!photo) return

      drawPhotoSlot(context, photo, slot.x, slot.y, slot.width, slot.height, {
        fit: 'cover',
      })
    })
    return
  }

  const slots =
    mode === 'posterPortrait' ? POSTER_LAYOUTS.portrait : POSTER_LAYOUTS.landscape

  photos.slice(0, POSTER_MAX_TILES).forEach((photo, index) => {
    const slot = slots[index]

    if (!slot) return

    drawPhotoSlot(context, photo, slot.x, slot.y, slot.width, slot.height, {
      fit: mode === 'posterLandscape' ? 'cover' : 'smart',
    })
  })
}

function drawStoryGrid(
  context: CanvasRenderingContext2D,
  photos: PosterPhoto[],
  mode: Extract<DesignMode, 'storyPortrait' | 'storyLandscape'>,
  _options?: { grayscale?: boolean }
) {
  const slots = mode === 'storyPortrait' ? STORY_LAYOUT.portrait : STORY_LAYOUT.landscape
  const visiblePhotos = photos.slice(0, slots.length)

  visiblePhotos.forEach((photo, index) => {
    const slot = slots[index]

    if (!slot) return

    drawPhotoSlot(context, photo, slot.x, slot.y, slot.width, slot.height, {
      fit: 'cover',
    })
  })
}

export default function Page() {
  const { t, locale, setLocale } = useLanguage()
  const params = useParams()
  const eventIdentifier = params.id as string
  const initializedLocaleForEventRef = useRef('')

  const [items, setItems] = useState<UploadRecord[]>([])
  const [currentEvent, setCurrentEvent] = useState<NormalizedEvent | null>(null)
  const [eventName, setEventName] = useState('Gedeelde evenementgalerij')
  const [selected, setSelected] = useState<string[]>([])
  const [photoTabSelected, setPhotoTabSelected] = useState<string[]>([])
  const [statusMessage, setStatusMessage] = useState(t.gallery.loading)
  const [deletingSelected, setDeletingSelected] = useState(false)
  const [downloadingSelected, setDownloadingSelected] = useState(false)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [creatingPoster, setCreatingPoster] = useState(false)
  const [designFormat, setDesignFormat] = useState<DesignFormat | null>('poster')
  const [designMode, setDesignMode] = useState<DesignMode | null>(null)
  const [posterGrayscale, setPosterGrayscale] = useState(false)
  const [designExamplesOpen, setDesignExamplesOpen] = useState(false)
  const [galleryView, setGalleryView] = useState<GalleryView>('photos')
  const [standaloneGuestbookMessages, setStandaloneGuestbookMessages] = useState<
    GuestbookStandaloneRecord[]
  >([])
  const [photoMetricsById, setPhotoMetricsById] = useState<Record<string, PhotoMetrics>>({})
  const [albumPackagesVisible, setAlbumPackagesVisible] = useState(false)
  const [previewItem, setPreviewItem] = useState<UploadRecord | null>(null)
  const guestbookEnabled = currentEvent?.guestbookEnabled !== false

  useEffect(() => {
    if (!currentEvent) return
    if (initializedLocaleForEventRef.current === eventIdentifier) return

    const requestedLocale = new URLSearchParams(window.location.search).get('lang')
    let storedLocale: string | null = null

    try {
      storedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    } catch {
      storedLocale = null
    }

    setLocale(
      requestedLocale && locales.includes(requestedLocale as Locale)
        ? requestedLocale as Locale
        : storedLocale && locales.includes(storedLocale as Locale)
          ? storedLocale as Locale
        : currentEvent.defaultLocale,
      { persist: false }
    )
    initializedLocaleForEventRef.current = eventIdentifier
  }, [currentEvent, eventIdentifier, setLocale])

  useEffect(() => {
    setStatusMessage(t.gallery.loading)
  }, [t.gallery.loading])

  useEffect(() => {
    if (!guestbookEnabled && galleryView === 'guestbook') {
      setGalleryView('photos')
    }
  }, [galleryView, guestbookEnabled])

  useEffect(() => {
    const load = async () => {
      const idLookup = await supabase
        .from('events')
        .select('*')
        .eq('id', eventIdentifier)
        .single()

      const slugLookup =
        idLookup.error && !idLookup.data
          ? await supabase
              .from('events')
              .select('*')
              .eq('slug', eventIdentifier)
              .single()
          : null

      const event = idLookup.data || slugLookup?.data || null
      const normalizedEvent = normalizeEventRecord(event)

      if (!normalizedEvent) {
        setStatusMessage(t.gallery.notFound)
        return
      }

      setCurrentEvent(normalizedEvent)

      const { data: uploads, error: uploadsError } = await supabase
        .from('uploads')
        .select('*')
        .eq('event_id', normalizedEvent.id)
        .order('created_at', { ascending: false })

      if (uploadsError) {
        console.error('Failed to load uploads', uploadsError)
        setStatusMessage(t.gallery.loadError)
        return
      }

      const activeUploads = (uploads || []) as UploadRecord[]

      setItems(activeUploads)
      setEventName(normalizedEvent?.albumName || normalizedEvent?.name || 'Gedeelde evenementgalerij')
      setStatusMessage(
        activeUploads.length === 0
          ? t.gallery.noUploads
          : `${activeUploads.length} ${t.gallery.showing}`
      )
    }

    void load()
  }, [eventIdentifier, t.gallery.loadError, t.gallery.noUploads, t.gallery.notFound, t.gallery.showing])

  useEffect(() => {
    const loadBranding = async () => {
      if (!currentEvent?.id) return
      if (
        currentEvent.coverImageUrl &&
        currentEvent.backgroundImageUrl &&
        currentEvent.posterTemplateUrl &&
        currentEvent.storyTemplateUrl
      ) return

      try {
        const response = await fetch(
          `/api/public-events/branding?identifier=${encodeURIComponent(eventIdentifier)}`,
          { cache: 'no-store' }
        )

        if (!response.ok) return

        const payload = (await response.json()) as {
          coverImageUrl?: string
          backgroundImageUrl?: string
          posterTemplateUrl?: string
          storyTemplateUrl?: string
        }

        if (!payload.coverImageUrl && !payload.backgroundImageUrl && !payload.posterTemplateUrl && !payload.storyTemplateUrl) return

        setCurrentEvent((prev) =>
          prev
            ? {
                ...prev,
                coverImageUrl: payload.coverImageUrl || prev.coverImageUrl,
                backgroundImageUrl:
                  payload.backgroundImageUrl || prev.backgroundImageUrl,
                posterTemplateUrl:
                  payload.posterTemplateUrl || prev.posterTemplateUrl,
                storyTemplateUrl:
                  payload.storyTemplateUrl || prev.storyTemplateUrl,
              }
            : prev
        )
      } catch (error) {
        console.error('Failed to load event branding', error)
      }
    }

    void loadBranding()
  }, [
    currentEvent?.backgroundImageUrl,
    currentEvent?.coverImageUrl,
    currentEvent?.id,
    currentEvent?.posterTemplateUrl,
    currentEvent?.storyTemplateUrl,
    eventIdentifier,
  ])

  useEffect(() => {
    const loadGuestbookMessages = async () => {
      if (!currentEvent?.id) return
      if (!guestbookEnabled) {
        setStandaloneGuestbookMessages([])
        return
      }

      try {
        const response = await fetch(
          `/api/guestbook-messages?event=${encodeURIComponent(eventIdentifier)}`,
          { cache: 'no-store' }
        )
        const payload = (await response.json()) as {
          messages?: GuestbookStandaloneRecord[]
        }

        if (!response.ok) return

        setStandaloneGuestbookMessages(payload.messages || [])
      } catch (error) {
        console.error('Failed to load guestbook messages', error)
      }
    }

    void loadGuestbookMessages()
  }, [currentEvent?.id, eventIdentifier, guestbookEnabled])

  const selectedItems = useMemo(
    () => items.filter((item) => selected.includes(item.id)),
    [items, selected]
  )
  const designModeConfig = designMode ? DESIGN_MODE_CONFIG[designMode] : null
  const activeDesignFormat = designFormat || 'poster'
  const isLikelyPhotoStrip = (item: UploadRecord) => {
    const metrics = photoMetricsById[item.id]

    return Boolean(metrics && metrics.ratio <= 1 / PHOTOSTRIP_MIN_HEIGHT_RATIO)
  }
  const designItems = useMemo(
    () => items.filter((item) => !isLikelyPhotoStrip(item)),
    [items, photoMetricsById]
  )
  const isDesignItemCompatibleWithActiveMode = (item: UploadRecord) => {
    if (!designMode || !designModeConfig) return false
    if (designMode === 'posterMixed') return true

    const metrics = photoMetricsById[item.id]
    if (!metrics) return true

    return designModeConfig.allowedOrientations.includes(metrics.orientation)
  }
  const activeDesignItems = useMemo(
    () => designItems.filter((item) => isDesignItemCompatibleWithActiveMode(item)),
    [designItems, designMode, designModeConfig, photoMetricsById]
  )
  const designSelectedItems = useMemo(
    () => selectedItems.filter((item) => !isLikelyPhotoStrip(item)),
    [photoMetricsById, selectedItems]
  )
  const activeDesignSelectedItems = useMemo(
    () => designSelectedItems.filter((item) => isDesignItemCompatibleWithActiveMode(item)),
    [designMode, designModeConfig, designSelectedItems, photoMetricsById]
  )

  const guestbookFeedItems = useMemo(
    () =>
      buildGuestbookEntries({
        sort: 'newest',
        standaloneMessages: standaloneGuestbookMessages,
        uploads: items,
      }),
    [items, standaloneGuestbookMessages]
  )

  const shareSequenceById = useMemo(() => {
    const sorted = [...items].sort((left, right) => {
      const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0
      const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0

      if (leftTime === rightTime) {
        return left.id.localeCompare(right.id)
      }

      return leftTime - rightTime
    })

    return sorted.reduce<Record<string, number>>((accumulator, item, index) => {
      accumulator[item.id] = index + 1
      return accumulator
    }, {})
  }, [items])

  const uploadPageUrl = useMemo(
    () => `/event/${eventIdentifier}?lang=${locale}`,
    [eventIdentifier, locale]
  )

  const selectedLimit = 100
  // Keep ZIPs small enough for serverless runtimes and mobile browsers.
  // Large in-memory blobs can otherwise look as if the button does nothing.
  const albumPackageSize = 40
  const shareEnabled = currentEvent?.allowGuestShare !== false
  const downloadEnabled = currentEvent?.allowGuestDownload !== false
  const albumDownloadEnabled = currentEvent?.allowAlbumDownload !== false
  const deleteEnabled = currentEvent?.allowGuestDelete === true
  const posterEnabled = currentEvent?.allowGuestPoster === true
  const downloadInProgress = downloadingSelected || downloadingAll || creatingPoster
  const totalAlbumPackages = Math.max(1, Math.ceil(items.length / albumPackageSize))
  const albumPackageButtonLabel =
    items.length <= albumPackageSize
      ? t.gallery.downloadAll
      : `${t.gallery.downloadAll} (${totalAlbumPackages} ZIP)`
  const albumPackages = useMemo(
    () => Array.from({ length: totalAlbumPackages }, (_, packageIndex) => {
      const packageStart = packageIndex * albumPackageSize
      const packageEnd = Math.min(packageStart + albumPackageSize, items.length)

      return {
        end: packageEnd,
        index: packageIndex,
        items: items.slice(packageStart, packageEnd),
        label: `${t.gallery.albumPackageLabel} ${packageIndex + 1} (${packageStart + 1}-${packageEnd})`,
        start: packageStart + 1,
      }
    }),
    [albumPackageSize, items, t.gallery.albumPackageLabel, totalAlbumPackages]
  )
  const selectedDesignMetrics = activeDesignSelectedItems.map(
    (item) => photoMetricsById[item.id] || getFallbackPhotoMetrics()
  )
  const selectedPortraitCount = selectedDesignMetrics.filter(
    (metrics) => metrics.orientation === 'portrait'
  ).length
  const selectedLandscapeCount = selectedDesignMetrics.filter(
    (metrics) => metrics.orientation === 'landscape'
  ).length
  const designModeLimit = designModeConfig?.max || selectedLimit
  const designModeLabel =
    designMode === 'posterPortrait'
      ? t.gallery.posterPortraitMode
      : designMode === 'posterLandscape'
        ? t.gallery.posterLandscapeMode
        : designMode === 'posterMixed'
          ? t.gallery.posterMixedMode
          : designMode === 'storyPortrait'
            ? t.gallery.storyPortraitMode
            : designMode === 'storyLandscape'
              ? t.gallery.storyLandscapeMode
              : ''
  const designSelectedCount = Math.min(activeDesignSelectedItems.length, designModeLimit)
  const designLimitReached = Boolean(designMode && activeDesignSelectedItems.length >= designModeLimit)
  const mixedPosterReady =
    designMode === 'posterMixed' &&
    selectedPortraitCount === MIXED_POSTER_PORTRAIT_TILES &&
    selectedLandscapeCount === MIXED_POSTER_LANDSCAPE_TILES
  const designReady = Boolean(
    designMode &&
      (designMode === 'posterMixed'
        ? mixedPosterReady
        : activeDesignSelectedItems.length === designModeLimit)
  )
  const designRemainingCount = Math.max(0, designModeLimit - designSelectedCount)
  const suitablePhotoShortageText =
    designMode && activeDesignItems.length < designModeLimit
      ? formatSuitablePhotoShortage(activeDesignItems.length, designModeLimit, locale)
      : ''
  const designIncompleteText =
    designMode === 'posterMixed'
      ? t.gallery.designMixedIncomplete
      : designRemainingCount > 0
        ? `${designRemainingCount} ${t.gallery.posterMoreNeeded}`
        : ''
  const designExamples =
    activeDesignFormat === 'poster'
      ? posterGrayscale
        ? POSTER_DESIGN_EXAMPLES.grayscale
        : POSTER_DESIGN_EXAMPLES.color
      : STORY_DESIGN_EXAMPLES

  const getPhotoMetrics = (item: UploadRecord) =>
    photoMetricsById[item.id] || getFallbackPhotoMetrics()

  const getOrientationBlockedMessage = (orientation: PhotoOrientation) => {
    if (!designMode || !designModeConfig) return ''

    if (designMode === 'posterMixed' && orientation === 'neutral') {
      return t.gallery.designNeutralDisabled
    }

    if (designModeConfig.allowedOrientations.includes(orientation)) return ''

    return orientation === 'portrait'
      ? t.gallery.designPortraitFitsBetter
      : t.gallery.designLandscapeFitsBetter
  }

  const getSelectionBlockMessage = (item: UploadRecord) => {
    if (designFormat && !designMode) return t.gallery.designChooseMode
    if (!designMode || !designModeConfig) return ''

    const metrics = photoMetricsById[item.id]

    if (designMode === 'posterMixed' && !metrics) {
      return t.gallery.designOrientationPending
    }

    const orientation = (metrics || getFallbackPhotoMetrics()).orientation
    const orientationMessage = getOrientationBlockedMessage(orientation)

    if (orientationMessage) return orientationMessage

    if (designMode === 'posterMixed') {
      if (
        orientation === 'portrait' &&
        selectedPortraitCount >= MIXED_POSTER_PORTRAIT_TILES
      ) {
        return t.gallery.designPortraitLimitReached
      }

      if (
        orientation === 'landscape' &&
        selectedLandscapeCount >= MIXED_POSTER_LANDSCAPE_TILES
      ) {
        return t.gallery.designLandscapeLimitReached
      }
    }

    if (activeDesignSelectedItems.length >= designModeLimit) {
      return t.gallery.designLimitReached
    }

    return ''
  }

  const registerPhotoMetrics = (item: UploadRecord, image: HTMLImageElement) => {
    const nextMetrics = getPhotoMetricsFromImage(image)

    setPhotoMetricsById((prev) => {
      const current = prev[item.id]

      if (
        current &&
        current.orientation === nextMetrics.orientation &&
        Math.abs(current.ratio - nextMetrics.ratio) < 0.001
      ) {
        return prev
      }

      return {
        ...prev,
        [item.id]: nextMetrics,
      }
    })
  }

  const resetDesignSelection = () => {
    setSelected([])
  }

  const chooseDesignFormat = (format: DesignFormat) => {
    if (designFormat === format && !designMode) return

    if ((designFormat || designMode) && selected.length > 0) {
      const confirmed = window.confirm(t.gallery.designSwitchConfirm)

      if (!confirmed) return

      resetDesignSelection()
    } else if (designMode) {
      setDesignMode(null)
    }

    setDesignFormat(format)
    setDesignMode(null)
    setStatusMessage(
      format === 'poster' ? t.gallery.designChoosePosterMode : t.gallery.designChooseStoryMode
    )
  }

  const chooseDesignMode = (mode: DesignMode) => {
    if (designMode === mode) return

    if (selected.length > 0) {
      const confirmed = window.confirm(t.gallery.designSwitchConfirm)

      if (!confirmed) return

      resetDesignSelection()
    }

    setDesignFormat(DESIGN_MODE_CONFIG[mode].format)
    setDesignMode(mode)
    const nextLabel =
      mode === 'posterPortrait'
        ? t.gallery.posterPortraitMode
        : mode === 'posterLandscape'
          ? t.gallery.posterLandscapeMode
          : mode === 'posterMixed'
            ? t.gallery.posterMixedMode
            : mode === 'storyPortrait'
              ? t.gallery.storyPortraitMode
              : t.gallery.storyLandscapeMode

    setStatusMessage(
      mode === 'posterMixed'
        ? t.gallery.designMixedHint
        : `${nextLabel} — 0 / ${DESIGN_MODE_CONFIG[mode].max} ${t.gallery.designSelected}`
    )
  }

  const clearDesignSelection = () => {
    setSelected([])
    setStatusMessage(t.gallery.clearSelection)
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id)
      }

      const item = items.find((candidate) => candidate.id === id)

      if (!item) return prev

      const blockMessage = galleryView === 'designs' ? getSelectionBlockMessage(item) : ''

      if (blockMessage) {
        setStatusMessage(blockMessage)
        return prev
      }

      if (prev.length >= selectedLimit) {
        setStatusMessage(t.gallery.selectionLimitReached)
        return prev
      }

      return [...prev, id]
    })
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Download mislukt met status ${response.status}.`)
      }

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')

      anchor.href = blobUrl
      anchor.download = filename
      anchor.click()

      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download failed', error)
      setStatusMessage(
        error instanceof Error ? error.message : t.gallery.loadError
      )
    }
  }

  const saveBlob = (blob: Blob, filename: string) => {
    const blobUrl = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = blobUrl
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()

    window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000)
  }

  const downloadZip = async (options: {
    all?: boolean
    packageNumber?: number
    zipItems?: UploadRecord[]
  }) => {
    const zipItems = options.zipItems || (options.all ? items : selectedItems)

    if (zipItems.length === 0) {
      setStatusMessage(t.gallery.chooseBeforeDownload)
      return
    }

    try {
      const params = new URLSearchParams({
        all: options.all === true ? 'true' : 'false',
        eventIdentifier,
      })

      if (options.packageNumber) {
        params.set('albumPackage', 'true')
        params.set('packageNumber', String(options.packageNumber))
      }

      if (options.all !== true) {
        params.set('uploadIds', zipItems.map((item) => item.id).join(','))
      }

      const anchor = document.createElement('a')
      anchor.href = `/api/gallery-download?${params.toString()}`
      anchor.rel = 'noopener'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()

      setStatusMessage(
        options.all ? t.gallery.allDownloaded : `${zipItems.length} ${t.gallery.downloaded}`
      )
    } catch (error) {
      console.error('ZIP download failed', error)
      setStatusMessage(
        error instanceof Error ? error.message : t.gallery.loadError
      )
      throw error
    }
  }

  const downloadSelected = async () => {
    if (selectedItems.length === 0 || downloadingSelected) {
      setStatusMessage(t.gallery.chooseBeforeDownload)
      return
    }

    setDownloadingSelected(true)

    try {
      await downloadZip({ all: false })
    } finally {
      setDownloadingSelected(false)
    }
  }

  const downloadAll = async () => {
    if (items.length === 0 || downloadingAll) return

    if (items.length > albumPackageSize) {
      setAlbumPackagesVisible(true)
      setStatusMessage(
        t.gallery.albumPackageReady.replace('{count}', String(totalAlbumPackages))
      )
      return
    }

    setDownloadingAll(true)
    setStatusMessage(t.gallery.downloadingAll)

    try {
      await downloadZip({ all: true })
    } finally {
      setDownloadingAll(false)
    }
  }

  const downloadAlbumPackage = async (packageIndex: number, packageItems: UploadRecord[]) => {
    if (packageItems.length === 0 || downloadingAll) return

    setDownloadingAll(true)
    setStatusMessage(`${t.gallery.downloadingAll} ${packageIndex + 1}/${totalAlbumPackages}`)

    try {
      await downloadZip({
        all: false,
        packageNumber: packageIndex + 1,
        zipItems: packageItems,
      })
    } finally {
      setDownloadingAll(false)
    }
  }

  const createPoster = async (options?: { grayscale?: boolean; mode?: DesignMode }) => {
    const activeMode = options?.mode || designMode

    if (!activeMode || activeDesignSelectedItems.length === 0 || creatingPoster) {
      setStatusMessage(t.gallery.posterChoose)
      return
    }

    if (activeMode === 'posterMixed' && !mixedPosterReady) {
      setStatusMessage(t.gallery.designMixedIncomplete)
      return
    }

    setCreatingPoster(true)
    const modeConfig = DESIGN_MODE_CONFIG[activeMode]
    const format = modeConfig.format
    const maxTiles = modeConfig.max

    setStatusMessage(format === 'story' ? t.gallery.storyPreparing : t.gallery.posterPreparing)

    const resources: CanvasImageResource[] = []
    let logoResource: CanvasImageResource | null = null
    let templateResource: CanvasImageResource | null = null
    let storyTemplateResource: CanvasImageResource | null = null

    try {
      if (format === 'poster' && activeDesignSelectedItems.length > POSTER_MAX_TILES) {
        window.alert(t.gallery.posterLimitPopup)
      }

      const posterPhotos: PosterPhoto[] = []
      const orderedItems =
        activeMode === 'posterMixed'
          ? [
              ...activeDesignSelectedItems.filter(
                (item) => getPhotoMetrics(item).orientation === 'portrait'
              ),
              ...activeDesignSelectedItems.filter(
                (item) => getPhotoMetrics(item).orientation === 'landscape'
              ),
            ]
          : activeDesignSelectedItems

      for (const [originalIndex, item] of orderedItems.entries()) {
        if (posterPhotos.length >= maxTiles) break

        const resource = await loadCanvasImage(item.file_url)
        const ratio = getImageRatio(resource.image)
        resources.push(resource)
        posterPhotos.push({
          focus: await detectFaceFocus(resource.image),
          image: resource.image,
          originalIndex,
          orientation: getPhotoOrientation(ratio),
          ratio,
        })
      }

      if (posterPhotos.length === 0) {
        throw new Error(t.gallery.posterNoUsablePhotos)
      }

      logoResource = await loadCanvasImage(POSTER_LOGO_URL).catch(() => null)
      templateResource = currentEvent?.posterTemplateUrl
        ? await loadCanvasImage(currentEvent.posterTemplateUrl).catch(() => null)
        : null
      storyTemplateResource = format === 'story' && currentEvent?.storyTemplateUrl
        ? await loadCanvasImage(currentEvent.storyTemplateUrl).catch(() => null)
        : null

      const canvas = document.createElement('canvas')
      canvas.width = format === 'story' ? STORY_WIDTH : POSTER_WIDTH
      canvas.height = format === 'story' ? STORY_HEIGHT : POSTER_HEIGHT

      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error(t.gallery.loadError)
      }

      const hasTemplateBackground =
        format === 'story'
          ? Boolean(storyTemplateResource || templateResource)
          : Boolean(templateResource)

      if (!hasTemplateBackground) {
        context.fillStyle = '#050505'
        context.fillRect(0, 0, canvas.width, canvas.height)
      }

      if (format === 'story') {
        if (storyTemplateResource) {
          drawContainImage(context, storyTemplateResource.image, 0, 0, STORY_WIDTH, STORY_HEIGHT)
        } else if (templateResource) {
          drawContainImage(context, templateResource.image, 0, 0, STORY_WIDTH, STORY_HEIGHT)
        }

        drawStoryGrid(
          context,
          posterPhotos,
          activeMode === 'storyLandscape' ? 'storyLandscape' : 'storyPortrait',
          { grayscale: options?.grayscale }
        )

        if (!storyTemplateResource && !templateResource) {
          context.fillStyle = 'rgba(0, 0, 0, 0.72)'
          context.fillRect(0, 0, STORY_WIDTH, 220)
          context.fillRect(0, STORY_HEIGHT - 180, STORY_WIDTH, 180)

          context.fillStyle = '#fff'
          context.font = '700 54px Arial, sans-serif'
          context.textAlign = 'center'
          context.fillText(eventName, STORY_WIDTH / 2, 115, STORY_WIDTH - 120)
          context.font = '600 30px Arial, sans-serif'
          context.fillText('Photobooth Holland', STORY_WIDTH / 2, STORY_HEIGHT - 98)
          context.fillStyle = '#F7C96B'
          context.fillText('Scan. Upload. Share.', STORY_WIDTH / 2, STORY_HEIGHT - 54)
          context.textAlign = 'left'
        }
      } else if (templateResource) {
        const templateHasPhotoWindow = hasTransparentPixelsInArea(
          templateResource.image,
          POSTER_TEMPLATE_PHOTO_AREA
        )

        if (!templateHasPhotoWindow) {
          drawContainImage(context, templateResource.image, 0, 0, POSTER_WIDTH, POSTER_HEIGHT)
        }

        drawPosterGrid(
          context,
          posterPhotos,
          activeMode === 'posterMixed'
            ? 'posterMixed'
            : activeMode === 'posterLandscape'
              ? 'posterLandscape'
              : 'posterPortrait',
          { grayscale: options?.grayscale }
        )

        if (templateHasPhotoWindow) {
          drawContainImage(context, templateResource.image, 0, 0, POSTER_WIDTH, POSTER_HEIGHT)
        }
      } else {
        drawPosterTitle(
          context,
          eventName,
          POSTER_MARGIN,
          POSTER_MARGIN + 56,
          POSTER_WIDTH - POSTER_MARGIN * 2
        )
        const footerTop =
          POSTER_HEIGHT -
          POSTER_PHOTO_AREA.bottomAreaHeight +
          (POSTER_PHOTO_AREA.bottomAreaHeight - POSTER_FOOTER_HEIGHT) / 2

        drawPosterGrid(
          context,
          posterPhotos,
          activeMode === 'posterMixed'
            ? 'posterMixed'
            : activeMode === 'posterLandscape'
              ? 'posterLandscape'
              : 'posterPortrait',
          { grayscale: options?.grayscale }
        )

        context.fillStyle = '#000'
        context.fillRect(0, footerTop, POSTER_WIDTH, POSTER_FOOTER_HEIGHT)

        if (logoResource) {
          const logoSize = 128

          context.save()
          context.beginPath()
          context.arc(
            POSTER_MARGIN + logoSize / 2,
            footerTop + POSTER_FOOTER_HEIGHT / 2,
            logoSize / 2,
            0,
            Math.PI * 2
          )
          context.clip()
          drawCoverImage(
            context,
            logoResource.image,
            POSTER_MARGIN,
            footerTop + (POSTER_FOOTER_HEIGHT - logoSize) / 2,
            logoSize,
            logoSize
          )
          context.restore()
        }

        context.fillStyle = '#fff'
        context.font = '700 42px Arial, sans-serif'
        context.fillText('Photobooth Holland', POSTER_MARGIN + 158, footerTop + 82)
        context.fillStyle = '#d9d9d9'
        context.font = '400 28px Arial, sans-serif'
        context.fillText('www.photoboothholland.com', POSTER_MARGIN + 158, footerTop + 126)
        context.textAlign = 'right'
        context.fillStyle = '#fff'
        context.font = '600 30px Arial, sans-serif'

        if (currentEvent?.eventDate) {
          context.fillText(currentEvent.eventDate, POSTER_WIDTH - POSTER_MARGIN, footerTop + 106)
        }

        context.textAlign = 'left'
      }

      if (options?.grayscale) {
        applyCanvasGrayscale(context, canvas.width, canvas.height)
      }

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })

      if (!blob) {
        throw new Error(t.gallery.loadError)
      }

      const baseName = sanitizeDownloadName(eventName || 'photobooth-poster')
      saveBlob(blob, format === 'story' ? `${baseName}-instagram-story.png` : `${baseName}-poster-a3.png`)
      void fetch('/api/gallery-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: format,
          eventIdentifier,
          itemCount: Math.min(activeDesignSelectedItems.length, maxTiles),
        }),
      })
      setStatusMessage(format === 'story' ? t.gallery.storyReady : t.gallery.posterReady)
    } catch (error) {
      console.error('Poster creation failed', error)
      setStatusMessage(error instanceof Error ? error.message : t.gallery.loadError)
    } finally {
      resources.forEach((resource) => window.URL.revokeObjectURL(resource.objectUrl))

      if (logoResource) {
        window.URL.revokeObjectURL(logoResource.objectUrl)
      }

      if (templateResource) {
        window.URL.revokeObjectURL(templateResource.objectUrl)
      }

      if (storyTemplateResource) {
        window.URL.revokeObjectURL(storyTemplateResource.objectUrl)
      }

      setCreatingPoster(false)
    }
  }

  const deleteSingle = async (item: UploadRecord) => {
    if (deletingSelected) return

    const confirmed = window.confirm(t.gallery.deleteConfirm)

    if (!confirmed) return

    setDeletingSelected(true)
    setStatusMessage(t.gallery.deleting)

    try {
      const response = await fetch(`/api/uploads/${item.id}`, {
        method: 'DELETE',
      })

      const payload = (await response.json()) as { ok?: boolean; error?: string }

      if (!response.ok) {
        throw new Error(payload.error || t.gallery.deleteError)
      }

      setItems((prev) => prev.filter((upload) => upload.id !== item.id))
      setSelected((prev) => prev.filter((id) => id !== item.id))
      setPhotoTabSelected((prev) => prev.filter((id) => id !== item.id))
      setStatusMessage(t.gallery.deleteSuccess)
    } catch (error) {
      console.error('Upload delete failed', error)
      setStatusMessage(
        error instanceof Error ? error.message : t.gallery.deleteError
      )
    } finally {
      setDeletingSelected(false)
    }
  }

  const handleShare = async (item: UploadRecord) => {
    const shareUrl = getPublicMediaUrl(
      getUploadShareKey(item, {
        eventSlug: currentEvent?.albumName || currentEvent?.name || eventIdentifier,
        sequence: shareSequenceById[item.id],
      })
    )
    const shareData = {
      title: eventName,
      text: getUploadShortFileName(item, {
        eventSlug: currentEvent?.albumName || currentEvent?.name || eventIdentifier,
        sequence: shareSequenceById[item.id],
      }),
      url: shareUrl,
    }

    try {
      const result = await shareMedia({
        fileName: shareData.text,
        fileUrl: item.file_url,
        shareUrl,
        title: shareData.title,
      })

      setStatusMessage(
        result === 'copied' ? t.gallery.shareCopied : t.gallery.shareSuccess
      )
    } catch (error) {
      console.error('Share failed', error)

      try {
        await navigator.clipboard.writeText(shareUrl)
        setStatusMessage(t.gallery.shareCopied)
      } catch {
        setStatusMessage(t.gallery.shareError)
      }
    }
  }

  const eventDateLabel = formatEventDateForShell(currentEvent?.eventDate || null, locale)
  const photoCountLabel = `${items.length} ${t.gallery.photosTab.toLowerCase()}`
  const eventMetaLabel = eventDateLabel
    ? `${eventDateLabel} · ${photoCountLabel}`
    : photoCountLabel
  const eventCoverStyle = currentEvent?.coverImageUrl
    ? { backgroundImage: `url(${currentEvent.coverImageUrl})` }
    : undefined
  const previewDownloadName = previewItem
    ? getUploadShortFileName(previewItem, {
        eventSlug: currentEvent?.albumName || currentEvent?.name || eventIdentifier,
        sequence: shareSequenceById[previewItem.id],
      })
    : ''
  const previewIndex = previewItem
    ? items.findIndex((item) => item.id === previewItem.id)
    : -1
  const previousPreviewItem = previewIndex > 0 ? items[previewIndex - 1] : null
  const nextPreviewItem =
    previewIndex >= 0 && previewIndex < items.length - 1 ? items[previewIndex + 1] : null

  useEffect(() => {
    if (!previewItem) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewItem(null)
        return
      }

      if (event.key === 'ArrowLeft' && previousPreviewItem) {
        setPreviewItem(previousPreviewItem)
      }

      if (event.key === 'ArrowRight' && nextPreviewItem) {
        setPreviewItem(nextPreviewItem)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextPreviewItem, previousPreviewItem, previewItem])

  return (
    <div className="flex min-h-screen flex-col bg-white text-stone-900">
      <main className="flex-1 px-3 pb-5 pt-3 sm:px-6 sm:pb-8 sm:pt-5">
        <div className="mx-auto w-full max-w-6xl">
        {downloadInProgress ? (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 flex items-center gap-3 rounded-2xl border border-[#e32636]/20 bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#7f1424] shadow-[0_12px_30px_rgba(61,44,22,0.12)]"
          >
            <span className="h-3 w-3 animate-pulse rounded-full bg-[#e32636]" />
            {creatingPoster
              ? t.gallery.posterPreparing
              : downloadingAll
                ? t.gallery.downloadingAll
                : t.gallery.downloadingSelected}
          </div>
        ) : !currentEvent && statusMessage ? (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-[#555] shadow-sm"
          >
            {statusMessage}
          </div>
        ) : null}

        {currentEvent ? (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Link href={uploadPageUrl} aria-label="EventDrop Sharing">
                <Image
                  src="/eventdrop-brand.png"
                  alt="EventDrop Sharing"
                  width={120}
                  height={40}
                  className="h-auto w-[92px] sm:w-[108px]"
                  priority
                />
              </Link>
              <label className="sr-only" htmlFor="gallery-language">
                Taal
              </label>
              <select
                id="gallery-language"
                value={locale}
                onChange={(event) => setLocale(event.target.value as Locale)}
                className="h-9 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-black uppercase text-neutral-700 outline-none focus:border-[#d71920] focus:ring-2 focus:ring-[#d71920]/15"
              >
                {locales.map((language) => (
                  <option key={language} value={language}>
                    {language.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div
              className="relative h-[195px] overflow-hidden rounded-[13px] bg-[#f3f4f6] bg-cover bg-center sm:h-[290px]"
              style={eventCoverStyle}
            >
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 via-black/34 to-transparent px-4 pb-4 pt-16 sm:px-5 sm:pb-5">
                <h1 className="text-[1.65rem] font-black leading-none text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)] sm:text-3xl">
                  {eventName}
                </h1>
                <p className="mt-1 text-[11px] font-semibold leading-tight text-white/85 [text-shadow:0_1px_7px_rgba(0,0,0,0.55)] sm:text-xs">
                  {eventMetaLabel}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <nav className="sticky top-0 z-30 mt-3 border-b border-neutral-200 bg-white">
          <div className="grid grid-cols-4 gap-1">
            {([
              ['photos', t.gallery.photosTab],
              ...(guestbookEnabled ? [['guestbook', t.gallery.guestbookTab] as const] : []),
              ['designs', t.gallery.designsTab],
              ['downloads', t.gallery.downloadsTab],
            ] as const).map(([view, label]) => (
              <button
                key={view}
                type="button"
                onClick={() => setGalleryView(view)}
                className={`relative flex flex-col items-center gap-1 px-1 pb-2.5 pt-2 text-[11px] font-black transition outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[#d71920]/25 sm:text-sm ${
                  galleryView === view
                    ? 'text-[#d71920]'
                    : 'text-neutral-500 hover:text-neutral-950'
                }`}
              >
                <GalleryNavIcon icon={view} />
                <span>{label}</span>
                {galleryView === view ? (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#d71920]" />
                ) : null}
              </button>
            ))}
          </div>
        </nav>

        {galleryView === 'downloads' ? (
          <section className="mb-3 rounded-[1.5rem] border border-white/30 bg-white/90 p-3 shadow-[0_16px_40px_rgba(61,44,22,0.1)] backdrop-blur sm:mb-4 sm:p-4">
            <div className="flex flex-wrap items-center gap-2">
              {downloadEnabled ? (
                <button
                  onClick={downloadSelected}
                  disabled={selected.length === 0 || downloadingSelected}
                  className={`inline-flex min-h-10 flex-1 items-center justify-center rounded-full px-3 py-2 text-center text-xs font-semibold shadow-sm sm:flex-none ${
                    selected.length === 0 || downloadingSelected
                      ? disabledButtonClass
                      : primaryGradientClass
                  }`}
                >
                  {downloadingSelected
                    ? t.gallery.downloadingSelected
                    : `${t.gallery.downloadSelected} (${selected.length}/${selectedLimit})`}
                </button>
              ) : null}

              {downloadEnabled && albumDownloadEnabled ? (
                <button
                  onClick={downloadAll}
                  disabled={items.length === 0 || downloadingAll}
                  className={`inline-flex min-h-10 flex-1 items-center justify-center rounded-full px-3 py-2 text-center text-xs font-semibold shadow-sm sm:flex-none ${
                    items.length === 0 || downloadingAll
                      ? disabledButtonClass
                      : primaryGradientClass
                  }`}
                >
                  {downloadingAll ? t.gallery.downloadingAll : albumPackageButtonLabel}
                </button>
              ) : null}
            </div>

            {downloadEnabled && albumDownloadEnabled && albumPackagesVisible && items.length > albumPackageSize ? (
              <div className="mt-3 rounded-2xl border border-[#D4DFEE] bg-white/88 p-3 shadow-sm">
                <p className="mb-2 text-xs font-semibold text-[#33516F]">
                  {t.gallery.albumPackageNotice.replace('{count}', String(totalAlbumPackages))}
                </p>
                <div className="flex flex-wrap gap-2">
                  {albumPackages.map((albumPackage) => (
                    <button
                      key={albumPackage.index}
                      type="button"
                      onClick={() => downloadAlbumPackage(albumPackage.index, albumPackage.items)}
                      disabled={downloadingAll}
                      className={`inline-flex min-h-9 items-center justify-center rounded-full px-3 py-2 text-xs font-semibold shadow-sm ${
                        downloadingAll
                          ? disabledButtonClass
                          : neutralButtonClass
                      }`}
                    >
                      {albumPackage.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {galleryView === 'designs' && posterEnabled ? (
          <section className="space-y-3 py-3 sm:py-5">
            <div>
              <h2 className="text-xl font-black tracking-[-0.03em] text-neutral-950">
                {t.gallery.designsTab}
              </h2>
            </div>

            <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
              {([
                ['poster', 'Memory Poster A3'],
                ['story', t.gallery.storyButton],
              ] as const).map(([format, label]) => {
                const isActive = activeDesignFormat === format

                return (
                  <button
                    key={format}
                    type="button"
                    onClick={() => chooseDesignFormat(format)}
                    disabled={creatingPoster}
                    className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-black transition ${
                      isActive
                        ? primaryGradientClass
                        : neutralButtonClass
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-[0_8px_22px_rgba(20,20,20,0.04)]">
              <div className="flex flex-wrap gap-2">
                {(activeDesignFormat === 'poster'
                  ? ([
                      ['posterPortrait', t.gallery.posterPortraitMode],
                      ['posterLandscape', t.gallery.posterLandscapeMode],
                      ['posterMixed', t.gallery.posterMixedMode],
                    ] as const)
                  : ([
                      ['storyPortrait', t.gallery.storyPortraitMode],
                      ['storyLandscape', t.gallery.storyLandscapeMode],
                    ] as const)
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => chooseDesignMode(mode)}
                    disabled={creatingPoster}
                    className={`inline-flex min-h-9 flex-1 items-center justify-center rounded-lg border px-3 py-2 text-center text-xs font-black transition sm:flex-none ${
                      designMode === mode
                        ? primaryGradientClass
                        : neutralButtonClass
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {activeDesignFormat === 'poster' && designMode ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3">
                  <p className="mr-1 text-[11px] font-black uppercase tracking-[0.12em] text-neutral-400">
                    {t.gallery.posterStyleTitle}
                  </p>
                  {([
                    [false, t.gallery.posterColorOption.replace(/\s*\([^)]*\)/, '').replace(/\s+poster$/i, '') || t.gallery.posterColorOption],
                    [true, t.gallery.posterBlackWhite],
                  ] as const).map(([grayscale, label]) => (
                    <button
                      key={String(grayscale)}
                      type="button"
                      onClick={() => setPosterGrayscale(grayscale)}
                      disabled={creatingPoster}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-black transition ${
                        posterGrayscale === grayscale
                          ? primaryGradientClass
                          : neutralButtonClass
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-3 flex justify-end border-t border-neutral-200 pt-3">
                <button
                  type="button"
                  onClick={() => setDesignExamplesOpen(true)}
                  className={`rounded-lg px-3 py-2 text-xs font-black ${neutralButtonClass}`}
                >
                  Voorbeeld bekijken
                </button>
              </div>
            </div>

            {designMode ? (
              <div className="sticky top-[58px] z-20 rounded-xl border border-neutral-200 bg-white/96 p-3 shadow-[0_8px_22px_rgba(20,20,20,0.08)] backdrop-blur">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                      {designModeLabel}
                    </p>
                    {designMode === 'posterMixed' ? (
                      <p className="mt-1 text-sm font-black text-neutral-950">
                        {selectedPortraitCount} / {MIXED_POSTER_PORTRAIT_TILES} portrait · {selectedLandscapeCount} / {MIXED_POSTER_LANDSCAPE_TILES} landscape
                      </p>
                    ) : (
                      <p className="mt-1 text-sm font-black text-neutral-950">
                        {designSelectedCount} / {designModeLimit} {t.gallery.designSelected}
                      </p>
                    )}
                    {!designReady && activeDesignSelectedItems.length > 0 && designIncompleteText ? (
                      <p className="mt-0.5 text-xs font-bold text-[#d71920]">
                        {designIncompleteText}
                      </p>
                    ) : designLimitReached ? (
                      <p className="mt-0.5 text-xs font-bold text-[#d71920]">
                        {t.gallery.designLimitReached}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={clearDesignSelection}
                      disabled={activeDesignSelectedItems.length === 0 || creatingPoster}
                      className={`inline-flex min-h-9 flex-1 items-center justify-center rounded-lg px-3 py-2 text-xs font-black disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none ${neutralButtonClass}`}
                    >
                      {t.gallery.clearSelection}
                    </button>
                    <button
                      type="button"
                      onClick={() => createPoster({ grayscale: activeDesignFormat === 'poster' ? posterGrayscale : false, mode: designMode })}
                      disabled={!designReady || creatingPoster}
                      className={`inline-flex min-h-9 flex-1 items-center justify-center rounded-lg px-4 py-2 text-xs font-black text-white shadow-sm sm:flex-none ${
                        !designReady || creatingPoster
                          ? disabledButtonClass
                          : primaryGradientClass
                      }`}
                    >
                      {creatingPoster
                        ? activeDesignFormat === 'story'
                          ? t.gallery.storyPreparing
                          : t.gallery.posterPreparing
                        : t.gallery.designCreate}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {!designMode ? (
              <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm font-bold text-neutral-500">
                {t.gallery.designChooseMode}
              </div>
            ) : suitablePhotoShortageText ? (
              <div className="rounded-xl border border-[#d71920]/20 bg-[#fff5f5] p-3 text-sm font-bold text-[#d71920]">
                {suitablePhotoShortageText}
              </div>
            ) : null}

            {designMode && activeDesignItems.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm font-semibold text-neutral-500">
                {t.gallery.noUploads}
              </div>
            ) : designMode ? (
              <div className="grid grid-cols-2 gap-1.5 min-[360px]:grid-cols-3 min-[500px]:grid-cols-4 sm:gap-2 lg:grid-cols-5">
                {activeDesignItems.map((item) => {
                  const isSelected = selected.includes(item.id)
                  const selectionBlockMessage = !isSelected ? getSelectionBlockMessage(item) : ''
                  const isSelectionBlocked = Boolean(selectionBlockMessage)
                  const downloadName = getUploadShortFileName(item, {
                    eventSlug: currentEvent?.albumName || currentEvent?.name || eventIdentifier,
                    sequence: shareSequenceById[item.id],
                  })

                  return (
                    <article
                      key={item.id}
                      className={`overflow-hidden rounded-xl bg-[#343434] p-[2px] ${
                        isSelected ? 'ring-2 ring-[#d71920]/75 ring-offset-2' : ''
                      } ${isSelectionBlocked ? 'opacity-70' : ''}`}
                    >
                      <div className="relative">
                        <Image
                          src={item.file_url}
                          alt={downloadName}
                          width={1200}
                          height={1200}
                          unoptimized
                          onLoad={(event) => registerPhotoMetrics(item, event.currentTarget)}
                          className="aspect-[4/5] w-full rounded-[10px] bg-[#343434] object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSelect(item.id)}
                          disabled={isSelectionBlocked}
                          aria-label={isSelected ? t.gallery.selected : t.gallery.select}
                          title={
                            isSelectionBlocked
                              ? selectionBlockMessage
                              : isSelected
                                ? t.gallery.selected
                                : t.gallery.select
                          }
                          className={`absolute left-1.5 top-1.5 z-20 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/75 shadow-sm backdrop-blur sm:h-7 sm:w-7 ${
                            isSelected
                              ? 'bg-[#d71920] text-white'
                              : isSelectionBlocked
                                ? 'cursor-not-allowed bg-stone-200/95 text-stone-500'
                                : 'bg-white/90 text-neutral-700'
                          }`}
                        >
                          {isSelected ? (
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.8]">
                              <path d="M5 12.5 9.5 17 19 7.5" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                              <circle cx="12" cy="12" r="8" />
                            </svg>
                          )}
                        </button>

                      </div>
                    </article>
                  )
                })}
              </div>
            ) : null}
          </section>
        ) : null}

        {galleryView === 'photos' ? (
          <section className="space-y-3 py-3 sm:py-5">
            <div className="border-b border-neutral-200 bg-white px-1 pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black tracking-[-0.02em] text-neutral-950 sm:text-lg">
                    {t.upload.selectLabel}
                  </h2>
                  <p className="mt-0.5 text-sm leading-5 text-neutral-500">
                    {t.upload.intro}
                  </p>
                </div>
                <Link
                  href={uploadPageUrl}
                  className={`inline-flex min-h-8 shrink-0 items-center justify-center rounded-lg px-2.5 py-1.5 text-[11px] font-black sm:min-h-9 sm:px-3 sm:text-xs ${primaryGradientClass}`}
                >
                  {t.upload.selectButton}
                </Link>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm font-semibold text-neutral-500">
                {t.gallery.noUploads}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 min-[360px]:grid-cols-3 min-[500px]:grid-cols-4 sm:gap-2 lg:grid-cols-5">
                {items.map((item) => {
                  const isSelected = photoTabSelected.includes(item.id)
                  const downloadName = getUploadShortFileName(item, {
                    eventSlug: currentEvent?.albumName || currentEvent?.name || eventIdentifier,
                    sequence: shareSequenceById[item.id],
                  })

                  return (
                    <article
                      key={item.id}
                      className={`overflow-hidden rounded-xl bg-[#343434] p-[2px] ${
                        isSelected ? 'ring-2 ring-[#d71920]/75 ring-offset-2' : ''
                      }`}
                    >
                      <div className="relative">
                        <Image
                          src={item.file_url}
                          alt={downloadName}
                          width={1200}
                          height={1200}
                          unoptimized
                          onLoad={(event) => registerPhotoMetrics(item, event.currentTarget)}
                          className="aspect-[4/5] w-full rounded-[10px] bg-[#343434] object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          aria-label={t.gallery.openPreview}
                          title={t.gallery.openPreview}
                          className="absolute inset-0 z-10"
                        />

                        {downloadEnabled || deleteEnabled || posterEnabled ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              setPhotoTabSelected((prev) =>
                                prev.includes(item.id)
                                  ? prev.filter((itemId) => itemId !== item.id)
                                  : [...prev, item.id]
                              )
                            }}
                            aria-label={isSelected ? t.gallery.selected : t.gallery.select}
                            title={isSelected ? t.gallery.selected : t.gallery.select}
                            className={`absolute left-1.5 top-1.5 z-20 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/75 shadow-sm backdrop-blur sm:h-7 sm:w-7 ${
                              isSelected
                                ? primaryRoundButtonClass
                                : neutralRoundButtonClass
                            }`}
                          >
                            {isSelected ? (
                              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.8]">
                                <path d="M5 12.5 9.5 17 19 7.5" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                                <circle cx="12" cy="12" r="8" />
                              </svg>
                            )}
                          </button>
                        ) : null}

                        {deleteEnabled ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              void deleteSingle(item)
                            }}
                            disabled={deletingSelected}
                            aria-label={t.gallery.delete}
                            title={t.gallery.delete}
                            className={`absolute right-1.5 top-1.5 z-20 inline-flex h-6 w-6 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:bg-stone-300 sm:h-7 sm:w-7 ${primaryRoundButtonClass}`}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                              <path d="M4 7h16" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M6 7l1 12h10l1-12" />
                              <path d="M9 7V4h6v3" />
                            </svg>
                          </button>
                        ) : null}

                        {shareEnabled ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              void handleShare(item)
                            }}
                            aria-label={t.gallery.share}
                            title={t.gallery.share}
                            className={`absolute bottom-1.5 left-1.5 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full ${neutralRoundButtonClass}`}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[2.2]">
                              <path d="M12 5v10" />
                              <path d="m8 9 4-4 4 4" />
                              <path d="M5 19h14" />
                            </svg>
                          </button>
                        ) : null}

                        {downloadEnabled ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              void handleDownload(item.file_url, downloadName)
                            }}
                            aria-label={t.gallery.download}
                            title={t.gallery.download}
                            className={`absolute bottom-1.5 right-1.5 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full ${primaryRoundButtonClass}`}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[2.2]">
                              <path d="M12 4v10" />
                              <path d="m8 10 4 4 4-4" />
                              <path d="M5 19h14" />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        ) : galleryView === 'downloads' && items.length === 0 ? (
          <div className="rounded-[2rem] border border-[#D4DFEE] bg-white p-10 text-center text-[#597594] shadow-[0_16px_40px_rgba(61,44,22,0.08)]">
            {t.gallery.noUploads}
          </div>
        ) : galleryView === 'downloads' ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => {
              const designSelectionActive = false
              const isSelected = selected.includes(item.id)
              const selectionBlockMessage = designSelectionActive && !isSelected ? getSelectionBlockMessage(item) : ''
              const isSelectionBlocked = Boolean(selectionBlockMessage)
              const downloadName = getUploadShortFileName(item, {
                eventSlug: currentEvent?.albumName || currentEvent?.name || eventIdentifier,
                sequence: shareSequenceById[item.id],
              })
              const actionButtonClass =
                `inline-flex h-8 w-8 items-center justify-center rounded-full ${neutralRoundButtonClass}`

              return (
                <article
                  key={item.id}
                  className={`overflow-hidden rounded-[2rem] border bg-white shadow-[0_16px_40px_rgba(61,44,22,0.08)] ${
                    isSelected
                      ? 'border-stone-900 ring-2 ring-stone-900/10'
                      : isSelectionBlocked
                        ? 'border-stone-200 opacity-70'
                        : 'border-stone-200'
                  }`}
                >
                  <div className="relative">
                    <Image
                      src={item.file_url}
                      alt={downloadName}
                      width={1200}
                      height={1200}
                      unoptimized
                      onLoad={(event) => registerPhotoMetrics(item, event.currentTarget)}
                      className="aspect-[4/5] w-full bg-stone-950 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      aria-label={t.gallery.openPreview}
                      title={t.gallery.openPreview}
                      className="absolute inset-0 z-10"
                    />

                    {downloadEnabled || deleteEnabled || posterEnabled ? (
                      <button
                        type="button"
                        onClick={() => toggleSelect(item.id)}
                        disabled={isSelectionBlocked}
                        aria-label={isSelected ? t.gallery.selected : t.gallery.select}
                        title={
                          isSelectionBlocked
                            ? selectionBlockMessage
                            : isSelected
                              ? t.gallery.selected
                              : t.gallery.select
                        }
                        className={`absolute left-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-[0_8px_20px_rgba(15,61,102,0.18)] backdrop-blur ${
                          isSelected
                            ? primaryRoundButtonClass
                            : isSelectionBlocked
                              ? 'cursor-not-allowed border border-white/75 bg-stone-200/95 text-stone-500 shadow-sm'
                            : neutralRoundButtonClass
                        }`}
                      >
                        {isSelected ? (
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[2.8]">
                            <path d="M5 12.5 9.5 17 19 7.5" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                            <circle cx="12" cy="12" r="8" />
                          </svg>
                        )}
                      </button>
                    ) : null}

                    {isSelectionBlocked ? (
                      <div className="absolute left-3 right-3 top-16 z-20 rounded-2xl bg-white/92 px-3 py-2 text-[10px] font-semibold text-[#b91f32] shadow-sm backdrop-blur">
                        {selectionBlockMessage}
                      </div>
                    ) : null}

                    {deleteEnabled ? (
                      <button
                        type="button"
                        onClick={() => deleteSingle(item)}
                        disabled={deletingSelected}
                        aria-label={t.gallery.delete}
                        title={t.gallery.delete}
                        className={`absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:border-white/70 disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-sm ${primaryRoundButtonClass}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                          <path d="M4 7h16" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M6 7l1 12h10l1-12" />
                          <path d="M9 7V4h6v3" />
                        </svg>
                      </button>
                    ) : null}

                    <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {shareEnabled ? (
                          <button
                            type="button"
                            onClick={() => handleShare(item)}
                            aria-label={t.gallery.share}
                            title={t.gallery.share}
                            className={actionButtonClass}
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                              <path d="M12 5v10" />
                              <path d="m8 9 4-4 4 4" />
                              <path d="M5 19h14" />
                            </svg>
                          </button>
                        ) : null}

                        {downloadEnabled ? (
                          <button
                            type="button"
                            onClick={() => handleDownload(item.file_url, downloadName)}
                            aria-label={t.gallery.download}
                            title={t.gallery.download}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${primaryRoundButtonClass}`}
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                              <path d="M12 4v10" />
                              <path d="m8 10 4 4 4-4" />
                              <path d="M5 19h14" />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="truncate text-xs font-medium text-stone-900">
                      {downloadName}
                    </p>
                    {item.guest_message ? (
                      <p className="mt-2 line-clamp-2 text-xs text-[#597594]">
                        {item.guest_message}
                      </p>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        ) : galleryView === 'guestbook' ? (
          <section className="space-y-3 py-3 sm:py-5">
            <div>
              <h2 className="text-xl font-black tracking-[-0.03em] text-neutral-950">
                {t.gallery.guestbookTitle}
              </h2>
            </div>
            {guestbookFeedItems.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
                <p className="text-sm font-black text-neutral-950">
                  {t.gallery.guestbookEmptyTitle}
                </p>
                <p className="mt-1 text-sm leading-5 text-neutral-500">
                  {t.gallery.guestbookEmptyText}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {guestbookFeedItems.map((item) => {
                  if (item.source === 'standalone') {
                    const relatedUpload = item.relatedUpload || null
                    const relatedDownloadName = relatedUpload
                      ? getUploadShortFileName(relatedUpload, {
                          eventSlug: currentEvent?.albumName || currentEvent?.name || eventIdentifier,
                          sequence: shareSequenceById[relatedUpload.id],
                        })
                      : ''

                    return (
                      <article
                        key={item.key}
                        className="rounded-xl border border-neutral-200 bg-white p-3 shadow-[0_6px_18px_rgba(20,20,20,0.04)]"
                      >
                        <div className="flex gap-3">
                          {relatedUpload ? (
                            <button
                              type="button"
                              onClick={() => setPreviewItem(relatedUpload)}
                              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] bg-neutral-100 sm:h-20 sm:w-20"
                              aria-label={t.gallery.openPreview}
                              title={t.gallery.openPreview}
                            >
                              <Image
                                src={relatedUpload.file_url}
                                alt={relatedDownloadName}
                                fill
                                unoptimized
                                sizes="80px"
                                className="object-cover"
                              />
                            </button>
                          ) : null}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              {item.guestName ? (
                                <p className="text-sm font-black text-neutral-950">
                                  {item.guestName}
                                </p>
                              ) : null}
                              <p className="shrink-0 text-[11px] font-bold text-neutral-400">
                                {formatGuestbookDate(item.createdAt, locale) || t.gallery.uploadTimeUnavailable}
                              </p>
                            </div>
                            <p className="mt-1 break-words text-sm font-medium leading-5 text-neutral-700 [font-family:Arial,Helvetica,sans-serif,'Apple_Color_Emoji','Segoe_UI_Emoji','Noto_Color_Emoji']">
                              {item.message}
                            </p>
                          </div>
                        </div>
                      </article>
                    )
                  }

                  const downloadName = getUploadShortFileName(item.upload, {
                    eventSlug: currentEvent?.albumName || currentEvent?.name || eventIdentifier,
                    sequence: shareSequenceById[item.upload.id],
                  })

                  return (
                    <article
                      key={item.key}
                      className="rounded-xl border border-neutral-200 bg-white p-3 shadow-[0_6px_18px_rgba(20,20,20,0.04)]"
                    >
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item.upload)}
                          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] bg-neutral-100 sm:h-20 sm:w-20"
                          aria-label={t.gallery.openPreview}
                          title={t.gallery.openPreview}
                        >
                          <Image
                            src={item.upload.file_url}
                            alt={downloadName}
                            fill
                            unoptimized
                            sizes="80px"
                            className="object-cover"
                          />
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex justify-end">
                            <p className="shrink-0 text-[11px] font-bold text-neutral-400">
                              {formatGuestbookDate(item.createdAt, locale) || t.gallery.uploadTimeUnavailable}
                            </p>
                          </div>
                          <p className="mt-1 break-words text-sm font-medium leading-5 text-neutral-700 [font-family:Arial,Helvetica,sans-serif,'Apple_Color_Emoji','Segoe_UI_Emoji','Noto_Color_Emoji']">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        ) : null}
        </div>
      </main>

      {previewItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.5rem] bg-stone-950 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              aria-label={t.gallery.closePreview}
              title={t.gallery.closePreview}
              className={`absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full ${neutralRoundButtonClass}`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>

            {previousPreviewItem ? (
              <button
                type="button"
                onClick={() => setPreviewItem(previousPreviewItem)}
                aria-label={t.gallery.previousPhoto}
                title={t.gallery.previousPhoto}
                className={`absolute left-4 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full ${neutralRoundButtonClass}`}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                  <path d="m15 6-6 6 6 6" />
                </svg>
              </button>
            ) : null}

            {nextPreviewItem ? (
              <button
                type="button"
                onClick={() => setPreviewItem(nextPreviewItem)}
                aria-label={t.gallery.nextPhoto}
                title={t.gallery.nextPhoto}
                className={`absolute right-4 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full ${neutralRoundButtonClass}`}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            ) : null}

            <div className="flex min-h-0 flex-1 items-center justify-center bg-black">
              <Image
                src={previewItem.file_url}
                alt={previewDownloadName}
                width={1600}
                height={1600}
                unoptimized
                className="max-h-[76vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="flex flex-col gap-3 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-900">
                  {previewDownloadName}
                </p>
                {previewIndex >= 0 ? (
                  <p className="mt-1 text-xs font-semibold text-[#597594]">
                    {previewIndex + 1} / {items.length}
                  </p>
                ) : null}
                {previewItem.guest_message ? (
                  <p className="mt-2 max-w-xl text-sm text-[#33516F]">
                    <span className="font-semibold">{t.gallery.guestMessageLabel}: </span>
                    {previewItem.guest_message}
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                {shareEnabled ? (
                  <button
                    type="button"
                    onClick={() => handleShare(previewItem)}
                    className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-semibold ${neutralButtonClass}`}
                  >
                    {t.gallery.share}
                  </button>
                ) : null}
                {downloadEnabled ? (
                  <button
                    type="button"
                    onClick={() => handleDownload(previewItem.file_url, previewDownloadName)}
                    className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-semibold ${primaryGradientClass}`}
                  >
                    {t.gallery.download}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {designExamplesOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setDesignExamplesOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-neutral-950">
                  {activeDesignFormat === 'poster' ? 'Memory Poster A3' : t.gallery.storyButton}
                </h2>
                <p className="mt-1 text-sm font-medium text-neutral-500">
                  Voorbeeld bekijken
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDesignExamplesOpen(false)}
                aria-label={t.gallery.cancel}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                  <path d="M6 6l12 12" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1">
              {designExamples.map((example) => (
                <figure
                  key={example.src}
                  className="w-44 shrink-0 rounded-2xl border border-neutral-200 bg-neutral-50 p-2 sm:w-56"
                >
                  <div className="flex h-64 items-center justify-center overflow-hidden rounded-xl bg-white sm:h-80">
                    <Image
                      src={example.src}
                      alt={example.label}
                      width={600}
                      height={900}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <figcaption className="mt-2 text-xs font-black text-neutral-700">
                    {example.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <SiteFooter />
    </div>
  )
}
