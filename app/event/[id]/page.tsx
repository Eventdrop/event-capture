'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { QRCodeSVG } from 'qrcode.react'

export default function Page() {
  const params = useParams()
  const eventId = params.id as string

  const inputRef = useRef<HTMLInputElement | null>(null)

  const [eventName, setEventName] = useState('Event Upload')
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [pageOrigin, setPageOrigin] = useState('')
  const [selectedCount, setSelectedCount] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageOrigin(window.location.origin)
    }
  }, [])

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return

      const { data: event, error } = await supabase
        .from('events')
        .select('name')
        .eq('id', eventId)
        .single()

      if (error) {
        console.error('Failed to load event', error)
        setEventName('Event Upload')
        return
      }

      setEventName(event?.name || 'Event Upload')
    }

    void loadEvent()
  }, [eventId])

  const uploadUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_APP_URL || pageOrigin
    return base ? `${base}/event/${eventId}` : ''
  }, [eventId, pageOrigin])

  const isImageFile = (file: File) => {
    if (file.type && file.type.startsWith('image/')) return true

    const name = (file.name || '').toLowerCase()
    return (
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.png') ||
      name.endsWith('.webp') ||
      name.endsWith('.heic') ||
      name.endsWith('.heif')
    )
  }

  const getSafeExtension = (file: File) => {
    const originalName = file.name || ''
    const extFromName = originalName.includes('.')
      ? originalName.split('.').pop()?.toLowerCase()
      : ''

    if (extFromName) return extFromName
    if (file.type.includes('jpeg')) return 'jpg'
    if (file.type.includes('png')) return 'png'
    if (file.type.includes('webp')) return 'webp'
    if (file.type.includes('heic')) return 'heic'
    if (file.type.includes('heif')) return 'heif'

    return 'jpg'
  }

  const resetSelection = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    setSelectedCount(0)
    setMessage('')
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter(isImageFile)
    setSelectedCount(files.length)

    if (files.length === 0) {
      setMessage('Select one or more photos to upload.')
      return
    }

    setMessage(`${files.length} photo${files.length > 1 ? 's' : ''} selected.`)
  }

  const handleUpload = async () => {
    setMessage('Upload button clicked')

    if (uploading) return

    const files = Array.from(inputRef.current?.files || []).filter(isImageFile)

    if (files.length === 0) {
      setMessage('Select at least one photo before uploading.')
      return
    }

    setUploading(true)
    setMessage(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''}...`)

    try {
      for (const file of files) {
        const ext = getSafeExtension(file)
        const safeName = `${eventId}/${Date.now()}-${Math.floor(
          Math.random() * 100000
        )}.${ext}`

        setMessage(`Uploading ${file.name}...`)

        const { error: storageError } = await supabase.storage
          .from('event-uploads')
          .upload(safeName, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type || undefined,
          })

        if (storageError) {
          throw new Error(`Storage error: ${storageError.message}`)
        }

        const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-uploads/${safeName}`

        const { error: dbError } = await supabase.from('uploads').insert([
          {
            event_id: eventId,
            file_url: fileUrl,
            type: 'photo',
          },
        ])

        if (dbError) {
          throw new Error(`Database error: ${dbError.message}`)
        }
      }

      setMessage('Upload complete.')
      resetSelection()
      window.location.href = `/event/${eventId}/gallery`
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
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold">{eventName}</h1>

          <p className="mb-6 text-sm text-gray-600">
            Select photos, then tap upload.
          </p>

          <div className="space-y-4">
            <input
              ref={inputRef}
              type="file"
              name="photos"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full rounded-xl border bg-white p-4 text-sm"
            />

            <div className="min-h-6 text-sm text-gray-700">
              {selectedCount > 0 ? (
                <p>
                  Ready to upload: {selectedCount} photo
                  {selectedCount > 1 ? 's' : ''}
                </p>
              ) : null}
              <p className="break-words">{message}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className={`w-full rounded-xl px-4 py-3 text-sm font-medium sm:w-auto ${
                  uploading
                    ? 'cursor-not-allowed bg-gray-300 text-gray-600'
                    : 'bg-black text-white'
                }`}
              >
                {uploading ? 'Uploading...' : 'Upload Photos'}
              </button>

              <button
                type="button"
                onClick={resetSelection}
                disabled={uploading}
                className="w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-black sm:w-auto"
              >
                Clear Selection
              </button>

              <a
                href={`/event/${eventId}/gallery`}
                className="w-full rounded-xl border bg-white px-4 py-3 text-center text-sm font-medium text-black sm:w-auto"
              >
                View Gallery
              </a>
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center justify-center rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-bold">Share with QR Code</h2>

          <p className="mb-6 text-center text-sm text-gray-600">
            Guests can open this upload page by scanning the code.
          </p>

          <div className="rounded-2xl border bg-white p-4">
            <QRCodeSVG value={uploadUrl} size={220} />
          </div>

          <p className="mt-4 break-all text-center text-xs text-gray-500">
            {uploadUrl}
          </p>
        </section>
      </div>
    </main>
  )
}