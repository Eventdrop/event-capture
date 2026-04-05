'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { brand } from '@/lib/brand'
import {
  getEventGalleryRoute,
  getEventRoute,
  normalizeEventRecord,
  type NormalizedEvent,
} from '@/lib/events'

const productPoints = [
  'Guests join with one QR code scan',
  'Photos and videos land in one shared event album',
  'Everything stays easy to download and share',
  'Media is designed to expire after 48 hours',
]

export default function Home() {
  const [latestEvent, setLatestEvent] = useState<NormalizedEvent | null>(null)
  const [statusMessage, setStatusMessage] = useState(
    'Looking for the latest shared album...'
  )

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
          throw new Error(payload.error || 'Could not load the latest album.')
        }

        const normalized = normalizeEventRecord(payload.event as Record<string, unknown>)
        setLatestEvent(normalized)
        setStatusMessage(
          normalized
            ? 'Latest album is live and ready for guest uploads.'
            : 'No album has been created yet.'
        )
      } catch (error) {
        console.error('Failed to load latest event', error)
        setStatusMessage(
          error instanceof Error
            ? error.message
            : 'Could not load the latest album.'
        )
      }
    }

    void loadLatestEvent()
  }, [])

  const latestEventIdentifier = latestEvent?.slug || latestEvent?.id || ''

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader currentLabel="Shared Album" />

      <main className="flex-1 overflow-hidden bg-[radial-gradient(circle_at_top,_#f7efe3,_#f6f4ee_40%,_#efe8dc_100%)] text-stone-900">
        <section className="mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center gap-16 px-6 py-20 md:px-10 lg:flex-row lg:items-center lg:gap-12">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex rounded-full border border-stone-300/80 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-700 backdrop-blur">
              QR-based event media capture
            </p>

            <h1 className="max-w-3xl font-serif text-5xl leading-tight tracking-tight text-stone-950 sm:text-6xl">
              The latest shared album is ready for guest uploads.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
              {brand.name} keeps event sharing simple: open the live album, upload
              photos or videos, and let everyone browse the shared gallery from the
              same place.
            </p>

            <div className="mt-8 rounded-[1.5rem] border border-stone-200 bg-white/80 p-6 shadow-[0_12px_36px_rgba(64,45,22,0.08)]">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                Live album
              </p>

              {latestEvent ? (
                <>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
                    {latestEvent.albumName}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Event: {latestEvent.name}
                  </p>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={getEventRoute(latestEventIdentifier)}
                      className="inline-flex items-center justify-center rounded-full bg-amber-300 px-6 py-4 text-base font-semibold text-stone-950 transition hover:bg-amber-200"
                    >
                      Upload Photos or Videos
                    </Link>

                    <Link
                      href={getEventGalleryRoute(latestEventIdentifier)}
                      className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-4 text-base font-semibold text-stone-900 transition hover:bg-stone-50"
                    >
                      Open Gallery
                    </Link>
                  </div>
                </>
              ) : (
                <div className="mt-3 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm leading-7 text-stone-600">
                  No public album is live yet. Once the admin creates one, the
                  upload button will appear here.
                </div>
              )}

              <p className="mt-5 text-sm text-stone-500">{statusMessage}</p>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-stone-200 bg-white/70 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                Contact
              </p>
              <p className="mt-3 text-sm leading-7 text-stone-700">
                {brand.email} · {brand.phone}
              </p>
              <p className="mt-1 text-sm leading-7 text-stone-700">
                {brand.location}
              </p>
            </div>
          </div>

          <div className="w-full max-w-xl rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_20px_60px_rgba(64,45,22,0.12)] backdrop-blur">
            <div className="rounded-[1.5rem] bg-stone-950 p-6 text-stone-50">
              <p className="text-sm uppercase tracking-[0.18em] text-stone-300">
                How it works
              </p>

              <div className="mt-6 space-y-4">
                {productPoints.map((point, index) => (
                  <div
                    key={point}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-300 text-sm font-bold text-stone-900">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-stone-200">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Best for
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-700">
                  Weddings, birthdays, company events, meetups, pop-up experiences,
                  and one-day community gatherings.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Upload flow
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-700">
                  Guests start from the homepage, open the latest album, and upload
                  directly from the public entry point.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
