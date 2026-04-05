import Image from 'next/image'
import Link from 'next/link'
import { brand } from '@/lib/brand'

type SiteHeaderProps = {
  currentLabel?: string
}

export function SiteHeader({ currentLabel }: SiteHeaderProps) {
  return (
    <header className="border-b border-stone-200/70 bg-white/80 backdrop-blur">
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
            <p className="text-base font-semibold tracking-tight text-stone-950">
              {brand.name}
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
              {brand.tagline}
            </p>
          </div>
        </Link>

        {currentLabel ? (
          <span className="rounded-full border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-900">
            {currentLabel}
          </span>
        ) : null}
      </div>
    </header>
  )
}
