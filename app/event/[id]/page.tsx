'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import {
  addHours,
  buildStoragePath,
  getMediaKind,
  getPublicFileUrl,
} from '@/lib/eventdrop'
import { normalizeEventRecord } from '@/lib/events'
import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'event-uploads'

export default function Page() {
  const params = useParams()
  const router = useRouter()
  const eventIdentifier = params.id as string
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [resolvedEventId, setResolvedEventId] = useState('')
  const [eventName, setEventName] = useState('Shared Event Album')
  const [message, setMessage] = useState('Choose photos or videos to get started.')
  const [uploading, setUploading] = useState(false)
  const [pageOrigin, setPageOrigin] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [eventMissing, setEventMissing] = useState(false)

  useEffect(() => {
    setPageOrigin(window.location.origin)
  }, [])

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
        setMessage('This event could not be found. Check the QR code or event link.')
        return
      }

      setEventMissing(false)
      const normalizedEvent = normalizeEventRecord(event)
      setEventName(
        normalizedEvent
          ? `${normalizedEvent.name} · ${normalizedEvent.albumName}`
          : 'Shared Event Album'
      )
      setResolvedEventId(normalizedEvent?.id || '')
      setMessage('Guests can add photos and videos to this shared gallery.')
    }

    void loadEvent()
  }, [eventIdentifier])

  const uploadUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_APP_URL || pageOrigin
    return base ? `${base}/event/${eventIdentifier}` : ''
  }, [eventIdentifier, pageOrigin])

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

  const resetSelection = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }

    setSelectedFiles([])
    setMessage('Selection cleared.')
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)

    const validFiles = files.filter((file) => getMediaKind(file) !== null)
    const ignoredFiles = files.length - validFiles.length

    if (validFiles.length === 0) {
      setMessage('Choose JPG, PNG, WEBP, HEIC, MP4, MOV, or WEBM files.')
      return
    }

    const photoCount = validFiles.filter(
      (file) => getMediaKind(file) === 'photo'
    ).length
    const videoCount = validFiles.filter(
      (file) => getMediaKind(file) === 'video'
    ).length

    const parts = [
      `${validFiles.length} file${validFiles.length > 1 ? 's' : ''} selected`,
      photoCount ? `${photoCount} photo${photoCount > 1 ? 's' : ''}` : '',
      videoCount ? `${videoCount} video${videoCount > 1 ? 's' : ''}` : '',
    ].filter(Boolean)

    const ignoredNote =
      ignoredFiles > 0
        ? ` ${ignoredFiles} unsupported file${ignoredFiles > 1 ? 's were' : ' was'} ignored.`
        : ''

    setMessage(`${parts.join(' • ')}.${ignoredNote}`)
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

    if (acceptedFiles.length === 0) {
      setMessage('Select at least one supported photo or video before uploading.')
      return
    }

    if (!resolvedEventId) {
      setMessage('This event is not ready for uploads yet.')
      return
    }

    setUploading(true)
    setMessage(
      `Uploading ${acceptedFiles.length} item${acceptedFiles.length > 1 ? 's' : ''}...`
    )

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

        setMessage(`Uploading ${file.name}...`)

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

      setMessage('Upload complete. Opening shared gallery...')
      resetSelection()
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
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_#f6f2ea_0%,_#efe8dc_100%)] text-stone-900">
      <SiteHeader currentLabel="Guest Upload" />

      <main className="flex-1 p-6">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(61,44,22,0.12)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Shared upload page
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
            {eventName}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
            Guests can upload photos and short videos to this album. Files are
            intended to stay available for 48 hours before cleanup.
          </p>

          <div className="mt-8 grid gap-4 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                Upload
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Photos and videos from guest phones.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                Naming
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Files are stored under date-based folders using the DD-MM-YYYY
                pattern.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                Retention
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Expired media should be cleaned automatically after 48 hours.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <label
              htmlFor="event-media"
              className="block text-sm font-medium text-stone-700"
            >
              Select media
            </label>

            <input
              ref={inputRef}
              id="event-media"
              type="file"
              name="media"
              multiple
              accept="image/*,video/mp4,video/quicktime,video/webm"
              onChange={handleFileChange}
              disabled={uploading || eventMissing}
              className="block w-full rounded-2xl border border-stone-300 bg-white px-4 py-4 text-sm text-stone-700"
            />

            <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4 text-sm text-stone-700">
              {selectionSummary ? (
                <p className="font-medium text-stone-900">
                  Ready to upload {selectionSummary.total} item
                  {selectionSummary.total > 1 ? 's' : ''}
                  {selectionSummary.photoCount
                    ? ` • ${selectionSummary.photoCount} photo${selectionSummary.photoCount > 1 ? 's' : ''}`
                    : ''}
                  {selectionSummary.videoCount
                    ? ` • ${selectionSummary.videoCount} video${selectionSummary.videoCount > 1 ? 's' : ''}`
                    : ''}
                </p>
              ) : null}

              <p className="mt-2 break-words leading-6">{message}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || eventMissing}
                className={`w-full rounded-full px-5 py-4 text-base font-semibold shadow-sm sm:w-auto ${
                  uploading || eventMissing
                    ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                    : 'bg-amber-300 text-stone-950 hover:bg-amber-200'
                }`}
              >
                {uploading ? 'Uploading...' : 'Upload to Shared Album'}
              </button>

              <button
                type="button"
                onClick={resetSelection}
                disabled={uploading}
                className="w-full rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-900 hover:bg-stone-50 sm:w-auto"
              >
                Clear Selection
              </button>

              <Link
                href={`/event/${eventIdentifier}/gallery`}
                className="w-full rounded-full border border-stone-300 bg-white px-5 py-3 text-center text-sm font-semibold text-stone-900 hover:bg-stone-50 sm:w-auto"
              >
                View Gallery
              </Link>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-[2rem] border border-stone-200 bg-stone-950 p-6 text-stone-50 shadow-[0_18px_50px_rgba(35,24,12,0.22)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">
              Share the upload link
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Let guests join by scanning a QR code.
            </h2>

            <p className="mt-3 text-sm leading-7 text-stone-300">
              Put this on a welcome card, event sign, or reception table so
              everyone can drop their best moments into the same album.
            </p>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white p-5 text-stone-950">
            <div className="flex justify-center rounded-[1.5rem] border border-stone-200 bg-white p-4">
              <QRCodeSVG value={uploadUrl || eventIdentifier} size={220} />
            </div>

            <p className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-stone-500">
              Album Link
            </p>

            <p className="mt-3 break-all text-center text-sm leading-6 text-stone-700">
              {uploadUrl || `Event ID: ${eventIdentifier}`}
            </p>
          </div>
        </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
