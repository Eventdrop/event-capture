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
import { formatEventDisplayName, normalizeEventRecord, type NormalizedEvent } from '@/lib/events'
import { shareMedia } from '@/lib/share-media'
import { supabase } from '@/lib/supabase'

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
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)

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
      setEventName(
        normalizedEvent
          ? formatEventDisplayName(normalizedEvent)
          : 'Gedeelde evenementgalerij'
      )
      setStatusMessage(
        activeUploads.length === 0
          ? t.gallery.noUploads
          : `${activeUploads.length} ${t.gallery.showing}`
      )
    }

    void load()
  }, [eventIdentifier, t.gallery.loadError, t.gallery.noUploads, t.gallery.notFound, t.gallery.showing])

  useEffect(() => {
    const loadAdminSession = async () => {
      try {
        const response = await fetch('/api/admin/session', {
          cache: 'no-store',
        })
        const payload = (await response.json()) as { authenticated?: boolean }
        setAdminAuthenticated(Boolean(payload.authenticated))
      } catch (error) {
        console.error('Failed to check admin session', error)
        setAdminAuthenticated(false)
      }
    }

    void loadAdminSession()
  }, [])

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
        }

        if (!payload.coverImageUrl && !payload.backgroundImageUrl) return

        setCurrentEvent((prev) =>
          prev
            ? {
                ...prev,
                coverImageUrl: payload.coverImageUrl || prev.coverImageUrl,
                backgroundImageUrl:
                  payload.backgroundImageUrl || prev.backgroundImageUrl,
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
  const shareEnabled = currentEvent?.allowGuestShare !== false
  const downloadEnabled = currentEvent?.allowGuestDownload !== false
  const deleteEnabled = currentEvent?.allowGuestDelete === true

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id)
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
    anchor.click()

    window.URL.revokeObjectURL(blobUrl)
  }

  const getZipFileName = (selectedOnly: boolean) => {
    const baseName = (currentEvent?.albumName || currentEvent?.name || eventIdentifier)
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, ' ')

    return `${baseName || 'eventdrop-album'}${selectedOnly ? '-selectie' : ''}.zip`
  }

  const downloadZip = async (options: { all?: boolean }) => {
    const zipItems = options.all ? items : selectedItems

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

      saveBlob(await response.blob(), getZipFileName(options.all !== true))

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
      await downloadZip({ all: true })
    } finally {
      setDownloadingAll(false)
    }
  }

  const deleteSelected = async () => {
    if (selectedItems.length === 0 || deletingSelected) return

    const confirmed = window.confirm(t.gallery.deleteSelectedConfirm)

    if (!confirmed) return

    setDeletingSelected(true)
    setStatusMessage(t.gallery.deleting)

    try {
      for (const item of selectedItems) {

        const response = await fetch(`/api/uploads/${item.id}`, {
          method: 'DELETE',
        })

        const payload = (await response.json()) as { ok?: boolean; error?: string }

        if (!response.ok) {
          throw new Error(payload.error || t.gallery.deleteError)
        }
      }

      const deletedIds = new Set(selectedItems.map((item) => item.id))
      setItems((prev) => prev.filter((item) => !deletedIds.has(item.id)))
      setSelected((prev) => prev.filter((id) => !deletedIds.has(id)))
      setStatusMessage(t.gallery.deleteSelectedSuccess)
    } catch (error) {
      console.error('Bulk delete failed', error)
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

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_#faf6ef_0%,_#f0ebe2_55%,_#edf4fb_100%)] text-stone-900">
      <SiteHeader currentLabel={t.gallery.badge} />

      <main
        className="flex-1 bg-cover bg-center p-6"
        style={eventBackgroundStyle}
      >
        <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-col gap-4 rounded-[1.5rem] border border-white/20 bg-[rgba(255,250,242,0.92)] p-4 shadow-[0_18px_50px_rgba(15,33,53,0.18)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div
              className="mt-3 h-36 w-full overflow-hidden rounded-[1.2rem] bg-[#EDF4FB] bg-cover bg-center sm:h-40"
              style={eventCoverStyle}
            />
            <h1 className="mt-3 text-sm font-semibold leading-tight text-stone-950 sm:text-sm">
              {eventName}
            </h1>
            <p className="mt-1 text-sm text-[#597594]">{statusMessage}</p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-2 xl:flex xl:flex-row">
            {downloadEnabled ? (
              <button
                onClick={downloadSelected}
                disabled={selected.length === 0 || downloadingSelected}
                className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-center text-sm font-semibold ${
                  selected.length === 0 || downloadingSelected
                    ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                    : 'bg-[#F58220] text-white hover:bg-[#DB6E12]'
                }`}
              >
                {downloadingSelected
                  ? t.gallery.downloadingAll
                  : `${t.gallery.downloadSelected} (${selected.length}/${selectedLimit})`}
              </button>
            ) : null}

            {deleteEnabled ? (
              <button
                onClick={deleteSelected}
                disabled={selected.length === 0 || deletingSelected}
                className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-center text-sm font-semibold ${
                  selected.length === 0 || deletingSelected
                    ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                    : 'bg-[#B52E2E] text-white hover:bg-[#982525]'
                }`}
              >
                {deletingSelected
                  ? t.gallery.deleting
                  : `${t.gallery.deleteSelected} (${selected.length})`}
              </button>
            ) : null}
            {adminAuthenticated ? (
              <>
                <button
                  onClick={downloadAll}
                  disabled={items.length === 0 || downloadingAll}
                  className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-center text-sm font-semibold ${
                    items.length === 0 || downloadingAll
                      ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                      : 'bg-[#0F3D66] text-white hover:bg-[#0B2F4F]'
                  }`}
                >
                  {downloadingAll ? t.gallery.downloadingAll : t.gallery.downloadAll}
                </button>

              </>
            ) : null}

            <Link
              href={uploadPageUrl}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-5 py-3 text-center text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
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
                      className="aspect-square w-full object-cover"
                    />

                    {downloadEnabled || deleteEnabled ? (
                      <button
                        onClick={() => toggleSelect(item.id)}
                        aria-label={isSelected ? t.gallery.selected : t.gallery.select}
                        title={isSelected ? t.gallery.selected : t.gallery.select}
                        className={`absolute left-3 top-3 ${actionButtonClass} ${
                          isSelected ? 'border-[#0F3D66] bg-[#0F3D66] text-white ring-2 ring-white/90' : ''
                        }`}
                      >
                        {isSelected ? (
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                            <path d="M5 12.5 9.5 17 19 7.5" />
                          </svg>
                        ) : (
                          <span className="h-3 w-3 rounded-full border border-[#0F3D66]/50" />
                        )}
                      </button>
                    ) : null}

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {shareEnabled ? (
                          <button
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
