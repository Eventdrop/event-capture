'use client'

import { useState } from 'react'
import { EventAccessForm } from '@/app/_components/event-access-form'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { brand } from '@/lib/brand'
import { getPublicAppUrl } from '@/lib/app-url'
import { placeholderVisuals } from '@/lib/event-visuals'
import { useLanguage } from '@/app/_components/language-provider'

export default function Home() {
  const { t } = useLanguage()
  const websiteLabel = brand.website.replace(/^https?:\/\//, '')
  const [shareMessage, setShareMessage] = useState('')

  const handleShare = async () => {
    const shareUrl = getPublicAppUrl()
    const shareData = {
      title: brand.name,
      text: t.home.title,
      url: shareUrl,
    }

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData)
        setShareMessage(t.home.shareReady)
      } else {
        await navigator.clipboard.writeText(shareUrl)
        setShareMessage(t.home.shareCopied)
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setShareMessage(t.home.shareCopied)
      } catch {
        setShareMessage(t.home.shareCopied)
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader currentLabel={t.home.entryLabel} />

      <main
        className="flex-1 overflow-hidden bg-[linear-gradient(180deg,_#faf6ef_0%,_#f2ecdf_46%,_#edf4fb_100%)] text-[#0F2135]"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(250,246,239,0.8) 0%, rgba(242,236,223,0.86) 46%, rgba(237,244,251,0.92) 100%), url(${placeholderVisuals.homeBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10 md:px-10 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative overflow-hidden rounded-[2.4rem] border border-[#D4DFEE] bg-[#0F3D66] p-7 text-white shadow-[0_24px_70px_rgba(15,61,102,0.18)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(242,201,76,0.32),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(217,65,65,0.22),_transparent_24%)]" />
              <div className="relative">
                <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#DDEAF7]">
                  {t.home.badge}
                </p>

                <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-6xl">
                  {t.home.title}
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-8 text-[#DDEAF7] sm:text-lg">
                  {t.home.intro}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center justify-center rounded-full bg-[#F58220] px-6 py-4 text-base font-semibold text-white shadow-[0_14px_28px_rgba(245,130,32,0.25)] hover:bg-[#DB6E12]"
                  >
                    {t.home.shareSite}
                  </button>

                  <a
                    href={`mailto:${brand.email}`}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/8 px-6 py-4 text-base font-semibold text-white hover:bg-white/14"
                  >
                    {t.home.contactLabel}
                  </a>
                </div>

                <div className="mt-4 min-h-6 text-sm text-[#DDEAF7]">
                  {shareMessage}
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/8 p-5">
                    <p className="text-3xl font-semibold tracking-[-0.04em]">QR</p>
                    <p className="mt-2 text-sm leading-6 text-[#DDEAF7]">
                      {t.home.points[0]}
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/8 p-5">
                    <p className="text-3xl font-semibold tracking-[-0.04em]">Code</p>
                    <p className="mt-2 text-sm leading-6 text-[#DDEAF7]">
                      {t.home.points[1]}
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/8 p-5">
                    <p className="text-3xl font-semibold tracking-[-0.04em]">48h</p>
                    <p className="mt-2 text-sm leading-6 text-[#DDEAF7]">
                      {t.home.points[3]}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="relative overflow-hidden rounded-[2.4rem] border border-[#D4DFEE] bg-white/88 p-6 shadow-[0_22px_60px_rgba(15,61,102,0.10)] backdrop-blur">
                <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,_rgba(245,130,32,0.16),_rgba(15,61,102,0.04)_58%,_transparent)]" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                    {t.home.entryLabel}
                  </p>

                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#0B2742]">
                    {t.home.formTitle}
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-7 text-[#33516F]">
                    {t.home.formIntro}
                  </p>

                  <div className="mt-6">
                    <EventAccessForm />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[2rem] border border-[#D4DFEE] bg-white/82 p-5 shadow-[0_16px_46px_rgba(15,61,102,0.08)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                    {t.home.flowTitle}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#33516F]">
                    {t.home.flowText}
                  </p>
                </div>

                <div className="rounded-[2rem] bg-[#F58220] p-5 text-white shadow-[0_16px_46px_rgba(245,130,32,0.18)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                    {t.home.bestFor}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white">
                    {t.home.bestForText}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[2.2rem] border border-[#D4DFEE] bg-white/78 p-5 shadow-[0_16px_46px_rgba(15,61,102,0.08)]">
                <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[1.7rem] bg-[#D94141] p-5 text-white">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/75">
                      Photobooth Holland
                    </p>
                    <div className="mt-6 space-y-3">
                      <div className="h-2 w-20 rounded-full bg-white/60" />
                      <div className="h-2 w-32 rounded-full bg-white/40" />
                      <div className="h-2 w-24 rounded-full bg-[#F2C94C]" />
                    </div>
                    <div className="mt-8 flex gap-3">
                      <span className="h-10 w-10 rounded-full border border-white/35 bg-white/10" />
                      <span className="h-10 w-10 rounded-full border border-white/35 bg-white/10" />
                      <span className="h-10 w-10 rounded-full border border-white/35 bg-white/10" />
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-[1.5rem] bg-[#EDF4FB] p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-[#6A84A3]">
                            {t.home.howItWorks}
                          </p>
                          <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#0B2742]">
                            {t.home.points[2]}
                          </p>
                        </div>
                        <div className="rounded-full bg-[#0F3D66] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                          Share
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] bg-[#0F3D66] p-5 text-white">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#BFD4EA]">
                        {t.home.contactLabel}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#DDEAF7]">
                        {brand.email}
                      </p>
                      <p className="text-sm leading-7 text-[#DDEAF7]">
                        {brand.phone}
                      </p>
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block text-sm leading-7 text-white underline decoration-white/30 underline-offset-4"
                      >
                        {websiteLabel}
                      </a>
                      <p className="text-sm leading-7 text-[#DDEAF7]">
                        {brand.location}
                      </p>
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
