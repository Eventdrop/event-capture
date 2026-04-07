'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LanguageSwitcher } from '@/app/_components/language-switcher'
import { brand } from '@/lib/brand'

type SiteHeaderProps = {
  currentLabel?: string
}

export function SiteHeader({ currentLabel }: SiteHeaderProps) {
  return (
    <header className="relative z-50 border-b border-[#D4DFEE] bg-white/82 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/eventdrop-logo.svg"
            alt={brand.name}
            width={42}
            height={42}
            priority
          />
          <div>
            <p className="text-base font-semibold tracking-[-0.03em] text-stone-950">
              {brand.name}
            </p>
            <p className="text-xs uppercase tracking-[0.22em] text-[#6A84A3]">
              {brand.tagline}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {currentLabel ? (
            <span className="rounded-full border border-[#C8D3E5] bg-[#F7FAFD] px-3 py-1.5 text-sm font-medium text-[#0F3D66] shadow-sm">
              {currentLabel}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  )
}
