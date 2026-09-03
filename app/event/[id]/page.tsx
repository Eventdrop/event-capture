'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { useLanguage } from '@/app/_components/language-provider'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import {
  buildUploadShareCode,
  buildStoragePath,
  getMediaKind,
  getPublicFileUrl,
} from '@/lib/eventdrop'
import {
  getEventRoute,
  normalizeEventRecord,
  type NormalizedEvent,
} from '@/lib/events'
import { supabase } from '@/lib/supabase'
import { locales, type Locale } from '@/lib/i18n'

const BUCKET_NAME = 'event-uploads'
const MAX_SELECTION_FILES = 30
const PHOTO_MAX_BYTES = 20 * 1024 * 1024
const PHOTO_COMPRESS_THRESHOLD_BYTES = 1.5 * 1024 * 1024
const PHOTO_COMPRESS_MAX_DIMENSION = 2000
const PHOTO_COMPRESS_QUALITY = 0.82
const PHOTO_MAX_ASPECT_RATIO = 2.2
const PHOTO_STRIP_MIN_ASPECT_RATIO = 2.4
const PHOTO_STRIP_MAX_ASPECT_RATIO = 3.4
const GUEST_MESSAGE_MAX_LENGTH = 500

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

    const normalPhotoRatio = Math.max(width / height, height / width)
    const verticalPhotoStripRatio = height / width

    return (
      normalPhotoRatio <= PHOTO_MAX_ASPECT_RATIO ||
      (
        verticalPhotoStripRatio >= PHOTO_STRIP_MIN_ASPECT_RATIO &&
        verticalPhotoStripRatio <= PHOTO_STRIP_MAX_ASPECT_RATIO
      )
    )
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
  const { t, locale, setLocale } = useLanguage()
  const params = useParams()
  const eventIdentifier = params.id as string
  const consentStorageKey = useMemo(
    () => `eventdrop-upload-consent:${eventIdentifier}`,
    [eventIdentifier]
  )
  const inputRef = useRef<HTMLInputElement | null>(null)
  const initializedLocaleForEventRef = useRef('')

  const [resolvedEventId, setResolvedEventId] = useState('')
  const [currentEvent, setCurrentEvent] = useState<NormalizedEvent | null>(null)
  const [eventName, setEventName] = useState(t.upload.defaultAlbumName)
  const [message, setMessage] = useState(t.upload.chooseStart)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [eventMissing, setEventMissing] = useState(false)
  const [guidanceAccepted, setGuidanceAccepted] = useState(false)
  const [selectedGuestbookPhotoIndex, setSelectedGuestbookPhotoIndex] = useState(-1)
  const [guestName, setGuestName] = useState('')
  const [guestMessage, setGuestMessage] = useState('')

  useEffect(() => {
    if (!currentEvent) return
    if (initializedLocaleForEventRef.current === eventIdentifier) return

    const requestedLocale = new URLSearchParams(window.location.search).get('lang')

    setLocale(
      requestedLocale && locales.includes(requestedLocale as Locale)
        ? requestedLocale as Locale
        : currentEvent.defaultLocale,
      { persist: false }
    )
    initializedLocaleForEventRef.current = eventIdentifier
  }, [currentEvent, eventIdentifier, setLocale])


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
      const error = event ? null : slugLookup?.error || idLookup.error

      if (error) {
        console.error('Failed to load event', error)
        setEventMissing(true)
        setMessage(t.upload.eventNotFound)
        return
      }

      setEventMissing(false)
      const normalizedEvent = normalizeEventRecord(event)
      setCurrentEvent(normalizedEvent)
      setEventName(normalizedEvent?.albumName || normalizedEvent?.name || t.upload.defaultAlbumName)
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

  const uploadPath = useMemo(() => getEventRoute(eventIdentifier), [eventIdentifier])
  const uploadUrl = useMemo(() => {
    if (typeof window === 'undefined') return uploadPath

    return new URL(uploadPath, window.location.origin).toString()
  }, [uploadPath])

  const galleryUrl = useMemo(
    () => `/event/${eventIdentifier}/gallery?lang=${locale}`,
    [eventIdentifier, locale]
  )


  const acceptedFiles = useMemo(
    () => selectedFiles.filter((file) => getMediaKind(file) !== null),
    [selectedFiles]
  )
  const hasSelectedPhotos = acceptedFiles.length > 0
  const guestbookEnabled = currentEvent?.guestbookEnabled !== false

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
  const selectedUploadPhotoPreviews = useMemo(
    () =>
      acceptedFiles.map((file, index) => ({
        index,
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [acceptedFiles]
  )
  const selectedFilePreviews = selectedUploadPhotoPreviews.slice(0, 8)

  useEffect(
    () => () => {
      selectedUploadPhotoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    },
    [selectedUploadPhotoPreviews]
  )

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

  const resetGuestbookFields = () => {
    setSelectedGuestbookPhotoIndex(-1)
    setGuestName('')
    setGuestMessage('')
  }

  const resetSelection = (options?: { keepMessage?: boolean }) => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }

    setSelectedFiles([])
    resetGuestbookFields()
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
    setSelectedGuestbookPhotoIndex(-1)

    const notes = [
      unsupportedFiles > 0 ? `${unsupportedFiles} ${t.upload.unsupportedIgnored}` : '',
      oversizedPhotos > 0 ? `${oversizedPhotos} ${t.upload.photoTooLarge}` : '',
      awkwardRatioPhotos > 0 ? `${awkwardRatioPhotos} ${t.upload.photoBadRatio}` : '',
      files.length > MAX_SELECTION_FILES ? t.upload.selectionLimit : '',
    ].filter(Boolean)

    if (validFiles.length === 0) {
      resetGuestbookFields()
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
      guest_message: payload.guestMessage,
      type: payload.mediaType,
    }

    const fallbackInsert = {
      event_id: payload.eventId,
      file_url: payload.fileUrl,
      type: payload.mediaType,
    }

    const compatibleInsert = {
      ...fallbackInsert,
      share_code: payload.shareCode,
      guest_message: payload.guestMessage,
    }

    const legacyMessageInsert = {
      ...fallbackInsert,
      message: payload.guestMessage,
    }

    const { data: richData, error: richError } = await supabase
      .from('uploads')
      .insert([richInsert])
      .select('*')
      .single()

    if (!richError) return richData as { id?: string } | null

    const message = richError.message.toLowerCase()
    const needsFallback =
      message.includes('column') ||
      message.includes('schema cache') ||
      message.includes('could not find')

    if (!needsFallback) {
      throw new Error(`Database error: ${richError.message}`)
    }

    const fallbackAttempts = payload.guestMessage
      ? [compatibleInsert, legacyMessageInsert, fallbackInsert]
      : [compatibleInsert, fallbackInsert]

    let lastFallbackError = richError

    for (const insertPayload of fallbackAttempts) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('uploads')
        .insert([insertPayload])
        .select('*')
        .single()

      if (!fallbackError) return fallbackData as { id?: string } | null

      lastFallbackError = fallbackError
    }

    throw new Error(`Database error: ${lastFallbackError.message}`)
  }

  const createUploadLinkedGuestbookEntry = async (input: {
    guestName: string
    message: string
    relatedUploadId: string
  }) => {
    const response = await fetch('/api/guestbook-messages', {
      body: JSON.stringify({
        event: resolvedEventId || eventIdentifier,
        guestName: input.guestName,
        message: input.message,
        relatedUploadId: input.relatedUploadId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null

      throw new Error(payload?.error || t.upload.guestbookPostError)
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

    const uploadGuestName = guestbookEnabled ? guestName.trim() : ''
    const uploadGuestMessage = guestbookEnabled
      ? limitGuestMessage(guestMessage).trim()
      : ''
    const selectedGuestbookFile =
      selectedGuestbookPhotoIndex >= 0
        ? acceptedFiles[selectedGuestbookPhotoIndex] || null
        : null
    let firstSuccessfulUploadId = ''
    let selectedGuestbookUploadId = ''

    setUploading(true)
    setMessage(t.upload.uploadInProgress)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

      if (!supabaseUrl) {
        throw new Error(t.upload.uploadEnvironmentError)
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

        const uploadRecord = await createUploadRecord({
          eventId: resolvedEventId,
          fileUrl,
          storagePath,
          fileName,
          shareCode,
          mediaType,
          mimeType: uploadFile.type || '',
          guestMessage: null,
        })

        if (!firstSuccessfulUploadId && uploadRecord?.id) {
          firstSuccessfulUploadId = uploadRecord.id
        }

        if (selectedGuestbookFile === file && uploadRecord?.id) {
          selectedGuestbookUploadId = uploadRecord.id
        }
      }

      if (uploadGuestMessage && firstSuccessfulUploadId) {
        await createUploadLinkedGuestbookEntry({
          guestName: uploadGuestName,
          message: uploadGuestMessage,
          relatedUploadId: selectedGuestbookUploadId || firstSuccessfulUploadId,
        })
      }

      setMessage(t.upload.uploadComplete)
      resetGuestbookFields()
      resetSelection({ keepMessage: true })
      window.location.assign(galleryUrl)
    } catch (error) {
      console.error('Upload failed', error)
      setMessage(
        error instanceof Error ? error.message : t.upload.uploadFailedFallback
      )
    } finally {
      setUploading(false)
    }
  }

  const eventCoverStyle = currentEvent?.coverImageUrl
    ? { backgroundImage: `url(${currentEvent.coverImageUrl})` }
    : undefined

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8] text-[#161616]">
      <SiteHeader
        currentLabel={t.upload.badge}
        brandHref={uploadPath}
      />

      <main className="relative flex-1 px-3 py-3 sm:px-6 sm:py-5">
        <section className="mx-auto w-full max-w-4xl">
          <div
            className="relative h-40 w-full overflow-hidden rounded-[0.9rem] bg-[#E9EEF3] bg-cover bg-center sm:h-52"
            style={eventCoverStyle}
          >
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/28 to-transparent px-4 pb-4 pt-14">
              <h1 className="text-2xl font-bold leading-tight text-white drop-shadow-sm sm:text-3xl">
                {eventName}
              </h1>
              {currentEvent?.eventDate ? (
                <p className="mt-1 text-xs font-semibold text-white/85 sm:text-sm">
                  {currentEvent.eventDate}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-3 w-full rounded-[1rem] border border-[#E3E7EC] bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.06)] sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-bold text-[#161616]">
                  {t.gallery.backToUpload}
                </p>
                <p className="mt-1 text-sm text-[#6B7280]">
                  {t.upload.photoOnlyNotice}
                </p>
              </div>
              <label
                htmlFor="event-media"
                className={`inline-flex w-fit cursor-pointer items-center justify-center rounded-full px-3.5 py-2 text-xs font-bold shadow-[0_10px_22px_rgba(185,31,50,0.22)] ${
                  uploading || eventMissing
                    ? 'cursor-not-allowed bg-stone-300 text-stone-500 shadow-none'
                    : 'bg-[linear-gradient(135deg,#7f1424_0%,#b91f32_55%,#e32636_100%)] text-white hover:brightness-105'
                }`}
              >
                {t.upload.selectButton}
              </label>
            </div>

            {!guidanceAccepted ? (
              <p className="mt-3 rounded-xl border border-[#F9C58E] bg-[#FFF4E8] px-3 py-2 text-xs font-semibold text-[#8A4A07]">
                {t.upload.uploadNeedsConsent}
              </p>
            ) : null}

            <input
              ref={inputRef}
              id="event-media"
              type="file"
              name="media"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={uploading || eventMissing}
              className="sr-only"
            />

            <div className="mt-3 flex flex-col gap-2">
              <p className="min-w-0 truncate text-sm font-medium text-[#6B7280]">
                {hasSelectedPhotos
                  ? `${acceptedFiles.length} ${t.upload.filesSelected}`
                  : t.upload.noFilesChosen}
              </p>
              {selectedFilePreviews.length ? (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {selectedFilePreviews.map((preview) => (
                    <img
                      key={preview.url}
                      src={preview.url}
                      alt={preview.name}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {!guestbookEnabled ? null : !hasSelectedPhotos ? (
              <p className="mt-3 rounded-xl border border-[#F0E1CF] bg-[#FFF9F2] px-3 py-2 text-xs font-semibold text-[#7A4A14]">
                {t.upload.guestbookHint}
              </p>
            ) : (
              <div className="mt-3 rounded-[0.9rem] border border-[#E8D9C7] bg-[#FFF9F2] px-3 py-3 text-sm text-[#4B5563]">
                <p className="text-sm font-bold text-[#161616]">
                  {t.upload.guestbookCardTitle}
                </p>

                <div className="mt-2">
                  <p className="text-xs font-semibold text-[#33516F]">
                    {t.upload.guestbookPhotoLabel}
                  </p>
                  <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
                    {selectedUploadPhotoPreviews.map((preview) => {
                      const selected = selectedGuestbookPhotoIndex === preview.index

                      return (
                        <button
                          key={preview.url}
                          type="button"
                          onClick={() => setSelectedGuestbookPhotoIndex(preview.index)}
                          disabled={uploading}
                          className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white ${
                            selected
                              ? 'border-[#B91F32] ring-2 ring-[#B91F32]/25'
                              : 'border-[#E3E7EC] hover:border-[#C8D3E5]'
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                          aria-pressed={selected}
                          title={preview.name}
                        >
                          <img
                            src={preview.url}
                            alt={preview.name}
                            className="h-full w-full object-cover"
                          />
                          {selected ? (
                            <span className="absolute inset-x-1 bottom-1 rounded-full bg-[linear-gradient(135deg,#7f1424_0%,#b91f32_55%,#e32636_100%)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                              {t.upload.guestbookPhotoSelected}
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-[#33516F]">
                    {t.upload.guestNameLabel}
                    <input
                      value={guestName}
                      onChange={(event) => setGuestName(event.target.value)}
                      disabled={uploading}
                      placeholder={t.upload.guestNamePlaceholder}
                      className="mt-1.5 w-full rounded-lg border border-[#E3E7EC] bg-white px-3 py-2 text-sm text-[#161616] outline-none focus:border-[#B91F32] disabled:opacity-60"
                    />
                  </label>

                  <label className="block text-xs font-semibold text-[#33516F] sm:col-span-2">
                    {t.upload.messageLabel}
                    <textarea
                      value={guestMessage}
                      onChange={(event) => setGuestMessage(limitGuestMessage(event.target.value))}
                      disabled={uploading}
                      maxLength={GUEST_MESSAGE_MAX_LENGTH}
                      placeholder={t.upload.messagePlaceholder}
                      rows={2}
                      className="mt-1.5 w-full resize-none rounded-lg border border-[#E3E7EC] bg-white px-3 py-2 text-sm text-[#161616] outline-none focus:border-[#B91F32] disabled:opacity-60"
                    />
                    <span className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-[#6A84A3]">
                      <span>
                        {guestMessage.length === GUEST_MESSAGE_MAX_LENGTH
                          ? t.upload.messageLimitReached
                          : ''}
                      </span>
                      <span>
                        {guestMessage.length} / {GUEST_MESSAGE_MAX_LENGTH}
                      </span>
                    </span>
                  </label>
                </div>

                <span className="mt-1 block text-xs font-medium text-[#6A84A3]">
                  {t.upload.messageHelp}
                </span>
              </div>
            )}

            <label className="mt-3 flex items-start gap-2 rounded-xl border border-[#E3E7EC] bg-[#F8FAFC] px-3 py-2 text-xs leading-5 text-[#4B5563]">
              <input
                type="checkbox"
                checked={guidanceAccepted}
                onChange={(event) => handleGuidanceAcceptedChange(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#C8D3E5] accent-[#B91F32]"
              />
              <span>{t.upload.consentLabel}</span>
            </label>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || eventMissing || !guidanceAccepted}
                className={`rounded-full px-4 py-2 text-xs font-semibold shadow-[0_10px_20px_rgba(185,31,50,0.18)] ${
                  uploading || eventMissing || !guidanceAccepted
                    ? 'cursor-not-allowed bg-stone-300 text-stone-500 shadow-none'
                    : 'bg-[linear-gradient(135deg,#7f1424_0%,#b91f32_55%,#e32636_100%)] text-white hover:brightness-105'
                }`}
              >
                {uploading ? t.upload.uploadingButton : t.upload.uploadButton}
              </button>

              {hasSelectedPhotos ? (
                <button
                  type="button"
                  onClick={() => resetSelection()}
                  disabled={uploading}
                  className="rounded-full border border-[#C8D3E5] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB] disabled:opacity-60"
                >
                  {t.upload.clearSelection}
                </button>
              ) : null}

              <Link
                href={galleryUrl}
                className="rounded-full border border-[#C8D3E5] bg-white px-3.5 py-2 text-center text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
              >
                {t.upload.viewGallery}
              </Link>
            </div>
          </div>

          <div className="mt-3 rounded-[0.9rem] border border-[#E3E7EC] bg-white px-4 py-3 text-sm text-[#4B5563]">
            {selectionSummary ? (
              <p className="font-semibold text-[#161616]">
                {t.upload.readyPrefix} {selectionSummary.total} {t.upload.filesSelected}
                {selectionSummary.photoCount
                  ? ` • ${selectionSummary.photoCount} ${t.upload.photos}`
                  : ''}
              </p>
            ) : null}
            <p className={selectionSummary ? 'mt-1 break-words leading-6' : 'break-words leading-6'}>{message}</p>
          </div>

          <div className="mt-3 rounded-[0.9rem] border border-[#E3E7EC] bg-white p-3 text-[#161616]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#161616]">
                  {t.upload.shareSectionTitle}
                </p>
                <p className="mt-1 truncate text-xs font-medium text-[#6B7280]">
                  {t.upload.albumLink}
                </p>
              </div>
              <div className="shrink-0 rounded-lg border border-stone-200 bg-white p-1.5">
                <QRCodeSVG value={uploadUrl || eventIdentifier} size={84} />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleKeepLink}
                className="rounded-full border border-[#C8D3E5] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
              >
                {t.upload.keepLinkButton}
              </button>
              <p className="min-w-0 flex-1 break-all text-xs leading-5 text-stone-500">
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
