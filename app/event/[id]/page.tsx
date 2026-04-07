'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { useLanguage } from '@/app/_components/language-provider'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { getPublicAppUrl } from '@/lib/app-url'
import {
  addHours,
  buildStoragePath,
  getMediaKind,
  getPublicFileUrl,
} from '@/lib/eventdrop'
import { formatEventDisplayName, normalizeEventRecord } from '@/lib/events'
import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'event-uploads'

export default function Page() {
  const { t } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const eventIdentifier = params.id as string
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [resolvedEventId, setResolvedEventId] = useState('')
  const [eventName, setEventName] = useState('Shared Event Album')
  const [message, setMessage] = useState(t.upload.chooseStart)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [eventMissing, setEventMissing] = useState(false)
  const [guidanceAccepted, setGuidanceAccepted] = useState(false)

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
      setEventName(
        normalizedEvent
          ? formatEventDisplayName(normalizedEvent)
          : 'Shared Event Album'
      )
      setResolvedEventId(normalizedEvent?.id || '')
      setMessage(t.upload.intro)
    }

    void loadEvent()
  }, [eventIdentifier, t.upload.eventNotFound, t.upload.intro])

  const uploadUrl = useMemo(() => {
    return `${getPublicAppUrl()}/event/${eventIdentifier}`
  }, [eventIdentifier])

  const acceptedFiles = useMemo(
    () => selectedFiles.filter((file) => getMediaKind(file) !== null),
    [selectedFiles]
  )

  const selectionSummary = useMemo(() => {
    if (acceptedFiles.length === 0) return null

    const photoCount = acceptedFiles.filter(
      (file) => getMediaKind(file) === 'photo'
    ).length
    const videoCount = acceptedFiles.filter(
      (file) => getMediaKind(file) === 'video'
    ).length

    return {
      total: acceptedFiles.length,
      photoCount,
      videoCount,
    }
  }, [acceptedFiles])

  const resetSelection = (options?: { keepMessage?: boolean }) => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }

    setSelectedFiles([])
    if (!options?.keepMessage) {
      setMessage(t.upload.selectionCleared)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!guidanceAccepted) {
      setMessage(t.upload.consentRequired)
      return
    }

    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)

    const validFiles = files.filter((file) => getMediaKind(file) !== null)
    const ignoredFiles = files.length - validFiles.length

    if (validFiles.length === 0) {
      setMessage(t.upload.chooseSupported)
      return
    }

    const photoCount = validFiles.filter(
      (file) => getMediaKind(file) === 'photo'
    ).length
    const videoCount = validFiles.filter(
      (file) => getMediaKind(file) === 'video'
    ).length

    const parts = [
      `${validFiles.length} ${t.upload.filesSelected}`,
      photoCount ? `${photoCount} ${photoCount > 1 ? t.upload.photos : t.upload.photos}` : '',
      videoCount ? `${videoCount} ${videoCount > 1 ? t.upload.videos : t.upload.videos}` : '',
    ].filter(Boolean)

    const ignoredNote = ignoredFiles > 0 ? ` • ${ignoredFiles} ${t.upload.unsupportedIgnored}` : ''

    setMessage(`${parts.join(' • ')}${ignoredNote}`)
  }

  const createUploadRecord = async (payload: {
    eventId: string
    fileUrl: string
    storagePath: string
    fileName: string
    mediaType: 'photo' | 'video'
    mimeType: string
    expiresAt: string
  }) => {
    const richInsert = {
      event_id: payload.eventId,
      file_url: payload.fileUrl,
      storage_path: payload.storagePath,
      file_name: payload.fileName,
      media_type: payload.mediaType,
      mime_type: payload.mimeType,
      expires_at: payload.expiresAt,
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

    setUploading(true)
    setMessage(t.upload.uploadInProgress)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

      if (!supabaseUrl) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing.')
      }

      for (const file of acceptedFiles) {
        const mediaType = getMediaKind(file)

        if (!mediaType) continue

        const now = new Date()
        const { fileName, storagePath } = buildStoragePath(file, now)
        const expiresAt = addHours(now, 48).toISOString()

        setMessage(`${t.upload.uploadInProgress} ${file.name}`)

        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type || undefined,
          })

        if (storageError) {
          throw new Error(`Storage error: ${storageError.message}`)
        }

        const fileUrl = getPublicFileUrl(supabaseUrl, BUCKET_NAME, storagePath)

        await createUploadRecord({
          eventId: resolvedEventId,
          fileUrl,
          storagePath,
          fileName,
          mediaType,
          mimeType: file.type || '',
          expiresAt,
        })
      }

      setMessage(t.upload.uploadComplete)
      resetSelection({ keepMessage: true })
      router.push(`/event/${eventIdentifier}/gallery`)
    } catch (error) {
      console.error('Upload failed', error)
      setMessage(
        error instanceof Error ? error.message : 'Upload failed unexpectedly.'
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_#f9f5ee_0%,_#efe8dc_52%,_#edf4fb_100%)] text-stone-900">
      <SiteHeader currentLabel={t.upload.badge} />

      <main className="flex-1 p-6">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-[#D4DFEE] bg-white/84 p-6 shadow-[0_18px_50px_rgba(61,44,22,0.12)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6A84A3]">
            {t.upload.badge}
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-950">
            {eventName}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#33516F]">
            {t.upload.intro}
          </p>

          <div className="mt-8 rounded-[1.75rem] border border-[#D4DFEE] bg-[#FFF8EF] p-5 shadow-[0_10px_25px_rgba(245,130,32,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C76B14]">
              {t.upload.guidanceBadge}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0B2742]">
              {t.upload.guidanceTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#33516F]">
              {t.upload.guidanceIntro}
            </p>

            <ul className="mt-4 space-y-3 text-sm leading-7 text-[#33516F]">
              {t.upload.guidancePoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#F58220]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <label className="mt-5 flex items-start gap-3 rounded-[1.2rem] border border-[#F3D2AF] bg-white px-4 py-4">
              <input
                type="checkbox"
                checked={guidanceAccepted}
                onChange={(event) => setGuidanceAccepted(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[#C8D3E5] text-[#F58220] focus:ring-[#F58220]"
              />
              <span className="text-sm leading-6 text-[#33516F]">
                <span className="font-medium text-[#0B2742]">
                  {t.upload.consentLabel}
                </span>
                <span className="mt-1 block">{t.upload.consentHelp}</span>
              </span>
            </label>
          </div>

          <div className="mt-8 grid gap-4 rounded-[1.75rem] border border-[#D4DFEE] bg-[#F7FAFD] p-5 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#6A84A3]">
                {t.upload.uploadLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#33516F]">
                {t.upload.selectLabel}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#6A84A3]">
                {t.upload.namingLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#33516F]">
                {t.upload.namingText}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#6A84A3]">
                {t.upload.retentionLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#33516F]">
                {t.upload.retentionText}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <label
              htmlFor="event-media"
              className="block text-sm font-medium text-[#0B2742]"
            >
              {t.upload.selectLabel}
            </label>

            <div className="rounded-[1.5rem] border-2 border-dashed border-[#C8D3E5] bg-[#FDFEFE] p-4">
              <input
                ref={inputRef}
                id="event-media"
                type="file"
                name="media"
                multiple
                accept="image/*,video/mp4,video/quicktime,video/webm"
                onChange={handleFileChange}
                disabled={uploading || eventMissing || !guidanceAccepted}
                className="sr-only"
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor="event-media"
                  className={`inline-flex cursor-pointer items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${
                    uploading || eventMissing
                      ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                      : !guidanceAccepted
                        ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                        : 'bg-[#0F3D66] text-white hover:bg-[#0B2F4F]'
                  }`}
                >
                  {t.upload.selectButton}
                </label>

                <p className="text-sm text-[#597594]">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} ${t.upload.filesSelected}`
                    : t.upload.noFilesChosen}
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#D4DFEE] bg-white px-4 py-4 text-sm text-[#33516F]">
              {selectionSummary ? (
                <p className="font-medium text-stone-900">
                  {t.upload.readyPrefix} {selectionSummary.total} {t.upload.filesSelected}
                  {selectionSummary.photoCount
                    ? ` • ${selectionSummary.photoCount} ${t.upload.photos}`
                    : ''}
                  {selectionSummary.videoCount
                    ? ` • ${selectionSummary.videoCount} ${t.upload.videos}`
                    : ''}
                </p>
              ) : null}

              <p className="mt-2 break-words leading-6">{message}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || eventMissing || !guidanceAccepted}
                className={`w-full rounded-full px-5 py-4 text-base font-semibold shadow-[0_14px_26px_rgba(245,130,32,0.2)] sm:w-auto ${
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
                className="w-full rounded-full border border-[#C8D3E5] bg-white px-5 py-3 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB] sm:w-auto"
              >
                {t.upload.clearSelection}
              </button>

              <Link
                href={`/event/${eventIdentifier}/gallery`}
                className="w-full rounded-full border border-[#C8D3E5] bg-white px-5 py-3 text-center text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB] sm:w-auto"
              >
                {t.upload.viewGallery}
              </Link>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-[2rem] border border-[#D4DFEE] bg-[#0F3D66] p-6 text-stone-50 shadow-[0_18px_50px_rgba(35,24,12,0.22)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#BFD4EA]">
              {t.upload.qrTitle}
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              {t.upload.qrTitle}
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#DDEAF7]">
              {t.upload.qrText}
            </p>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white p-5 text-stone-950">
            <div className="flex justify-center rounded-[1.5rem] border border-stone-200 bg-white p-4">
              <QRCodeSVG value={uploadUrl || eventIdentifier} size={220} />
            </div>

            <p className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-stone-500">
              {t.upload.albumLink}
            </p>

            <p className="mt-3 break-all text-center text-sm leading-6 text-stone-700">
              {uploadUrl || `${t.common.eventId}: ${eventIdentifier}`}
            </p>
          </div>
        </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
