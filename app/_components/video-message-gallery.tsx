'use client'

import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '@/app/_components/language-provider'
import { VideoMessageUpload } from '@/app/_components/video-message-upload'
import { shareMedia } from '@/lib/share-media'
import { recoverVideoAccess } from '@/lib/video-message-upload'

type GalleryVideo = {
  id: string
  canDelete: boolean
  createdAt: string
  playbackUrl: string | null
  extension: 'mp4' | 'webm' | 'mov' | null
}

export function VideoMessagePlayer({ video, refresh }: { video: GalleryVideo; refresh: () => void }) {
  const { t } = useLanguage()
  const [deleting, setDeleting] = useState(false)
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const signedUrl = video.playbackUrl || ''
  const downloadName = `eventdrop-video-${video.id}.${video.extension || 'mp4'}`

  const deleteVideo = async () => {
    if (deleting || !video.canDelete) return
    if (!window.confirm(t.gallery.deleteConfirm)) return
    setDeleting(true)
    setStatus('')
    try {
      const response = await fetch(`/api/videos/${encodeURIComponent(video.id)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      const payload = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok || payload.error) throw new Error(payload.error || t.gallery.deleteError)
      setStatus(t.gallery.deleteSuccess)
      refresh()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.gallery.deleteError)
    } finally {
      setDeleting(false)
    }
  }

  const downloadVideo = () => {
    if (!signedUrl) return
    const anchor = document.createElement('a')
    anchor.href = signedUrl
    anchor.download = downloadName
    anchor.rel = 'noopener'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setStatus(`1 ${t.gallery.downloaded}`)
  }

  const shareVideo = async () => {
    if (!signedUrl) return
    try {
      const result = await shareMedia({
        fileName: downloadName,
        fileUrl: signedUrl,
        shareUrl: signedUrl,
        title: t.gallery.videoMessagesTab,
      })
      setStatus(result === 'copied' ? t.gallery.shareCopied : t.gallery.shareSuccess)
    } catch {
      try {
        await navigator.clipboard.writeText(signedUrl)
        setStatus(t.gallery.shareCopied)
      } catch {
        setStatus(t.gallery.shareError)
      }
    }
  }

  return (
    <article className="mx-auto w-[76vw] max-w-[280px] rounded-2xl border border-neutral-200 bg-neutral-50 p-2.5 shadow-[0_10px_28px_rgba(20,20,20,0.08)] sm:mx-0 sm:w-[300px] sm:max-w-[300px]">
      {failed || !video.playbackUrl ? (
        <div role="status" className="p-4 text-sm text-[#6B7280]">
          <p>{t.gallery.videoPlaybackError}</p>
          <button type="button" onClick={refresh} className="mt-3 rounded-full border border-[#C8D3E5] px-4 py-2 font-semibold text-[#0F3D66]">{t.gallery.videoRefresh}</button>
        </div>
      ) : (
        <>
          <div className="relative">
          <video src={video.playbackUrl} controls playsInline preload="metadata"
            aria-label={t.gallery.videoMessagesTab} className="mx-auto max-h-[420px] w-full rounded-xl bg-black object-contain sm:max-h-[460px]"
            style={dimensions ? { aspectRatio: `${dimensions.width} / ${dimensions.height}` } : undefined}
            onLoadedMetadata={(event) => {
              const { videoWidth, videoHeight } = event.currentTarget
              if (videoWidth <= 0 || videoHeight <= 0) { setFailed(true); return }
              setDimensions({ width: videoWidth, height: videoHeight })
              setLoading(false)
            }} onError={() => setFailed(true)} />
            {video.canDelete ? (
              <button
                type="button"
                onClick={deleteVideo}
                disabled={deleting}
                aria-label={t.gallery.delete}
                title={t.gallery.delete}
                className="absolute right-2 top-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(135deg,#7f1424_0%,#b91f32_55%,#e32636_100%)] text-white shadow-[0_6px_18px_rgba(127,20,36,0.26)] backdrop-blur disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
                  <path d="M4 7h16" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M6 7l1 12h10l1-12" />
                  <path d="M9 7V4h6v3" />
                </svg>
              </button>
            ) : null}
            <button
              type="button"
              onClick={shareVideo}
              aria-label={t.gallery.share}
              title={t.gallery.share}
              className="absolute bottom-2 left-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/75 bg-white/92 text-neutral-800 shadow-[0_4px_14px_rgba(0,0,0,0.16)] backdrop-blur"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[2.2]">
                <path d="M12 5v10" />
                <path d="m8 9 4-4 4 4" />
                <path d="M5 19h14" />
              </svg>
            </button>
            <button
              type="button"
              onClick={downloadVideo}
              aria-label={t.gallery.download}
              title={t.gallery.download}
              className="absolute bottom-2 right-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(135deg,#7f1424_0%,#b91f32_55%,#e32636_100%)] text-white shadow-[0_6px_18px_rgba(127,20,36,0.26)] backdrop-blur"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[2.2]">
                <path d="M12 4v10" />
                <path d="m8 10 4 4 4-4" />
                <path d="M5 19h14" />
              </svg>
            </button>
          </div>
          {loading ? <p role="status" className="mt-2 text-sm text-[#6B7280]">{t.gallery.videoLoading}</p> : null}
          {status ? <p role="status" className="mt-2 text-xs font-semibold text-[#6B7280]">{status}</p> : null}
        </>
      )}
    </article>
  )
}

export function VideoMessageGallery({ identifier }: { identifier: string }) {
  const { t } = useLanguage()
  const [page, setPage] = useState(0)
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState<{ videos: GalleryVideo[]; hasMore: boolean } | null>(null)
  const [error, setError] = useState(false)
  const refresh = useCallback(() => {
    setResult(null)
    setError(false)
    setPage(0)
    setRevision(value => value + 1)
  }, [])
  const changePage = (next: number) => { setResult(null); setError(false); setPage(next) }
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const request = () => fetch(`/api/videos/list?identifier=${encodeURIComponent(identifier)}&offset=${page * 24}`, {
          credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
        })
        let response = await request()

        if (
          (response.status === 401 || response.status === 403) &&
          await recoverVideoAccess(identifier)
        ) {
          response = await request()
        }

        const data = await response.json()
        if (!response.ok || !data?.ok || !Array.isArray(data.videos)) throw new Error('Gallery unavailable')
        if (!controller.signal.aborted) setResult(data)
      } catch {
        if (!controller.signal.aborted) setError(true)
      }
    }
    void load()
    return () => controller.abort()
  }, [identifier, page, revision])

  return (
    <section className="space-y-3 py-3 sm:py-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-neutral-950">{t.gallery.videoMessagesTab}</h2>
        <button type="button" onClick={refresh} className="rounded-full border border-[#C8D3E5] bg-white px-3 py-2 text-xs font-semibold text-[#0F3D66]">{t.gallery.videoRefresh}</button>
      </div>
      <VideoMessageUpload identifier={identifier} onSuccess={refresh} />
      {error ? <p role="alert" className="rounded-xl bg-white p-4 text-sm text-[#B91F32]">{t.gallery.videoGalleryError}</p>
        : !result ? <p role="status" className="p-4 text-sm text-[#6B7280]">{t.gallery.videoLoading}</p>
        : result.videos.length === 0 ? <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-[#6B7280]">{t.gallery.videoEmpty}</p>
        : <div className="flex flex-wrap items-start justify-center gap-3 sm:justify-start">
          {result.videos.map(video => <VideoMessagePlayer key={`${video.id}:${revision}:${video.playbackUrl}`} video={video} refresh={refresh} />)}
        </div>}
      <div className="flex justify-between gap-3 text-sm font-semibold text-[#0F3D66]">
        {page > 0 ? <button type="button" onClick={() => changePage(page - 1)}>{t.gallery.videoPrevious}</button> : <span />}
        {result?.hasMore ? <button type="button" onClick={() => changePage(page + 1)}>{t.gallery.videoNext}</button> : null}
      </div>
    </section>
  )
}
