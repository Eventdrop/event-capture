'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { useLanguage } from '@/app/_components/language-provider'
import { brand } from '@/lib/brand'
import {
  getEventGalleryRoute,
  getEventRoute,
  normalizeEventRecord,
  type NormalizedEvent,
} from '@/lib/events'

export default function Home() {
  const { t } = useLanguage()
  const [latestEvent, setLatestEvent] = useState<NormalizedEvent | null>(null)
  const [statusMessage, setStatusMessage] = useState(t.home.loading)

  useEffect(() => {
    setStatusMessage(t.home.loading)
  }, [t.home.loading])

  useEffect(() => {
    const loadLatestEvent = async () => {
      try {
        const response = await fetch('/api/public-events/latest', {
          cache: 'no-store',
        })
        const payload = (await response.json()) as {
          ok?: boolean
          event?: unknown
          error?: string
        }

        if (!response.ok) {
          throw new Error(payload.error || t.home.noAlbum)
        }

        const normalized = normalizeEventRecord(payload.event as Record<string, unknown>)
        setLatestEvent(normalized)
        setStatusMessage(
          normalized ? t.home.latestAlbumReady : t.home.noAlbum
        )
      } catch (error) {
        console.error('Failed to load latest event', error)
        setStatusMessage(
          error instanceof Error ? error.message : t.home.noAlbum
        )
      }
    }

    void loadLatestEvent()
  }, [t.home.latestAlbumReady, t.home.noAlbum])

  const latestEventIdentifier = latestEvent?.slug || latestEvent?.id || ''

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader currentLabel={t.home.latestAlbumLabel} />

      <main className="dutch-grid flex-1 overflow-hidden bg-[linear-gradient(180deg,_#faf6ef_0%,_#f3ede2_48%,_#edf4fb_100%)] text-[#0F2135]">
        <section className="mx-auto grid min-h-full w-full max-w-6xl gap-14 px-6 py-20 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border border-[#C8D3E5] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#0F3D66]">
              {t.home.badge}
            </p>

            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-[-0.04em] text-[#0B2742] sm:text-6xl">
              {t.home.title}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#33516F]">
              {t.home.intro}
            </p>

            <div className="mt-8 rounded-[2rem] border border-[#D4DFEE] bg-white/82 p-6 shadow-[0_18px_54px_rgba(15,61,102,0.08)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-[#6A84A3]">
                {t.home.latestAlbumLabel}
              </p>

              {latestEvent ? (
                <>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0B2742]">
                    {latestEvent.albumName}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#33516F]">
                    {latestEvent.name}
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={getEventRoute(latestEventIdentifier)}
                      className="inline-flex items-center justify-center rounded-full bg-[#F58220] px-6 py-4 text-base font-semibold text-white shadow-[0_12px_24px_rgba(245,130,32,0.22)] transition hover:bg-[#DB6E12]"
                    >
                      {t.home.uploadCta}
                    </Link>

                    <Link
                      href={getEventGalleryRoute(latestEventIdentifier)}
                      className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-[#EDF4FB] px-6 py-4 text-base font-semibold text-[#0F3D66] transition hover:bg-white"
                    >
                      {t.home.galleryCta}
                    </Link>
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-[1.5rem] border border-dashed border-[#C8D3E5] bg-[#F8FBFE] p-5 text-sm leading-7 text-[#4E6985]">
                  {t.home.noAlbum}
                </div>
              )}

              <p className="mt-5 text-sm text-[#597594]">{statusMessage}</p>
            </div>

            <div className="mt-8 rounded-[2rem] border border-[#D4DFEE] bg-white/70 p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-[#6A84A3]">
                {t.home.contactLabel}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#33516F]">
                {brand.email} · {brand.phone}
              </p>
              <p className="mt-1 text-sm leading-7 text-[#33516F]">
                {brand.location}
              </p>
            </div>
          </div>

          <div className="rounded-[2.4rem] border border-[#D4DFEE] bg-white/78 p-6 shadow-[0_22px_60px_rgba(15,61,102,0.10)] backdrop-blur">
            <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[1.9rem] bg-[#0F3D66] p-6 text-white">
                <p className="text-sm uppercase tracking-[0.18em] text-[#C9DDF2]">
                  {t.home.howItWorks}
                </p>

                <div className="mt-6 space-y-4">
                  {t.home.points.map((point, index) => (
                    <div
                      key={point}
                      className="flex items-start gap-4 rounded-[1.4rem] border border-white/10 bg-white/6 p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2C94C] text-sm font-bold text-[#0F2135]">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-6 text-[#EEF6FF]">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.7rem] bg-[#F58220] p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/80">
                    {t.home.bestFor}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white">
                    {t.home.bestForText}
                  </p>
                </div>

                <div className="rounded-[1.7rem] border border-[#D4DFEE] bg-[#EDF4FB] p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#6A84A3]">
                    {t.home.flowTitle}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#33516F]">
                    {t.home.flowText}
                  </p>
                </div>

                <div className="rounded-[1.7rem] border border-[#D4DFEE] bg-white p-5">
                  <div className="grid grid-cols-[1.2fr_0.8fr] gap-3">
                    <div className="rounded-[1.2rem] bg-[#D94141] p-4 text-white">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/75">
                        Amsterdam
                      </p>
                      <div className="mt-4 flex gap-2">
                        <span className="h-8 w-8 rounded-full border border-white/40" />
                        <span className="h-8 w-8 rounded-full border border-white/40" />
                        <span className="h-8 w-8 rounded-full border border-white/40" />
                      </div>
                    </div>
                    <div className="rounded-[1.2rem] bg-[#F2C94C] p-4">
                      <div className="h-full rounded-[1rem] border border-black/10 bg-white/70" />
                    </div>
                    <div className="rounded-[1.2rem] bg-[#EDF4FB] p-4 text-[#0F3D66]">
                      <div className="h-2 w-16 rounded-full bg-[#0F3D66]" />
                      <div className="mt-3 h-2 w-24 rounded-full bg-[#F58220]" />
                      <div className="mt-3 h-2 w-12 rounded-full bg-[#D94141]" />
                    </div>
                    <div className="rounded-[1.2rem] bg-[#0F3D66] p-4">
                      <div className="h-full rounded-[1rem] border border-white/15 bg-white/8" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
