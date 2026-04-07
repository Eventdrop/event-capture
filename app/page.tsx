'use client'

import Image from 'next/image'
import { EventAccessForm } from '@/app/_components/event-access-form'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { useLanguage } from '@/app/_components/language-provider'
import { placeholderVisuals } from '@/lib/event-visuals'

function PosterTile({ src }: { src: string }) {
  return (
    <div className="relative h-[180px] overflow-hidden rounded-[1.35rem] sm:h-[220px]">
      <Image src={src} alt="" fill unoptimized className="object-cover object-center" />
    </div>
  )
}

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col bg-[#fbf7f0]">
      <SiteHeader />

      <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
        <div className="mx-auto grid w-full max-w-6xl gap-6 xl:grid-cols-[420px_minmax(0,1fr)] xl:items-start">
          <section className="overflow-hidden rounded-[2.2rem] border border-[#ead8c1] bg-white shadow-[0_24px_80px_rgba(15,33,53,0.08)]">
            <div className="p-4 sm:p-5">
              <div className="relative h-[420px] overflow-hidden rounded-[1.6rem] sm:h-[560px]">
                <Image
                  src={placeholderVisuals.homeBackground}
                  alt={t.home.title}
                  fill
                  unoptimized
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.16)_38%,rgba(17,12,8,0.24)_100%)] md:bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.03)_38%,rgba(17,12,8,0.18)_100%)]" />

                <div className="absolute inset-x-6 bottom-5 z-10 md:hidden">
                  <div className="rounded-[1.2rem] border border-white/40 bg-[rgba(255,255,255,0.58)] p-2 shadow-[0_10px_22px_rgba(15,33,53,0.1)] backdrop-blur-sm">
                    <EventAccessForm compact />
                  </div>
                </div>
              </div>

              <div className="bg-white px-2 pb-2 pt-4 sm:px-3">
                <div className="text-center">
                  <p className="text-[44px] font-semibold uppercase leading-[0.86] tracking-[-0.09em] text-[#17120f] sm:text-[68px]">
                    DROP YOUR
                  </p>
                  <p className="-mt-1 text-[30px] italic leading-none text-[#F28C18] sm:text-[42px]">
                    moments
                  </p>
                  <div className="mt-3 space-y-1 text-center">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#5d6775] sm:text-[13px]">
                      Scan. Upload. Done.
                    </p>
                    <p className="text-[12px] text-[#8b8175] sm:text-[13px]">
                      All memories in one place.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  <PosterTile src={placeholderVisuals.coverOne} />
                  <PosterTile src={placeholderVisuals.coverTwo} />
                  <PosterTile src={placeholderVisuals.coverThree} />
                </div>

                <p className="mt-5 text-center text-[11px] uppercase tracking-[0.28em] text-[#8b8175]">
                  Photobooth Holland
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6">
            <div className="hidden rounded-[2.2rem] border border-[#ead8c1] bg-white p-6 shadow-[0_24px_80px_rgba(15,33,53,0.08)] md:block sm:p-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#A57A49]">
                {t.home.entryLabel}
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#17120f] sm:text-4xl">
                Drop your moments
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#5D6775]">
                {t.home.intro}
              </p>

              <div className="mt-8 max-w-xl">
                <EventAccessForm />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-[2rem] bg-[#0F3D66] p-6 text-white shadow-[0_24px_70px_rgba(15,61,102,0.16)]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#BFD4EA]">
                  {t.home.bestFor}
                </p>
                <p className="mt-4 text-sm leading-7 text-[#F4F8FC]">
                  {t.home.bestForText}
                </p>
              </div>

              <div className="rounded-[2rem] bg-[#FFF4E8] p-6 shadow-[0_24px_70px_rgba(155,101,29,0.1)]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#A57A49]">
                  {t.home.flowTitle}
                </p>
                <p className="mt-4 text-sm leading-7 text-[#5D4B3B]">
                  {t.home.flowText}
                </p>
              </div>

              <div className="rounded-[2rem] border border-[#E3ECF6] bg-[#F7FAFD] p-6 shadow-[0_24px_70px_rgba(15,61,102,0.06)]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#0F3D66]">
                  {t.home.howItWorks}
                </p>
                <div className="mt-4 space-y-3">
                  {t.home.points.slice(0, 3).map((point) => (
                    <p key={point} className="text-sm leading-7 text-[#33516F]">
                      {point}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
