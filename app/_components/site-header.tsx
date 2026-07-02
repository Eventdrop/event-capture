'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LanguageSwitcher } from '@/app/_components/language-switcher'
import { getPublicPath } from '@/lib/app-url'
import { brand } from '@/lib/brand'

type SiteHeaderProps = {
  currentLabel?: string
}

export function SiteHeader({ currentLabel }: SiteHeaderProps) {
  return (
    <header className="relative z-50 border-b border-[#D4DFEE] bg-white/82 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 md:px-10">
        <Link
          href={getPublicPath('/')}
          aria-label={brand.name}
          className="relative h-[72px] w-[155px] shrink-0 overflow-hidden"
        >
          <Image
            src="/eventdrop-brand.png"
            alt={brand.name}
            width={540}
            height={540}
            priority
            className="absolute left-[-8px] top-[-43px] h-[170px] w-[170px] max-w-none"
          />
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {currentLabel ? (
            <span className="text-sm font-semibold text-[#0F3D66]">
              {currentLabel}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  )
}
