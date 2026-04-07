'use client'

import Link from 'next/link'
import { useLanguage } from '@/app/_components/language-provider'
import { getPublicPath } from '@/lib/app-url'
import { brand } from '@/lib/brand'

export function SiteFooter() {
  const { t } = useLanguage()
  const websiteLabel = brand.website.replace(/^https?:\/\//, '')

  return (
    <footer className="border-t border-[#D4DFEE] bg-white/75">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-[#33516F] md:flex-row md:items-center md:justify-between md:px-10">
        <p className="font-medium text-[#0F3D66]">
          {brand.name} · {brand.tagline}
        </p>

        <div className="flex flex-col gap-1 md:items-end">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6A84A3]">
            {t.common.contact}
          </p>
          <p>{brand.email}</p>
          <a
            href={brand.website}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-[#C8D3E5] underline-offset-4 hover:text-[#0F3D66]"
          >
            {websiteLabel}
          </a>
          <p>
            {brand.phone} · {brand.location}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#597594] md:justify-end">
            <Link
              href={getPublicPath('/terms')}
              className="underline decoration-[#C8D3E5] underline-offset-4 hover:text-[#0F3D66]"
            >
              {t.common.terms}
            </Link>
            <Link
              href={getPublicPath('/privacy')}
              className="underline decoration-[#C8D3E5] underline-offset-4 hover:text-[#0F3D66]"
            >
              {t.common.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
