'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LanguageSwitcher } from '@/app/_components/language-switcher'
import { getPublicPath } from '@/lib/app-url'
import { brand } from '@/lib/brand'

type SiteHeaderProps = {
  currentLabel?: string
  brandHref?: string
}

export function SiteHeader({ currentLabel, brandHref }: SiteHeaderProps) {
  return (
    <header className="relative z-50 border-b border-[#D4DFEE] bg-white/82 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2 md:gap-4 md:px-10 md:py-4">
        <Link
          href={brandHref || getPublicPath('/')}
          aria-label={brand.name}
          className="relative h-[52px] w-[112px] shrink-0 overflow-hidden md:h-[72px] md:w-[155px]"
        >
          <Image
            src="/eventdrop-brand.png"
            alt={brand.name}
            width={540}
            height={540}
            priority
            className="absolute left-[-6px] top-[-31px] h-[124px] w-[124px] max-w-none md:left-[-8px] md:top-[-43px] md:h-[170px] md:w-[170px]"
          />
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {currentLabel ? (
            <span className="hidden text-sm font-semibold text-[#0F3D66] sm:inline">
              {currentLabel}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  )
}
