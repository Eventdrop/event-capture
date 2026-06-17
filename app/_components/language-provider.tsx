'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { locales, type Locale, translations } from '@/lib/i18n'

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: typeof translations.en
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getRouteDefaultLocale(pathname: string | null): Locale {
  return pathname?.startsWith('/control-room-7x') ? 'tr' : 'nl'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const routeDefaultLocale = getRouteDefaultLocale(pathname)
  const [locale, setLocale] = useState<Locale>(routeDefaultLocale)

  useEffect(() => {
    setLocale(routeDefaultLocale)
  }, [routeDefaultLocale])

  const handleSetLocale = (nextLocale: Locale) => {
    if (locales.includes(nextLocale)) {
      setLocale(nextLocale)
    }
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale: handleSetLocale,
      t: translations[locale],
    }),
    [locale]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider.')
  }

  return context
}
