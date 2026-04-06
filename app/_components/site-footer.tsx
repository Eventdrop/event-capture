'use client'

import { useLanguage } from '@/app/_components/language-provider'
import { brand } from '@/lib/brand'

export function SiteFooter() {
  const { t } = useLanguage()

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
          <p>{brand.website}</p>
          <p>
            {brand.phone} · {brand.location}
          </p>
        </div>
      </div>
    </footer>
  )
}
