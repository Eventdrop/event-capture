'use client'

import Image from 'next/image'
import { EventAccessForm } from '@/app/_components/event-access-form'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { placeholderVisuals } from '@/lib/event-visuals'
import { useLanguage } from '@/app/_components/language-provider'

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />

      <main className="flex-1 px-4 py-6 md:px-8">
        <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[2rem] border border-[#E7E0D5] bg-white shadow-[0_24px_70px_rgba(15,33,53,0.12)]">
          <div className="relative h-[360px] overflow-hidden">
            <Image
              src={placeholderVisuals.homeBackground}
              alt={t.home.title}
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.02)_38%,rgba(0,0,0,0.22)_100%)]" />

            <div className="absolute left-4 right-4 top-6">
              <EventAccessForm />
            </div>
          </div>

          <div className="bg-white px-4 pb-4 pt-3">
            <div className="rotate-[-2deg]">
              <p className="text-[40px] font-semibold uppercase leading-none tracking-[-0.08em] text-[#15110d] sm:text-[48px]">
                DROP YOUR.
              </p>
              <p className="-mt-1 pl-18 text-[28px] italic leading-none text-[#F28C18] sm:text-[34px]">
                moments
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="relative h-36 overflow-hidden rounded-[1.2rem]">
                <Image
                  src={placeholderVisuals.coverOne}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="relative h-36 overflow-hidden rounded-[1.2rem]">
                <Image
                  src={placeholderVisuals.coverTwo}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="relative h-36 overflow-hidden rounded-[1.2rem]">
                <Image
                  src={placeholderVisuals.coverThree}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
