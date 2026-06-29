'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useLanguage } from '@/app/_components/language-provider'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { getPublicMediaUrl, getPublicPath } from '@/lib/app-url'
import {
  getUploadShareKey,
  getUploadShortFileName,
  type UploadRecord,
} from '@/lib/eventdrop'
import { normalizeEventRecord, type NormalizedEvent } from '@/lib/events'
import { shareMedia } from '@/lib/share-media'
import { supabase } from '@/lib/supabase'

const POSTER_WIDTH = 2480
const POSTER_HEIGHT = 3508
const POSTER_MAX_TILES = 15
const POSTER_MAX_ASPECT_RATIO = 2.2
const STORY_WIDTH = 1080
const STORY_HEIGHT = 1920
const STORY_MAX_TILES = 8
const POSTER_GAP = 18
const POSTER_MARGIN = 56
const POSTER_FOOTER_HEIGHT = 160
const POSTER_LOGO_URL = '/photobooth-holland-logo.png'
const POSTER_TEMPLATE_PHOTO_AREA = {
  x: 120,
  y: 390,
  width: POSTER_WIDTH - 240,
  height: POSTER_HEIGHT - 760,
}

type CanvasImageResource = {
  image: HTMLImageElement
  objectUrl: string
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

function drawPosterTile(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: { grayscale?: boolean }
) {
  context.save()
  context.fillStyle = '#000'
  context.fillRect(x, y, width, height)
  context.beginPath()
  context.rect(x, y, width, height)
  context.clip()
  context.filter = options?.grayscale ? 'grayscale(100%)' : 'none'
  drawCoverImage(context, image, x, y, width, height)
  context.filter = 'none'
  context.restore()
}

function getCanvasImageAspectRatio(resource: CanvasImageResource) {
  const width = resource.image.naturalWidth || resource.image.width
  const height = resource.image.naturalHeight || resource.image.height

  if (!width || !height) return 1

  return Math.max(width / height, height / width)
}

function isPosterImageAllowed(resource: CanvasImageResource) {
  return getCanvasImageAspectRatio(resource) <= POSTER_MAX_ASPECT_RATIO
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

  drawCoverImage(context, image, 0, 0, POSTER_WIDTH, POSTER_HEIGHT)

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

function getPosterGridSize(imageCount: number) {
  if (imageCount <= 1) return { columns: 1, rows: 1 }
  if (imageCount <= 2) return { columns: 2, rows: 1 }
  if (imageCount <= 4) return { columns: 2, rows: 2 }
  if (imageCount <= 6) return { columns: 2, rows: 3 }
  if (imageCount <= 9) return { columns: 3, rows: 3 }
  if (imageCount <= 12) return { columns: 3, rows: 4 }
  return { columns: 3, rows: 5 }
}

function getPosterTileRects(
  images: HTMLImageElement[],
  area: { x: number; y: number; width: number; height: number }
) {
  if (images.length === 0) return []

  const { columns, rows } = getPosterGridSize(images.length)
  const tileWidth = (area.width - POSTER_GAP * (columns - 1)) / columns
  const tileHeight = (area.height - POSTER_GAP * (rows - 1)) / rows
  const usedRows = Math.ceil(images.length / columns)
  const usedHeight = usedRows * tileHeight + Math.max(0, usedRows - 1) * POSTER_GAP
  const topOffset = area.y + Math.max(0, (area.height - usedHeight) / 2)

  return images.map((image, index) => {
    const row = Math.floor(index / columns)
    const column = index % columns

    return {
      image,
      x: area.x + column * (tileWidth + POSTER_GAP),
      y: topOffset + row * (tileHeight + POSTER_GAP),
      width: tileWidth,
      height: tileHeight,
    }
  })
}

function drawPosterGrid(
  context: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  area: { x: number; y: number; width: number; height: number },
  options?: { grayscale?: boolean }
) {
  context.save()
  context.fillStyle = '#050505'
  context.fillRect(area.x, area.y, area.width, area.height)
  context.restore()

  getPosterTileRects(images, area).forEach((rect) => {
    drawPosterTile(
      context,
      rect.image,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      options
    )
  })
}

function drawStoryGrid(
  context: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  area: { x: number; y: number; width: number; height: number },
  options?: { grayscale?: boolean }
) {
  const columns = 2
  const rows = 4
  const gap = 16
  const tileWidth = (area.width - gap * (columns - 1)) / columns
  const tileHeight = (area.height - gap * (rows - 1)) / rows

  context.save()
  context.fillStyle = 'rgba(0, 0, 0, 0.62)'
  context.fillRect(area.x - 18, area.y - 18, area.width + 36, area.height + 36)
  context.restore()

  images.slice(0, STORY_MAX_TILES).forEach((image, index) => {
    const row = Math.floor(index / columns)
    const column = index % columns

    drawPosterTile(
      context,
      image,
      area.x + column * (tileWidth + gap),
      area.y + row * (tileHeight + gap),
      tileWidth,
      tileHeight,
      options
    )
  })
}

export default function Page() {
  const { t } = useLanguage()
  const params = useParams()
  const eventIdentifier = params.id as string

  const [items, setItems] = useState<UploadRecord[]>([])
  const [currentEvent, setCurrentEvent] = useState<NormalizedEvent | null>(null)
  const [eventName, setEventName] = useState('Gedeelde evenementgalerij')
  const [selected, setSelected] = useState<string[]>([])
  const [statusMessage, setStatusMessage] = useState(t.gallery.loading)
  const [deletingSelected, setDeletingSelected] = useState(false)
  const [downloadingSelected, setDownloadingSelected] = useState(false)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [creatingPoster, setCreatingPoster] = useState(false)
  const [posterStyleModalOpen, setPosterStyleModalOpen] = useState(false)
  const [albumPackageIndex, setAlbumPackageIndex] = useState(0)
  const [previewItem, setPreviewItem] = useState<UploadRecord | null>(null)

  useEffect(() => {
    setStatusMessage(t.gallery.loading)
  }, [t.gallery.loading])

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
    setAlbumPackageIndex(0)
  }, [items.length])

  useEffect(() => {
    const loadBranding = async () => {
      if (!currentEvent?.id) return
      if (currentEvent.coverImageUrl && currentEvent.backgroundImageUrl) return

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
  }, [currentEvent?.backgroundImageUrl, currentEvent?.coverImageUrl, currentEvent?.id, eventIdentifier])

  const selectedItems = useMemo(
    () => items.filter((item) => selected.includes(item.id)),
    [items, selected]
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
    () => getPublicPath(`/event/${eventIdentifier}`),
    [eventIdentifier]
  )

  const selectedLimit = 100
  // Keep ZIPs small enough for serverless runtimes and mobile browsers.
  // Large in-memory blobs can otherwise look as if the button does nothing.
  const albumPackageSize = 20
  const shareEnabled = currentEvent?.allowGuestShare !== false
  const downloadEnabled = currentEvent?.allowGuestDownload !== false
  const albumDownloadEnabled = currentEvent?.allowAlbumDownload !== false
  const deleteEnabled = currentEvent?.allowGuestDelete === true
  const posterEnabled = currentEvent?.allowGuestPoster === true
  const downloadInProgress = downloadingSelected || downloadingAll || creatingPoster
  const totalAlbumPackages = Math.max(1, Math.ceil(items.length / albumPackageSize))
  const activeAlbumPackageIndex = Math.min(albumPackageIndex, totalAlbumPackages - 1)
  const albumPackageStart = activeAlbumPackageIndex * albumPackageSize
  const albumPackageEnd = Math.min(albumPackageStart + albumPackageSize, items.length)
  const albumPackageItems = items.slice(albumPackageStart, albumPackageEnd)
  const albumPackageButtonLabel =
    items.length <= albumPackageSize
      ? t.gallery.downloadAll
      : `${t.gallery.downloadAlbumPackage} ${activeAlbumPackageIndex + 1}/${totalAlbumPackages} (${albumPackageStart + 1}-${albumPackageEnd})`
  const posterSelectedCount = Math.min(selectedItems.length, POSTER_MAX_TILES)
  const storySelectedCount = Math.min(selectedItems.length, STORY_MAX_TILES)
  const posterOverflowCount = Math.max(0, selectedItems.length - POSTER_MAX_TILES)
  const posterRemainingCount = Math.max(0, POSTER_MAX_TILES - posterSelectedCount)
  const posterSelectionLabel = posterOverflowCount > 0
    ? `${t.gallery.posterLimitExceeded} ${posterOverflowCount} ${t.gallery.posterExtraIgnored}`
    : posterSelectedCount === POSTER_MAX_TILES
      ? t.gallery.posterLimitReached
      : posterSelectedCount > 0
        ? `${posterRemainingCount} ${t.gallery.posterMoreNeeded}`
        : t.gallery.posterHorizontalTip

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id)
      }

      if (prev.length >= selectedLimit) {
        setStatusMessage(t.gallery.selectionLimitReached)
        return prev
      }

      const next = [...prev, id]

      if (posterEnabled && next.length >= POSTER_MAX_TILES) {
        window.alert(t.gallery.posterLimitPopup)
      }

      return next
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

  const getZipFileName = (options: { packageNumber?: number; selectedOnly: boolean }) => {
    const baseName = (currentEvent?.albumName || currentEvent?.name || eventIdentifier)
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, ' ')
    const suffix = options.packageNumber
      ? `-pakket-${options.packageNumber}`
      : options.selectedOnly
        ? '-selectie'
        : ''

    return `${baseName || 'eventdrop-album'}${suffix}.zip`
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

    const namesById = zipItems.reduce<Record<string, string>>((accumulator, item) => {
      accumulator[item.id] = getUploadShortFileName(item, {
        eventSlug: currentEvent?.albumName || currentEvent?.name || eventIdentifier,
        sequence: shareSequenceById[item.id],
      })
      return accumulator
    }, {})

    try {
      const response = await fetch('/api/gallery-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          all: options.all === true,
          eventIdentifier,
          namesById,
          uploadIds: options.all ? undefined : zipItems.map((item) => item.id),
        }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error || t.gallery.loadError)
      }

      saveBlob(
        await response.blob(),
        getZipFileName({
          packageNumber: options.packageNumber,
          selectedOnly: options.all !== true && !options.packageNumber,
        })
      )

      setStatusMessage(
        options.all ? t.gallery.allDownloaded : `${zipItems.length} ${t.gallery.downloaded}`
      )
    } catch (error) {
      console.error('ZIP download failed', error)
      setStatusMessage(
        error instanceof Error ? error.message : t.gallery.loadError
      )
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

    setDownloadingAll(true)
    setStatusMessage(t.gallery.downloadingAll)

    try {
      const downloadSingleAlbumZip = items.length <= albumPackageSize

      await downloadZip({
        all: downloadSingleAlbumZip,
        packageNumber: items.length > albumPackageSize ? activeAlbumPackageIndex + 1 : undefined,
        zipItems: downloadSingleAlbumZip ? undefined : albumPackageItems,
      })
      setAlbumPackageIndex((prev) => (prev + 1 >= totalAlbumPackages ? 0 : prev + 1))
    } finally {
      setDownloadingAll(false)
    }
  }

  const openPosterStyleOptions = () => {
    if (selectedItems.length === 0 || creatingPoster) {
      setStatusMessage(t.gallery.posterChoose)
      return
    }

    setPosterStyleModalOpen(true)
  }

  const createPoster = async (options?: { grayscale?: boolean; format?: 'poster' | 'story' }) => {
    if (selectedItems.length === 0 || creatingPoster) {
      setStatusMessage(t.gallery.posterChoose)
      return
    }

    setPosterStyleModalOpen(false)
    setCreatingPoster(true)
    const format = options?.format || 'poster'

    setStatusMessage(format === 'story' ? t.gallery.storyPreparing : t.gallery.posterPreparing)

    const resources: CanvasImageResource[] = []
    let logoResource: CanvasImageResource | null = null
    let templateResource: CanvasImageResource | null = null
    let storyTemplateResource: CanvasImageResource | null = null

    try {
      if (selectedItems.length > POSTER_MAX_TILES) {
        window.alert(t.gallery.posterLimitPopup)
      }

      const loadedImages: CanvasImageResource[] = []
      let skippedPosterImages = 0

      for (const item of selectedItems) {
        if (loadedImages.length >= POSTER_MAX_TILES) break

        const resource = await loadCanvasImage(item.file_url)
        resources.push(resource)

        if (!isPosterImageAllowed(resource)) {
          skippedPosterImages += 1
          continue
        }

        loadedImages.push(resource)
      }

      if (skippedPosterImages > 0) {
        window.alert(t.gallery.posterRatioPopup)
      }

      if (loadedImages.length === 0) {
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

      context.fillStyle = '#050505'
      context.fillRect(0, 0, canvas.width, canvas.height)

      if (format === 'story') {
        if (storyTemplateResource) {
          drawCoverImage(context, storyTemplateResource.image, 0, 0, STORY_WIDTH, STORY_HEIGHT)
        } else if (templateResource) {
          drawContainImage(context, templateResource.image, 0, 0, STORY_WIDTH, STORY_HEIGHT)
        }

        const storyImages = loadedImages.slice(0, STORY_MAX_TILES)
        const storyArea = { x: 72, y: 240, width: STORY_WIDTH - 144, height: 1420 }

        drawStoryGrid(
          context,
          storyImages.map(({ image }) => image),
          storyArea,
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
          drawCoverImage(context, templateResource.image, 0, 0, POSTER_WIDTH, POSTER_HEIGHT)
        }

        drawPosterGrid(
          context,
          loadedImages.map(({ image }) => image),
          POSTER_TEMPLATE_PHOTO_AREA,
          { grayscale: options?.grayscale }
        )

        if (templateHasPhotoWindow) {
          drawCoverImage(context, templateResource.image, 0, 0, POSTER_WIDTH, POSTER_HEIGHT)
        }
      } else {
        const titleBottom = drawPosterTitle(
          context,
          eventName,
          POSTER_MARGIN,
          POSTER_MARGIN + 56,
          POSTER_WIDTH - POSTER_MARGIN * 2
        )
        const gridTop = Math.max(POSTER_MARGIN + 150, titleBottom + 30)
        const footerTop = POSTER_HEIGHT - POSTER_MARGIN - POSTER_FOOTER_HEIGHT
        const gridArea = {
          x: POSTER_MARGIN,
          y: gridTop,
          width: POSTER_WIDTH - POSTER_MARGIN * 2,
          height: footerTop - gridTop - 12,
        }

        drawPosterGrid(
          context,
          loadedImages.map(({ image }) => image),
          gridArea,
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
          itemCount: format === 'story' ? storySelectedCount : posterSelectedCount,
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

  const eventBackgroundStyle = currentEvent?.backgroundImageUrl
    ? {
        backgroundImage: `linear-gradient(rgba(15,33,53,0.4), rgba(15,33,53,0.48)), url(${currentEvent.backgroundImageUrl})`,
      }
    : undefined
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
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_#faf6ef_0%,_#f0ebe2_55%,_#edf4fb_100%)] text-stone-900">
      <SiteHeader currentLabel={t.gallery.badge} />

      <main
        className="flex-1 bg-cover bg-center p-6"
        style={eventBackgroundStyle}
      >
        <div className="mx-auto max-w-6xl">
        {downloadInProgress ? (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 flex items-center gap-3 rounded-2xl border border-[#F9C58E] bg-[#FFF4E8] px-4 py-3 text-sm font-semibold text-[#8A4A07] shadow-[0_12px_30px_rgba(61,44,22,0.12)]"
          >
            <span className="h-3 w-3 animate-pulse rounded-full bg-[#F58220]" />
            {creatingPoster
              ? t.gallery.posterPreparing
              : downloadingAll
                ? t.gallery.downloadingAll
                : t.gallery.downloadingSelected}
          </div>
        ) : currentEvent ? (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 flex flex-col gap-1 rounded-2xl border border-white/30 bg-white/85 px-4 py-3 text-sm font-semibold text-[#33516F] shadow-[0_12px_30px_rgba(15,33,53,0.1)] backdrop-blur sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="min-w-0 truncate text-stone-950">{eventName}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#597594]">
              {items.length} {t.gallery.showing}
            </span>
          </div>
        ) : statusMessage ? (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 rounded-2xl border border-white/30 bg-white/85 px-4 py-3 text-sm font-semibold text-[#33516F] shadow-[0_12px_30px_rgba(15,33,53,0.1)] backdrop-blur"
          >
            {statusMessage}
          </div>
        ) : null}

        <div className="mb-4 flex flex-col gap-4 rounded-[1.5rem] border border-white/20 bg-[rgba(255,250,242,0.92)] p-4 shadow-[0_18px_50px_rgba(15,33,53,0.18)] backdrop-blur">
          <div className="min-w-0 flex-1">
            <div
              className="h-44 w-full overflow-hidden rounded-[1.2rem] bg-[#EDF4FB] bg-cover bg-center sm:h-56 lg:aspect-[3/1] lg:h-auto xl:aspect-[18/5]"
              style={eventCoverStyle}
            />
            <h1 className="sr-only">
              {eventName}
            </h1>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2">
            {downloadEnabled ? (
              <button
                onClick={downloadSelected}
                disabled={selected.length === 0 || downloadingSelected}
                className={`inline-flex min-h-9 flex-1 items-center justify-center rounded-full px-3 py-2 text-center text-xs font-semibold shadow-sm sm:flex-none ${
                  selected.length === 0 || downloadingSelected
                    ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                    : 'bg-[#F58220] text-white hover:bg-[#DB6E12]'
                }`}
              >
                {downloadingSelected
                  ? t.gallery.downloadingSelected
                  : `${t.gallery.downloadSelected} (${selected.length}/${selectedLimit})`}
              </button>
            ) : null}

            {downloadEnabled && albumDownloadEnabled ? (
              <>
                <button
                  onClick={downloadAll}
                  disabled={items.length === 0 || downloadingAll}
                  className={`inline-flex min-h-9 flex-1 items-center justify-center rounded-full px-3 py-2 text-center text-xs font-semibold shadow-sm sm:flex-none ${
                    items.length === 0 || downloadingAll
                      ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                      : 'bg-[#0F3D66] text-white hover:bg-[#0B2F4F]'
                  }`}
                >
                  {downloadingAll ? t.gallery.downloadingAll : albumPackageButtonLabel}
                </button>

              </>
            ) : null}

            {posterEnabled ? (
              <>
                <button
                  type="button"
                  onClick={openPosterStyleOptions}
                  disabled={selectedItems.length === 0 || creatingPoster}
                  className={`inline-flex min-h-9 flex-1 items-center justify-center rounded-full px-3 py-2 text-center text-xs font-semibold shadow-sm sm:flex-none ${
                    selectedItems.length === 0 || creatingPoster
                      ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                      : 'bg-stone-950 text-white hover:bg-stone-800'
                  }`}
                >
                  {creatingPoster
                    ? t.gallery.posterPreparing
                    : `${t.gallery.posterButton} (${posterSelectedCount}/${POSTER_MAX_TILES})`}
                </button>

                <button
                  type="button"
                  onClick={() => createPoster({ grayscale: false, format: 'story' })}
                  disabled={selectedItems.length === 0 || creatingPoster}
                  className={`inline-flex min-h-9 flex-1 items-center justify-center rounded-full px-3 py-2 text-center text-xs font-semibold shadow-sm sm:flex-none ${
                    selectedItems.length === 0 || creatingPoster
                      ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                      : 'bg-[#B52E2E] text-white hover:bg-[#982525]'
                  }`}
                >
                  {creatingPoster
                    ? t.gallery.storyPreparing
                    : `${t.gallery.storyButton} (${storySelectedCount}/${STORY_MAX_TILES})`}
                </button>

                <p className="basis-full rounded-2xl border border-[#D4DFEE] bg-white/80 px-3 py-2 text-xs font-semibold text-[#33516F]">
                  {posterSelectionLabel}
                </p>
              </>
            ) : null}

            <Link
              href={uploadPageUrl}
              className="inline-flex min-h-9 flex-1 items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-3 py-2 text-center text-xs font-semibold text-[#0F3D66] shadow-sm hover:bg-[#EDF4FB] sm:flex-none"
            >
              {t.gallery.backToUpload}
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[2rem] border border-[#D4DFEE] bg-white p-10 text-center text-[#597594] shadow-[0_16px_40px_rgba(61,44,22,0.08)]">
            {t.gallery.noUploads}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => {
              const isSelected = selected.includes(item.id)
              const downloadName = getUploadShortFileName(item, {
                eventSlug: currentEvent?.albumName || currentEvent?.name || eventIdentifier,
                sequence: shareSequenceById[item.id],
              })
              const actionButtonClass =
                'inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/92 text-[#0F3D66] shadow-[0_8px_20px_rgba(15,61,102,0.18)] backdrop-blur hover:bg-white'

              return (
                <article
                  key={item.id}
                  className={`overflow-hidden rounded-[2rem] border bg-white shadow-[0_16px_40px_rgba(61,44,22,0.08)] ${
                    isSelected ? 'border-stone-900 ring-2 ring-stone-900/10' : 'border-stone-200'
                  }`}
                >
                  <div className="relative">
                    <Image
                      src={item.file_url}
                      alt={downloadName}
                      width={1200}
                      height={1200}
                      unoptimized
                      className="aspect-[4/5] w-full bg-stone-950 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      aria-label={t.gallery.openPreview}
                      title={t.gallery.openPreview}
                      className="absolute inset-0 z-10"
                    />

                    {downloadEnabled || deleteEnabled ? (
                      <button
                        type="button"
                        onClick={() => toggleSelect(item.id)}
                        aria-label={isSelected ? t.gallery.selected : t.gallery.select}
                        title={isSelected ? t.gallery.selected : t.gallery.select}
                        className={`absolute left-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-[0_8px_20px_rgba(15,61,102,0.18)] backdrop-blur ${
                          isSelected
                            ? 'border-white bg-[#0F3D66] text-white ring-2 ring-[#0F3D66]/30'
                            : 'border-white bg-white/95 text-[#0F3D66] hover:bg-white'
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

                    {deleteEnabled ? (
                      <button
                        type="button"
                        onClick={() => deleteSingle(item)}
                        disabled={deletingSelected}
                        aria-label={t.gallery.delete}
                        title={t.gallery.delete}
                        className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#B52E2E] text-white shadow-[0_8px_20px_rgba(181,46,46,0.25)] backdrop-blur hover:bg-[#982525] disabled:cursor-not-allowed disabled:bg-stone-300"
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
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#F58220]/70 bg-[#F58220]/92 text-white shadow-[0_8px_20px_rgba(245,130,32,0.22)] backdrop-blur hover:bg-[#F58220]"
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
        )}
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
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-stone-950 shadow-lg hover:bg-stone-100"
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
                className="absolute left-4 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-stone-950 shadow-lg backdrop-blur hover:bg-white"
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
                className="absolute right-4 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-stone-950 shadow-lg backdrop-blur hover:bg-white"
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
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                  >
                    {t.gallery.share}
                  </button>
                ) : null}
                {downloadEnabled ? (
                  <button
                    type="button"
                    onClick={() => handleDownload(previewItem.file_url, previewDownloadName)}
                    className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#F58220] px-4 text-sm font-semibold text-white hover:bg-[#DB6E12]"
                  >
                    {t.gallery.download}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {posterStyleModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setPosterStyleModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-stone-950">{t.gallery.posterStyleTitle}</h2>
                <p className="mt-1 text-sm font-medium text-[#597594]">
                  {t.gallery.posterStyleDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPosterStyleModalOpen(false)}
                aria-label={t.gallery.cancel}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                  <path d="M6 6l12 12" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => createPoster({ grayscale: false, format: 'poster' })}
                className="rounded-2xl bg-[#F58220] px-4 py-4 text-left text-sm font-bold text-white shadow-sm hover:bg-[#DB6E12]"
              >
                {t.gallery.posterColorOption}
              </button>
              <button
                type="button"
                onClick={() => createPoster({ grayscale: true, format: 'poster' })}
                className="rounded-2xl bg-stone-950 px-4 py-4 text-left text-sm font-bold text-white shadow-sm hover:bg-stone-800"
              >
                {t.gallery.posterBlackWhiteOption}
              </button>
              <button
                type="button"
                onClick={() => setPosterStyleModalOpen(false)}
                className="rounded-2xl border border-[#C8D3E5] bg-white px-4 py-3 text-sm font-bold text-[#0F3D66] hover:bg-[#EDF4FB]"
              >
                {t.gallery.cancel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <SiteFooter />
    </div>
  )
}
