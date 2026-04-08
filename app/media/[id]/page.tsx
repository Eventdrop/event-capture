import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MediaDownloadButton } from '@/app/_components/media-download-button'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { getPublicPath } from '@/lib/app-url'
import {
  getUploadFileExtension,
  inferMediaKind,
  isExpired,
  parseOrdinalShareKey,
  slugifyShareValue,
  getUploadShareKey,
  type UploadRecord,
} from '@/lib/eventdrop'
import { getEventGalleryRoute, normalizeEventRecord } from '@/lib/events'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export default async function MediaPage({
  params,
}: PageProps<'/media/[id]'>) {
  const { id } = await params
  const supabase = createAdminSupabaseClient()
  let upload: UploadRecord | null = null
  let parentEvent = null as ReturnType<typeof normalizeEventRecord>

  const directLookup = await supabase
    .from('uploads')
    .select('*')
    .eq('id', id)
    .single()

  if (directLookup.data) {
    upload = directLookup.data as UploadRecord
  } else {
    const shareCodeLookup = await supabase
      .from('uploads')
      .select('*')
      .eq('share_code', id)
      .maybeSingle()

    if (shareCodeLookup.data) {
      upload = shareCodeLookup.data as UploadRecord
    }

    const ordinalKey = parseOrdinalShareKey(id)

    if (!upload && ordinalKey) {
      const exactEventLookup = await supabase
        .from('events')
        .select('*')
        .eq('slug', ordinalKey.eventSlug)
        .single()

      let event = normalizeEventRecord(exactEventLookup.data)

      if (!event) {
        const fallbackEventsLookup = await supabase
          .from('events')
          .select('*')
          .limit(1000)

        event =
          (fallbackEventsLookup.data || [])
            .map((item) => normalizeEventRecord(item))
            .filter(Boolean)
            .find((item) => {
              if (!item) return false
              const candidate = slugifyShareValue(item.slug || item.name || item.albumName)
              return candidate === ordinalKey.eventSlug
            }) || null
      }

      if (event?.id) {
        parentEvent = event
        const uploadsLookup = await supabase
          .from('uploads')
          .select('*')
          .eq('event_id', event.id)
          .order('created_at', { ascending: true })

        const activeUploads = ((uploadsLookup.data || []) as UploadRecord[]).filter(
          (item) => !isExpired(item.expires_at)
        )

        upload = activeUploads[ordinalKey.sequence - 1] || null
      }
    }

    if (!upload) {
      const slugLookup = await supabase
        .from('uploads')
        .select('*')
        .or(`file_name.ilike.${id}.%,storage_path.ilike.%/${id}.%`)
        .limit(1)

      if (slugLookup.data?.[0]) {
        upload = slugLookup.data[0] as UploadRecord
      }
    }
  }

  if (!upload) {
    notFound()
  }

  if (!parentEvent && upload.event_id) {
    const parentLookup = await supabase
      .from('events')
      .select('*')
      .eq('id', upload.event_id)
      .single()

    parentEvent = normalizeEventRecord(parentLookup.data)
  }

  if (isExpired(upload.expires_at)) {
    notFound()
  }

  const mediaKind = inferMediaKind(upload)
  const fallbackShareKey = getUploadShareKey(upload)
  const shareKey = parseOrdinalShareKey(id) ? id : fallbackShareKey
  const fileExtension = getUploadFileExtension(upload)
  const shortFileName = `${shareKey}.${fileExtension}`
  const backToAlbumUrl = parentEvent
    ? getPublicPath(getEventGalleryRoute(parentEvent.slug || parentEvent.id))
    : getPublicPath('/')
  const downloadAllowed = parentEvent?.allowGuestDownload !== false

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_#faf6ef_0%,_#edf4fb_100%)] text-stone-900">
      <SiteHeader currentLabel="Shared Media" />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <div className="rounded-[2rem] border border-[#D4DFEE] bg-white/84 p-6 shadow-[0_18px_50px_rgba(61,44,22,0.12)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6A84A3]">
              Shared Media
            </p>
            <h1 className="mt-3 break-all text-3xl font-semibold tracking-[-0.03em] text-stone-950">
              {shortFileName}
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#6A84A3]">
              /media/{shareKey}
            </p>
            <p className="mt-3 text-sm leading-7 text-[#33516F]">
              Open, download, or share this single guest upload directly.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {downloadAllowed ? (
                <MediaDownloadButton fileName={shortFileName} fileUrl={upload.file_url} />
              ) : null}

              <Link
                href={backToAlbumUrl}
                className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-5 py-3 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
              >
                Back to album
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[#D4DFEE] bg-white shadow-[0_16px_40px_rgba(61,44,22,0.08)]">
            {mediaKind === 'video' ? (
              <video
                src={upload.file_url}
                controls
                playsInline
                className="max-h-[80vh] w-full bg-stone-950 object-contain"
              />
            ) : (
              <Image
                src={upload.file_url}
                alt={shortFileName}
                width={1600}
                height={1600}
                unoptimized
                className="max-h-[80vh] w-full object-contain"
              />
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
