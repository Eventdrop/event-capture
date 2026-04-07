'use client'

import { useEffect, useRef, useState } from 'react'
import { localeLabels, locales } from '@/lib/i18n'
import { useLanguage } from '@/app/_components/language-provider'

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-full border border-[#C8D3E5] bg-white/92 px-3 py-2 text-xs font-semibold tracking-[0.18em] text-[#0F3D66] shadow-sm"
      >
        <span>{localeLabels[locale]}</span>
        <span className={`text-[10px] transition ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 min-w-28 rounded-2xl border border-[#D4DFEE] bg-white p-2 shadow-[0_18px_40px_rgba(15,61,102,0.12)]">
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setLocale(code)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold tracking-[0.18em] ${
                locale === code
                  ? 'bg-[#0F3D66] text-white'
                  : 'text-[#0F3D66] hover:bg-[#EDF4FB]'
              }`}
            >
              <span>{localeLabels[code]}</span>
              {locale === code ? <span>•</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
