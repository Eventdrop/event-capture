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
  inferMediaKind,
  isExpired,
  getUploadShareKey,
  getUploadShortFileName,
  type UploadRecord,
} from '@/lib/eventdrop'
import { getEventBackground, getEventCover } from '@/lib/event-visuals'
import { formatEventDisplayName, normalizeEventRecord, type NormalizedEvent } from '@/lib/events'
import { supabase } from '@/lib/supabase'

export default function Page() {
  const { t, locale } = useLanguage()
  const params = useParams()
  const eventIdentifier = params.id as string

  const [items, setItems] = useState<UploadRecord[]>([])
  const [currentEvent, setCurrentEvent] = useState<NormalizedEvent | null>(null)
  const [eventName, setEventName] = useState('Shared Event Gallery')
  const [selected, setSelected] = useState<string[]>([])
  const [statusMessage, setStatusMessage] = useState(t.gallery.loading)
  const [deletingId, setDeletingId] = useState<string | null>(null)
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

      const activeUploads = ((uploads || []) as UploadRecord[]).filter(
        (upload) => !isExpired(upload.expires_at)
      )

      setItems(activeUploads)
      setEventName(
        normalizedEvent
          ? formatEventDisplayName(normalizedEvent)
          : 'Shared Event Gallery'
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
        error instanceof Error ? error.message : t.gallery.loadError
      )
    }
  }

  const downloadSelected = async () => {
    for (const item of selectedItems) {
      await handleDownload(
        item.file_url,
        getUploadShortFileName(item, {
          eventSlug: currentEvent?.slug || currentEvent?.name || eventIdentifier,
          sequence: shareSequenceById[item.id],
        })
      )
    }

    setStatusMessage(
      selectedItems.length > 0
        ? `${selectedItems.length} ${t.gallery.downloaded}`
        : t.gallery.chooseBeforeDownload
    )
  }

  const downloadAll = async () => {
    if (items.length === 0 || downloadingAll) return

    setDownloadingAll(true)
    setStatusMessage(t.gallery.downloadingAll)

    try {
      for (const item of items) {
        await handleDownload(
          item.file_url,
          getUploadShortFileName(item, {
            eventSlug: currentEvent?.slug || currentEvent?.name || eventIdentifier,
            sequence: shareSequenceById[item.id],
          })
        )
      }

      setStatusMessage(t.gallery.allDownloaded)
    } finally {
      setDownloadingAll(false)
    }
  }

  const handleDelete = async (item: UploadRecord) => {
    const confirmed = window.confirm(t.gallery.deleteConfirm)

    if (!confirmed) return

    setDeletingId(item.id)

    try {
      const response = await fetch(`/api/uploads/${item.id}`, {
        method: 'DELETE',
      })

      const payload = (await response.json()) as { ok?: boolean; error?: string }

      if (!response.ok) {
        throw new Error(payload.error || t.gallery.deleteError)
      }

      setItems((prev) => prev.filter((current) => current.id !== item.id))
      setSelected((prev) => prev.filter((id) => id !== item.id))
      setStatusMessage(t.gallery.deleteSuccess)
    } catch (error) {
      console.error('Delete failed', error)
      setStatusMessage(
        error instanceof Error ? error.message : t.gallery.deleteError
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleShare = async (item: UploadRecord) => {
    const shareUrl = getPublicMediaUrl(
      getUploadShareKey(item, {
        eventSlug: currentEvent?.slug || currentEvent?.name || eventIdentifier,
        sequence: shareSequenceById[item.id],
      })
    )
    const shareData = {
      title: eventName,
      text: getUploadShortFileName(item, {
        eventSlug: currentEvent?.slug || currentEvent?.name || eventIdentifier,
        sequence: shareSequenceById[item.id],
      }),
      url: shareUrl,
    }

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData)
        setStatusMessage(t.gallery.shareSuccess)
      } else {
        await navigator.clipboard.writeText(shareUrl)
        setStatusMessage(t.gallery.shareCopied)
      }
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

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_#faf6ef_0%,_#f0ebe2_55%,_#edf4fb_100%)] text-stone-900">
      <SiteHeader currentLabel={t.gallery.badge} />

      <main
        className="flex-1 bg-cover bg-center p-6"
        style={{ backgroundImage: `linear-gradient(rgba(15,33,53,0.4), rgba(15,33,53,0.48)), url(${getEventBackground(currentEvent)})` }}
      >
        <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/20 bg-[rgba(255,250,242,0.9)] p-6 shadow-[0_18px_50px_rgba(15,33,53,0.18)] backdrop-blur sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6A84A3]">
              {t.gallery.badge}
            </p>

            <div
              className="mt-4 h-28 w-full max-w-sm rounded-[1.6rem] bg-cover bg-center"
              style={{ backgroundImage: `url(${getEventCover(currentEvent)})` }}
            />

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-950">
              {eventName}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#33516F]">
              {t.gallery.intro}
            </p>

            <p className="mt-3 text-sm text-[#597594]">{statusMessage}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {adminAuthenticated ? (
              <>
                <button
                  onClick={downloadAll}
                  disabled={items.length === 0 || downloadingAll}
                  className={`rounded-full px-5 py-3 text-sm font-semibold ${
                    items.length === 0 || downloadingAll
                      ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                      : 'bg-[#0F3D66] text-white hover:bg-[#0B2F4F]'
                  }`}
                >
                  {downloadingAll ? t.gallery.downloadingAll : t.gallery.downloadAll}
                </button>

                <button
                  onClick={downloadSelected}
                  disabled={selected.length === 0}
                  className={`rounded-full px-5 py-3 text-sm font-semibold ${
                    selected.length === 0
                      ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                      : 'bg-[#F58220] text-white hover:bg-[#DB6E12]'
                  }`}
                >
                  {t.gallery.downloadSelected} ({selected.length})
                </button>
              </>
            ) : null}

            <Link
              href={uploadPageUrl}
              className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-5 py-3 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
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
          <div className="grid grid-cols-2 gap-4 lg:gap-5">
            {items.map((item) => {
              const isSelected = selected.includes(item.id)
              const mediaKind = inferMediaKind(item)
              const downloadName = getUploadShortFileName(item, {
                eventSlug: currentEvent?.slug || currentEvent?.name || eventIdentifier,
                sequence: shareSequenceById[item.id],
              })
              const isDeleting = deletingId === item.id

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
                        className="h-56 w-full bg-stone-900 object-cover sm:h-64"
                      />
                    ) : (
                      <Image
                        src={item.file_url}
                        alt={downloadName}
                        width={1200}
                        height={1200}
                        unoptimized
                        className="h-56 w-full object-cover sm:h-64"
                      />
                    )}

                    {adminAuthenticated ? (
                      <button
                        onClick={() => toggleSelect(item.id)}
                        className={`absolute left-3 top-3 rounded-full px-3 py-2 text-xs font-semibold ${
                          isSelected
                            ? 'bg-[#0F3D66] text-stone-50'
                            : 'bg-white/90 text-stone-900'
                        }`}
                      >
                        {isSelected ? t.gallery.selected : t.gallery.select}
                      </button>
                    ) : null}

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {adminAuthenticated && isSelected ? (
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={isDeleting}
                            className={`rounded-full px-3 py-2 text-xs font-semibold ${
                              isDeleting
                                ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                                : 'bg-[#B52E2E] text-white'
                            }`}
                          >
                            {isDeleting ? t.gallery.deleting : t.gallery.delete}
                          </button>
                        ) : null}

                        <button
                          onClick={() => handleShare(item)}
                          className="rounded-full bg-white/92 px-3 py-2 text-xs font-semibold text-stone-900"
                        >
                          {t.gallery.share}
                        </button>
                      </div>

                      {adminAuthenticated ? (
                        <button
                          onClick={() => handleDownload(item.file_url, downloadName)}
                          className="rounded-full bg-[#F58220] px-3 py-2 text-xs font-semibold text-stone-50"
                        >
                          {t.gallery.download}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2 p-4">
                    <p className="truncate text-sm font-medium text-stone-900">
                      {downloadName}
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      {mediaKind === 'video' ? t.gallery.video : t.gallery.photo}
                    </p>
                    <p className="text-xs text-stone-400">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString(locale)
                        : t.gallery.uploadTimeUnavailable}
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
