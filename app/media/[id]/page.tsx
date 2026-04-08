import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MediaDownloadButton } from '@/app/_components/media-download-button'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { getPublicPath } from '@/lib/app-url'
import {
  getDownloadFileName,
  inferMediaKind,
  isExpired,
  parseOrdinalShareKey,
  getUploadShareKey,
  type UploadRecord,
} from '@/lib/eventdrop'
import { normalizeEventRecord } from '@/lib/events'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export default async function MediaPage({
  params,
}: PageProps<'/media/[id]'>) {
  const { id } = await params
  const supabase = createAdminSupabaseClient()
  let upload: UploadRecord | null = null

  const directLookup = await supabase
    .from('uploads')
    .select('*')
    .eq('id', id)
    .single()

  if (directLookup.data) {
    upload = directLookup.data as UploadRecord
  } else {
    const ordinalKey = parseOrdinalShareKey(id)

    if (ordinalKey) {
      const eventLookup = await supabase
        .from('events')
        .select('*')
        .eq('slug', ordinalKey.eventSlug)
        .single()

      const event = normalizeEventRecord(eventLookup.data)

      if (event?.id) {
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

  if (isExpired(upload.expires_at)) {
    notFound()
  }

  const mediaKind = inferMediaKind(upload)
  const fileName = getDownloadFileName(upload)

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
              {fileName}
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#6A84A3]">
              /media/{parseOrdinalShareKey(id) ? id : getUploadShareKey(upload)}
            </p>
            <p className="mt-3 text-sm leading-7 text-[#33516F]">
              Open, download, or share this single guest upload directly.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <MediaDownloadButton fileName={fileName} fileUrl={upload.file_url} />

              <Link
                href={getPublicPath('/')}
                className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-5 py-3 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
              >
                Back to EventDrop
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
                alt={fileName}
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
