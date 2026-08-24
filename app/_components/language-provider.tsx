'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { locales, type Locale, translations } from '@/lib/i18n'

export const LANGUAGE_STORAGE_KEY = 'eventdrop-locale'

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale, options?: { persist?: boolean }) => void
  t: typeof translations.en
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getRouteDefaultLocale(pathname: string | null): Locale {
  return pathname?.startsWith('/control-room-7x') ? 'tr' : 'nl'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const routeDefaultLocale = getRouteDefaultLocale(pathname)
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') return routeDefaultLocale

    try {
      const storedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)

      if (storedLocale && locales.includes(storedLocale as Locale)) {
        return storedLocale as Locale
      }
    } catch {
      return routeDefaultLocale
    }

    return routeDefaultLocale
  })

  const handleSetLocale = useCallback((nextLocale: Locale, options?: { persist?: boolean }) => {
    if (locales.includes(nextLocale)) {
      setLocale(nextLocale)

      if (options?.persist === false) return

      try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale)
      } catch {
        // The UI still updates even when the preference cannot be persisted.
      }
    }
  }, [])

  const value = useMemo(
    () => ({
      locale,
      setLocale: handleSetLocale,
      t: translations[locale],
    }),
    [handleSetLocale, locale]
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
