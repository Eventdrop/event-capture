'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import {
  getDownloadFileName,
  inferMediaKind,
  isExpired,
  type UploadRecord,
} from '@/lib/eventdrop'
import { normalizeEventRecord } from '@/lib/events'
import { supabase } from '@/lib/supabase'

export default function Page() {
  const params = useParams()
  const eventIdentifier = params.id as string

  const [items, setItems] = useState<UploadRecord[]>([])
  const [eventName, setEventName] = useState('Shared Event Gallery')
  const [selected, setSelected] = useState<string[]>([])
  const [statusMessage, setStatusMessage] = useState(
    'Loading this event gallery...'
  )

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
        setStatusMessage('This event gallery could not be found.')
        return
      }

      const { data: uploads, error: uploadsError } = await supabase
        .from('uploads')
        .select('*')
        .eq('event_id', normalizedEvent.id)
        .order('created_at', { ascending: false })

      if (uploadsError) {
        console.error('Failed to load uploads', uploadsError)
        setStatusMessage('The gallery could not be loaded right now.')
        return
      }

      const activeUploads = ((uploads || []) as UploadRecord[]).filter(
        (upload) => !isExpired(upload.expires_at)
      )

      setItems(activeUploads)
      setEventName(
        normalizedEvent
          ? `${normalizedEvent.name} · ${normalizedEvent.albumName}`
          : 'Shared Event Gallery'
      )
      setStatusMessage(
        activeUploads.length === 0
          ? 'No uploads are live in this gallery yet.'
          : `Showing ${activeUploads.length} upload${activeUploads.length > 1 ? 's' : ''}.`
      )
    }

    void load()
  }, [eventIdentifier])

  const selectedItems = useMemo(
    () => items.filter((item) => selected.includes(item.id)),
    [items, selected]
  )

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    )
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}.`)
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
        error instanceof Error ? error.message : 'Download failed unexpectedly.'
      )
    }
  }

  const downloadSelected = async () => {
    for (const item of selectedItems) {
      await handleDownload(item.file_url, getDownloadFileName(item))
    }

    setStatusMessage(
      selectedItems.length > 0
        ? `${selectedItems.length} file${selectedItems.length > 1 ? 's' : ''} downloaded.`
        : 'Choose at least one item before downloading.'
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_#f6f2ea_0%,_#f0ebe2_100%)] text-stone-900">
      <SiteHeader currentLabel="Shared Gallery" />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(61,44,22,0.12)] backdrop-blur sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Shared gallery
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
              {eventName}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">
              Browse guest uploads, select favourites, and download anything you
              want to keep before the 48-hour retention window ends.
            </p>

            <p className="mt-3 text-sm text-stone-500">{statusMessage}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={downloadSelected}
              disabled={selected.length === 0}
              className={`rounded-full px-5 py-3 text-sm font-semibold ${
                selected.length === 0
                  ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                  : 'bg-stone-950 text-stone-50 hover:bg-stone-800'
              }`}
            >
              Download Selected ({selected.length})
            </button>

            <Link
              href={`/event/${eventIdentifier}`}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-900 hover:bg-stone-50"
            >
              Back to Upload
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center text-stone-500 shadow-[0_16px_40px_rgba(61,44,22,0.08)]">
            No active uploads are visible yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const isSelected = selected.includes(item.id)
              const mediaKind = inferMediaKind(item)
              const downloadName = getDownloadFileName(item)

              return (
                <article
                  key={item.id}
                  className={`overflow-hidden rounded-[2rem] border bg-white shadow-[0_16px_40px_rgba(61,44,22,0.08)] ${
                    isSelected ? 'border-stone-900 ring-2 ring-stone-900/10' : 'border-stone-200'
                  }`}
                >
                  <div className="relative">
                    {mediaKind === 'video' ? (
                      <video
                        src={item.file_url}
                        controls
                        playsInline
                        className="h-80 w-full bg-stone-900 object-cover"
                      />
                    ) : (
                      <Image
                        src={item.file_url}
                        alt={downloadName}
                        width={1200}
                        height={1200}
                        unoptimized
                        className="h-80 w-full object-cover"
                      />
                    )}

                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={`absolute left-3 top-3 rounded-full px-3 py-2 text-xs font-semibold ${
                        isSelected
                          ? 'bg-stone-950 text-stone-50'
                          : 'bg-white/90 text-stone-900'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>

                    <button
                      onClick={() => handleDownload(item.file_url, downloadName)}
                      className="absolute bottom-3 right-3 rounded-full bg-stone-950/85 px-3 py-2 text-xs font-semibold text-stone-50"
                    >
                      Download
                    </button>
                  </div>

                  <div className="space-y-2 p-4">
                    <p className="truncate text-sm font-medium text-stone-900">
                      {downloadName}
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      {mediaKind === 'video' ? 'Video' : 'Photo'}
                    </p>
                    <p className="text-xs text-stone-400">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : 'Upload time unavailable'}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
