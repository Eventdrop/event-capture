import { brand } from '@/lib/brand'

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-stone-600 md:flex-row md:items-center md:justify-between md:px-10">
        <p className="font-medium text-stone-900">
          {brand.name} · {brand.tagline}
        </p>

        <div className="flex flex-col gap-1 md:items-end">
          <p>{brand.email}</p>
          <p>
            {brand.phone} · {brand.location}
          </p>
        </div>
      </div>
    </footer>
  )
}
