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
  const albumPackageSize = 100
  const shareEnabled = currentEvent?.allowGuestShare !== false
  const downloadEnabled = currentEvent?.allowGuestDownload !== false
  const albumDownloadEnabled = currentEvent?.allowAlbumDownload !== false
  const deleteEnabled = currentEvent?.allowGuestDelete === true
  const downloadInProgress = downloadingSelected || downloadingAll
  const totalAlbumPackages = Math.max(1, Math.ceil(items.length / albumPackageSize))
  const activeAlbumPackageIndex = Math.min(albumPackageIndex, totalAlbumPackages - 1)
  const albumPackageStart = activeAlbumPackageIndex * albumPackageSize
  const albumPackageEnd = Math.min(albumPackageStart + albumPackageSize, items.length)
  const albumPackageItems = items.slice(albumPackageStart, albumPackageEnd)
  const albumPackageButtonLabel =
    items.length <= albumPackageSize
      ? t.gallery.downloadAll
      : `${t.gallery.downloadAlbumPackage} ${activeAlbumPackageIndex + 1}/${totalAlbumPackages} (${albumPackageStart + 1}-${albumPackageEnd})`

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
            {downloadingAll ? t.gallery.downloadingAll : t.gallery.downloadingSelected}
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

        <div className="mb-4 flex flex-col gap-4 rounded-[1.5rem] border border-white/20 bg-[rgba(255,250,242,0.92)] p-4 shadow-[0_18px_50px_rgba(15,33,53,0.18)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div
              className="mt-3 h-36 w-full overflow-hidden rounded-[1.2rem] bg-[#EDF4FB] bg-cover bg-center sm:h-40"
              style={eventCoverStyle}
            />
            <h1 className="mt-3 text-sm font-semibold leading-tight text-stone-950 sm:text-sm">
              {eventName}
            </h1>
            <p className="mt-1 text-sm text-[#597594]">
              {downloadInProgress ? t.gallery.downloadPreparing : statusMessage}
            </p>
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
                  ? t.gallery.downloadingSelected
                  : `${t.gallery.downloadSelected} (${selected.length}/${selectedLimit})`}
              </button>
            ) : null}

            {downloadEnabled && albumDownloadEnabled ? (
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
                  {downloadingAll ? t.gallery.downloadingAll : albumPackageButtonLabel}
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

      <SiteFooter />
    </div>
  )
}
