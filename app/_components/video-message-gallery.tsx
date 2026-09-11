'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/app/_components/language-provider'
import { VideoMessageUpload } from '@/app/_components/video-message-upload'

type GalleryVideo = { id: string; createdAt: string; playbackUrl: string | null }

export function VideoMessagePlayer({ video, refresh }: { video: GalleryVideo; refresh: () => void }) {
  const { t } = useLanguage()
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const portrait = dimensions ? dimensions.height > dimensions.width : false
  return (
    <article data-orientation={portrait ? 'portrait' : 'landscape'} className={`w-full max-w-full rounded-xl border border-[#E3E7EC] bg-white p-3 shadow-sm ${portrait ? 'sm:w-72' : 'sm:w-[32rem]'}`}>
      {failed || !video.playbackUrl ? (
        <div role="status" className="p-4 text-sm text-[#6B7280]">
          <p>{t.gallery.videoPlaybackError}</p>
          <button type="button" onClick={refresh} className="mt-3 rounded-full border border-[#C8D3E5] px-4 py-2 font-semibold text-[#0F3D66]">{t.gallery.videoRefresh}</button>
        </div>
      ) : (
        <>
          <video src={video.playbackUrl} controls playsInline preload="metadata"
            aria-label={t.gallery.videoMessagesTab} className="h-auto w-full rounded-lg bg-black object-contain"
            style={dimensions ? { aspectRatio: `${dimensions.width} / ${dimensions.height}` } : undefined}
            onLoadedMetadata={(event) => {
              const { videoWidth, videoHeight } = event.currentTarget
              if (videoWidth <= 0 || videoHeight <= 0) { setFailed(true); return }
              setDimensions({ width: videoWidth, height: videoHeight })
              setLoading(false)
            }} onError={() => setFailed(true)} />
          {loading ? <p role="status" className="mt-2 text-sm text-[#6B7280]">{t.gallery.videoLoading}</p> : null}
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
  const refresh = () => { setResult(null); setError(false); setRevision(value => value + 1) }
  const changePage = (next: number) => { setResult(null); setError(false); setPage(next) }
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch(`/api/videos/list?identifier=${encodeURIComponent(identifier)}&offset=${page * 24}`, {
          credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
        })
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
      <VideoMessageUpload identifier={identifier} />
      {error ? <p role="alert" className="rounded-xl bg-white p-4 text-sm text-[#B91F32]">{t.gallery.videoGalleryError}</p>
        : !result ? <p role="status" className="p-4 text-sm text-[#6B7280]">{t.gallery.videoLoading}</p>
        : result.videos.length === 0 ? <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-[#6B7280]">{t.gallery.videoEmpty}</p>
        : <div className="flex flex-wrap items-start gap-3">
          {result.videos.map(video => <VideoMessagePlayer key={`${video.id}:${revision}:${video.playbackUrl}`} video={video} refresh={refresh} />)}
        </div>}
      <div className="flex justify-between gap-3 text-sm font-semibold text-[#0F3D66]">
        {page > 0 ? <button type="button" onClick={() => changePage(page - 1)}>{t.gallery.videoPrevious}</button> : <span />}
        {result?.hasMore ? <button type="button" onClick={() => changePage(page + 1)}>{t.gallery.videoNext}</button> : null}
      </div>
    </section>
  )
}
