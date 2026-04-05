'use client'

import { localeLabels, locales } from '@/lib/i18n'
import { useLanguage } from '@/app/_components/language-provider'

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()

  return (
    <div className="inline-flex rounded-full border border-[#C8D3E5] bg-white/88 p-1 shadow-sm">
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.18em] ${
            locale === code
              ? 'bg-[#0F3D66] text-white shadow-[0_8px_18px_rgba(15,61,102,0.18)]'
              : 'text-[#0F3D66] hover:bg-[#EDF4FB]'
          }`}
        >
          {localeLabels[code]}
        </button>
      ))}
    </div>
  )
}
