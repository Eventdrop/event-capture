'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { useLanguage } from '@/app/_components/language-provider'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { getPublicAppUrl, getPublicPath } from '@/lib/app-url'
import {
  buildUploadShareCode,
  buildStoragePath,
  getMediaKind,
  getPublicFileUrl,
} from '@/lib/eventdrop'
import {
  formatEventDisplayName,
  getEventRoute,
  normalizeEventRecord,
  type NormalizedEvent,
} from '@/lib/events'
import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'event-uploads'
const MAX_SELECTION_FILES = 10
const PHOTO_MAX_BYTES = 20 * 1024 * 1024
const PHOTO_COMPRESS_THRESHOLD_BYTES = 1.5 * 1024 * 1024
const PHOTO_COMPRESS_MAX_DIMENSION = 2000
const PHOTO_COMPRESS_QUALITY = 0.82
const PHOTO_MAX_ASPECT_RATIO = 2.75
const GUEST_MESSAGE_MAX_LENGTH = 240

function limitGuestMessage(value: string) {
  return value.slice(0, GUEST_MESSAGE_MAX_LENGTH)
}

function getCompressedPhotoName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '') || 'photo'
  return `${baseName}.jpg`
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Image could not be prepared for upload.'))
    }

    image.src = objectUrl
  })
}

async function isPhotoAspectRatioAllowed(file: File) {
  const lowerName = file.name.toLowerCase()

  if (lowerName.endsWith('.heic') || lowerName.endsWith('.heif')) {
    return true
  }

  try {
    const image = await loadImageFromFile(file)
    const width = image.naturalWidth || image.width
    const height = image.naturalHeight || image.height

    if (!width || !height) return true

    return Math.max(width / height, height / width) <= PHOTO_MAX_ASPECT_RATIO
  } catch {
    return true
  }
}

async function compressPhotoForUpload(file: File) {
  const lowerName = file.name.toLowerCase()
  const canCompress =
    file.type.startsWith('image/') &&
    !lowerName.endsWith('.heic') &&
    !lowerName.endsWith('.heif') &&
    !lowerName.endsWith('.gif') &&
    !file.type.includes('svg')

  if (!canCompress || file.size <= PHOTO_COMPRESS_THRESHOLD_BYTES) {
    return file
  }

  try {
    const image = await loadImageFromFile(file)
    const scale = Math.min(
      1,
      PHOTO_COMPRESS_MAX_DIMENSION / image.naturalWidth,
      PHOTO_COMPRESS_MAX_DIMENSION / image.naturalHeight
    )
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    const canvas = document.createElement('canvas')

    canvas.width = width
    canvas.height = height
    canvas.getContext('2d')?.drawImage(image, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', PHOTO_COMPRESS_QUALITY)
    })

    if (!blob || blob.size >= file.size) {
      return file
    }

    return new File([blob], getCompressedPhotoName(file.name), {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    })
  } catch (error) {
    console.error('Photo compression failed, uploading original file', error)
    return file
  }
}

export default function Page() {
  const { t } = useLanguage()
  const params = useParams()
  const eventIdentifier = params.id as string
  const consentStorageKey = useMemo(
    () => `eventdrop-upload-consent:${eventIdentifier}`,
    [eventIdentifier]
  )
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [resolvedEventId, setResolvedEventId] = useState('')
  const [currentEvent, setCurrentEvent] = useState<NormalizedEvent | null>(null)
  const [eventName, setEventName] = useState('Gedeeld evenementalbum')
  const [message, setMessage] = useState(t.upload.chooseStart)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [eventMissing, setEventMissing] = useState(false)
  const [guidanceAccepted, setGuidanceAccepted] = useState(false)
  const [guestMessage, setGuestMessage] = useState('')


  useEffect(() => {
    try {
      setGuidanceAccepted(localStorage.getItem(consentStorageKey) === 'true')
    } catch (error) {
      console.error('Failed to load upload consent preference', error)
    }
  }, [consentStorageKey])

  const handleGuidanceAcceptedChange = (checked: boolean) => {
    setGuidanceAccepted(checked)

    try {
      localStorage.setItem(consentStorageKey, checked ? 'true' : 'false')
    } catch (error) {
      console.error('Failed to save upload consent preference', error)
    }
  }

  useEffect(() => {
    if (selectedFiles.length === 0 && !resolvedEventId && !eventMissing) {
      setMessage(t.upload.chooseStart)
    }
  }, [eventMissing, resolvedEventId, selectedFiles.length, t.upload.chooseStart])

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventIdentifier) return

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
      const error = idLookup.error && !idLookup.data ? slugLookup?.error || idLookup.error : null

      if (error) {
        console.error('Failed to load event', error)
        setEventMissing(true)
        setMessage(t.upload.eventNotFound)
        return
      }

      setEventMissing(false)
      const normalizedEvent = normalizeEventRecord(event)
      setCurrentEvent(normalizedEvent)
      setEventName(
        normalizedEvent
          ? formatEventDisplayName(normalizedEvent)
          : 'Gedeeld evenementalbum'
      )
      setResolvedEventId(normalizedEvent?.id || '')
      setMessage(t.upload.intro)
    }

    void loadEvent()
  }, [eventIdentifier, t.upload.eventNotFound, t.upload.intro])

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
        }

        if (!payload.coverImageUrl && !payload.backgroundImageUrl && !payload.posterTemplateUrl) return

        setCurrentEvent((prev) =>
          prev
            ? {
                ...prev,
                coverImageUrl: payload.coverImageUrl || prev.coverImageUrl,
                backgroundImageUrl:
                  payload.backgroundImageUrl || prev.backgroundImageUrl,
                posterTemplateUrl:
                  payload.posterTemplateUrl || prev.posterTemplateUrl,
              }
            : prev
        )
      } catch (error) {
        console.error('Failed to load event branding', error)
      }
    }

    void loadBranding()
  }, [currentEvent?.backgroundImageUrl, currentEvent?.coverImageUrl, currentEvent?.id, eventIdentifier])

  const uploadUrl = useMemo(() => {
    return `${getPublicAppUrl()}${getEventRoute(eventIdentifier)}`
  }, [eventIdentifier])

  const galleryUrl = useMemo(
    () => getPublicPath(`/event/${eventIdentifier}/gallery`),
    [eventIdentifier]
  )


  const acceptedFiles = useMemo(
    () => selectedFiles.filter((file) => getMediaKind(file) !== null),
    [selectedFiles]
  )

  const selectionSummary = useMemo(() => {
    if (acceptedFiles.length === 0) return null

    const photoCount = acceptedFiles.filter(
      (file) => getMediaKind(file) === 'photo'
    ).length

    return {
      total: acceptedFiles.length,
      photoCount,
    }
  }, [acceptedFiles])

  const handleKeepLink = async () => {
    const shareData = {
      title: eventName,
      text: t.upload.keepLinkText,
      url: uploadUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setMessage(t.upload.keepLinkReady)
        return
      }

      await navigator.clipboard.writeText(uploadUrl)
      setMessage(t.upload.keepLinkCopied)
    } catch (error) {
      console.error('Could not share upload link', error)

      try {
        await navigator.clipboard.writeText(uploadUrl)
        setMessage(t.upload.keepLinkCopied)
      } catch {
        setMessage(t.upload.keepLinkError)
      }
    }
  }

  const resetSelection = (options?: { keepMessage?: boolean }) => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }

    setSelectedFiles([])
    if (!options?.keepMessage) {
      setMessage(t.upload.selectionCleared)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const limitedFiles = files.slice(0, MAX_SELECTION_FILES)
    const validFiles: File[] = []
    let unsupportedFiles = 0
    let oversizedPhotos = 0
    let awkwardRatioPhotos = 0

    for (const file of limitedFiles) {
      const mediaKind = getMediaKind(file)

      if (!mediaKind || mediaKind !== 'photo') {
        unsupportedFiles += 1
        continue
      }

      if (file.size > PHOTO_MAX_BYTES) {
        oversizedPhotos += 1
        continue
      }

      if (!(await isPhotoAspectRatioAllowed(file))) {
        awkwardRatioPhotos += 1
        continue
      }

      validFiles.push(file)
    }

    setSelectedFiles(validFiles)

    const notes = [
      unsupportedFiles > 0 ? `${unsupportedFiles} ${t.upload.unsupportedIgnored}` : '',
      oversizedPhotos > 0 ? `${oversizedPhotos} ${t.upload.photoTooLarge}` : '',
      awkwardRatioPhotos > 0 ? `${awkwardRatioPhotos} ${t.upload.photoBadRatio}` : '',
      files.length > MAX_SELECTION_FILES ? t.upload.selectionLimit : '',
    ].filter(Boolean)

    if (validFiles.length === 0) {
      setMessage([t.upload.chooseSupported, ...notes].join(' • '))
      return
    }

    const photoCount = validFiles.filter(
      (file) => getMediaKind(file) === 'photo'
    ).length

    const parts = [
      `${validFiles.length} ${t.upload.filesSelected}`,
      photoCount ? `${photoCount} ${photoCount > 1 ? t.upload.photos : t.upload.photos}` : '',
    ].filter(Boolean)

    setMessage([parts.join(' • '), ...notes].join(' • '))
  }

  const createUploadRecord = async (payload: {
    eventId: string
    fileUrl: string
    storagePath: string
    fileName: string
    shareCode: string
    mediaType: 'photo'
    mimeType: string
    expiresAt: string | null
    guestMessage: string | null
  }) => {
    const richInsert = {
      event_id: payload.eventId,
      file_url: payload.fileUrl,
      storage_path: payload.storagePath,
      file_name: payload.fileName,
      share_code: payload.shareCode,
      media_type: payload.mediaType,
      mime_type: payload.mimeType,
      expires_at: payload.expiresAt,
      guest_message: payload.guestMessage,
      type: payload.mediaType,
    }

    const fallbackInsert = {
      event_id: payload.eventId,
      file_url: payload.fileUrl,
      type: payload.mediaType,
    }

    const { error: richError } = await supabase.from('uploads').insert([richInsert])

    if (!richError) return

    const message = richError.message.toLowerCase()
    const needsFallback =
      message.includes('column') ||
      message.includes('schema cache') ||
      message.includes('could not find')

    if (!needsFallback) {
      throw new Error(`Database error: ${richError.message}`)
    }

    const { error: fallbackError } = await supabase
      .from('uploads')
      .insert([fallbackInsert])

    if (fallbackError) {
      throw new Error(`Database error: ${fallbackError.message}`)
    }
  }

  const handleUpload = async () => {
    if (uploading || eventMissing) return

    if (!guidanceAccepted) {
      setMessage(t.upload.consentRequired)
      return
    }

    if (acceptedFiles.length === 0) {
      setMessage(t.upload.chooseSupported)
      return
    }

    if (!resolvedEventId) {
      setMessage(t.upload.eventNotReady)
      return
    }

    const uploadGuestMessage = limitGuestMessage(guestMessage).trim() || null

    setUploading(true)
    setMessage(t.upload.uploadInProgress)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

      if (!supabaseUrl) {
        throw new Error('De uploadomgeving is niet volledig ingesteld.')
      }

      const existingUploadsCountQuery = await supabase
        .from('uploads')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', resolvedEventId)

      let nextShareSequence = existingUploadsCountQuery.count || 0

      for (const file of acceptedFiles) {
        const mediaType = getMediaKind(file)

        if (!mediaType) continue

        setMessage(`${t.upload.uploadInProgress} ${file.name}`)

        const uploadFile = await compressPhotoForUpload(file)
        const now = new Date()
        const { fileName, storagePath } = buildStoragePath(uploadFile, now)
        const expiresAt = null

        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, uploadFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: uploadFile.type || undefined,
          })

        if (storageError) {
          throw new Error(`Opslaan mislukt: ${storageError.message}`)
        }

        const fileUrl = getPublicFileUrl(supabaseUrl, BUCKET_NAME, storagePath)
        nextShareSequence += 1

        const shareLabel = currentEvent?.albumName || currentEvent?.name || eventIdentifier
        const shareCode =
          buildUploadShareCode(shareLabel, nextShareSequence) ||
          fileName.replace(/\.[^.]+$/, '')

        await createUploadRecord({
          eventId: resolvedEventId,
          fileUrl,
          storagePath,
          fileName,
          shareCode,
          mediaType,
          mimeType: uploadFile.type || '',
          expiresAt,
          guestMessage: uploadGuestMessage,
        })
      }

      setMessage(t.upload.uploadComplete)
      setGuestMessage('')
      resetSelection({ keepMessage: true })
      window.location.assign(galleryUrl)
    } catch (error) {
      console.error('Upload failed', error)
      setMessage(
        error instanceof Error ? error.message : 'Uploaden is niet gelukt.'
      )
    } finally {
      setUploading(false)
    }
  }

  const eventBackgroundStyle = currentEvent?.backgroundImageUrl
    ? {
        backgroundImage: `linear-gradient(rgba(15,33,53,0.34), rgba(15,33,53,0.42)), url(${currentEvent.backgroundImageUrl})`,
      }
    : undefined
  const eventCoverStyle = currentEvent?.coverImageUrl
    ? { backgroundImage: `url(${currentEvent.coverImageUrl})` }
    : undefined

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_#f9f5ee_0%,_#efe8dc_52%,_#edf4fb_100%)] text-stone-900">
      <SiteHeader currentLabel={t.upload.badge} />

      <main
        className="relative flex-1 bg-cover bg-center px-4 py-5 sm:px-6 sm:py-8"
        style={eventBackgroundStyle}
      >
        <section className="mx-auto w-full max-w-5xl rounded-[1.6rem] border border-white/25 bg-[rgba(255,250,242,0.93)] p-4 shadow-[0_18px_50px_rgba(15,33,53,0.18)] backdrop-blur sm:p-5 lg:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
            <div>
              <div
                className="mt-3 h-44 w-full overflow-hidden rounded-[1.2rem] bg-[#EDF4FB] bg-cover bg-center sm:h-52"
                style={eventCoverStyle}
              />
              <h1 className="mt-3 text-sm font-semibold leading-tight text-stone-950 sm:text-sm">
                {eventName}
              </h1>
              {currentEvent?.eventDate ? (
                <p className="mt-1 text-sm font-medium text-[#597594]">
                  {t.common.eventDate}: {currentEvent.eventDate}
                </p>
              ) : null}

              <label className="mt-5 flex items-start gap-3 rounded-[1.1rem] border border-[#D4DFEE] bg-white px-4 py-3 text-sm leading-6 text-[#33516F]">
                <input
                  type="checkbox"
                  checked={guidanceAccepted}
                  onChange={(event) => handleGuidanceAcceptedChange(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#C8D3E5] accent-[#F58220]"
                />
                <span>{t.upload.consentLabel}</span>
              </label>

              <label className="mt-4 block rounded-[1.1rem] border border-[#D4DFEE] bg-white px-4 py-3 text-sm text-[#33516F]">
                <span className="block text-sm font-semibold text-[#0B2742]">
                  {t.upload.messageLabel}
                </span>
                <textarea
                  value={guestMessage}
                  onChange={(event) => setGuestMessage(limitGuestMessage(event.target.value))}
                  maxLength={GUEST_MESSAGE_MAX_LENGTH}
                  placeholder={t.upload.messagePlaceholder}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-2xl border border-[#D4DFEE] bg-[#F8FBFE] px-3 py-2 text-sm text-[#0B2742] outline-none focus:border-[#F58220]"
                />
                <span className="mt-1 block text-xs text-[#6A84A3]">
                  {t.upload.messageHelp}
                </span>
              </label>

              <div className="mt-4 rounded-[1.25rem] border-2 border-dashed border-[#C8D3E5] bg-[#FDFEFE] p-3">
                <p className="mb-3 rounded-full bg-[#EDF4FB] px-4 py-2 text-center text-xs font-semibold text-[#0F3D66]">
                  {t.upload.photoOnlyNotice}
                </p>

                <input
                  ref={inputRef}
                  id="event-media"
                  type="file"
                  name="media"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading || eventMissing}
                  className="sr-only"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label
                    htmlFor="event-media"
                    className={`inline-flex cursor-pointer items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${
                      uploading || eventMissing
                        ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                        : 'bg-[#0F3D66] text-white hover:bg-[#0B2F4F]'
                    }`}
                  >
                    {t.upload.selectButton}
                  </label>

                  <p className="min-w-0 flex-1 truncate text-sm text-[#597594]">
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} ${t.upload.filesSelected}`
                      : t.upload.noFilesChosen}
                  </p>

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading || eventMissing || !guidanceAccepted}
                    className={`rounded-full px-5 py-3 text-sm font-semibold shadow-[0_12px_22px_rgba(245,130,32,0.18)] ${
                      uploading || eventMissing || !guidanceAccepted
                        ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                        : 'bg-[#F58220] text-white hover:bg-[#DB6E12]'
                    }`}
                  >
                    {uploading ? t.upload.uploadingButton : t.upload.uploadButton}
                  </button>

                  <button
                    type="button"
                    onClick={() => resetSelection()}
                    disabled={uploading}
                    className="rounded-full border border-[#C8D3E5] bg-white px-5 py-3 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                  >
                    {t.upload.clearSelection}
                  </button>

                  <Link
                    href={galleryUrl}
                    className="rounded-full border border-[#C8D3E5] bg-white px-5 py-3 text-center text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                  >
                    {t.upload.viewGallery}
                  </Link>
                </div>
              </div>

              <div className="mt-4 rounded-[1.1rem] border border-[#D4DFEE] bg-white px-4 py-3 text-sm text-[#33516F]">
                {selectionSummary ? (
                  <p className="font-medium text-stone-900">
                    {t.upload.readyPrefix} {selectionSummary.total} {t.upload.filesSelected}
                    {selectionSummary.photoCount
                      ? ` • ${selectionSummary.photoCount} ${t.upload.photos}`
                      : ''}
                  </p>
                ) : null}
                <p className={selectionSummary ? 'mt-1 break-words leading-6' : 'break-words leading-6'}>{message}</p>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-[#D4DFEE] bg-white p-4 text-stone-950 lg:sticky lg:top-5">
              <div className="flex items-center justify-between gap-3 lg:block">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                    QR-code
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#0B2742]">
                    {t.upload.albumLink}
                  </p>
                </div>
                <div className="shrink-0 rounded-[1rem] border border-stone-200 bg-white p-2">
                  <QRCodeSVG value={uploadUrl || eventIdentifier} size={132} />
                </div>
              </div>
              <button
                type="button"
                onClick={handleKeepLink}
                className="mt-3 w-full rounded-full bg-[#0F3D66] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0B2F4F]"
              >
                {t.upload.keepLinkButton}
              </button>
              <p className="mt-3 hidden break-all text-xs leading-5 text-stone-500 lg:block">
                {uploadUrl || eventIdentifier}
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
