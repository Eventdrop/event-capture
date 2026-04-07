'use client'

import Image from 'next/image'
import { EventAccessForm } from '@/app/_components/event-access-form'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { placeholderVisuals } from '@/lib/event-visuals'
import { useLanguage } from '@/app/_components/language-provider'

function PhotoTile({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-[1.8rem] ${className || ''}`}>
      <Image src={src} alt={alt} fill unoptimized className="object-cover" />
    </div>
  )
}

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col bg-[#fbf7f0]">
      <SiteHeader />

      <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
        <div className="mx-auto grid w-full max-w-7xl gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <section className="overflow-hidden rounded-[2.4rem] border border-[#E8D8C4] bg-white shadow-[0_24px_80px_rgba(15,33,53,0.08)]">
            <div className="grid gap-0 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="relative min-h-[420px] bg-[#f7efe4] p-5 sm:p-6">
                <Image
                  src={placeholderVisuals.homeBackground}
                  alt={t.home.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.06)_28%,rgba(20,13,9,0.34)_100%)]" />

                <div className="relative z-10 mx-auto max-w-sm rounded-[2rem] border border-white/55 bg-[rgba(255,255,255,0.78)] p-4 shadow-[0_18px_40px_rgba(15,33,53,0.12)] backdrop-blur">
                  <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.32em] text-[#73695d]">
                    {t.home.entryLabel}
                  </p>
                  <EventAccessForm />
                </div>
              </div>

              <div className="flex flex-col justify-between px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-[#A57A49]">
                    EventDrop
                  </p>
                  <h1 className="mt-4 text-[42px] font-semibold uppercase leading-[0.9] tracking-[-0.08em] text-[#17120f] sm:text-[56px]">
                    Drop your
                  </h1>
                  <p className="mt-1 text-[34px] italic leading-none text-[#F28C18] sm:text-[42px]">
                    moments
                  </p>
                  <p className="mt-5 max-w-md text-sm leading-7 text-[#5D6775]">
                    {t.home.intro}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <PhotoTile
                    src={placeholderVisuals.coverOne}
                    alt=""
                    className="h-36 sm:h-44"
                  />
                  <PhotoTile
                    src={placeholderVisuals.coverTwo}
                    alt=""
                    className="h-36 sm:h-44"
                  />
                  <PhotoTile
                    src={placeholderVisuals.coverThree}
                    alt=""
                    className="h-36 sm:h-44"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
            <div className="overflow-hidden rounded-[2.4rem] border border-[#E8D8C4] bg-white shadow-[0_24px_80px_rgba(15,33,53,0.08)]">
              <div className="grid gap-0 lg:grid-cols-[1.06fr_0.94fr] xl:grid-cols-1">
                <div className="p-6">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-[#0F3D66]">
                    {t.home.howItWorks}
                  </p>
                  <div className="mt-5 space-y-3">
                    {t.home.points.map((point, index) => (
                      <div
                        key={point}
                        className="flex items-start gap-3 rounded-[1.4rem] bg-[#F7FAFD] px-4 py-4"
                      >
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFD244] text-sm font-semibold text-[#17120f]">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-6 text-[#33516F]">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative min-h-[280px] bg-[#f3ebdf]">
                  <Image
                    src={placeholderVisuals.eventBackground}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,33,53,0.12)_0%,rgba(15,33,53,0.42)_100%)]" />
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[2.2rem] bg-[#0F3D66] p-6 text-white shadow-[0_24px_70px_rgba(15,61,102,0.18)]">
                <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-[#BFD4EA]">
                  {t.home.bestFor}
                </p>
                <p className="mt-4 text-base leading-8 text-[#F4F8FC]">
                  {t.home.bestForText}
                </p>
              </div>

              <div className="rounded-[2.2rem] bg-[#FFF4E8] p-6 shadow-[0_24px_70px_rgba(155,101,29,0.12)]">
                <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-[#A57A49]">
                  {t.home.flowTitle}
                </p>
                <p className="mt-4 text-base leading-8 text-[#5D4B3B]">
                  {t.home.flowText}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
