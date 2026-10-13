'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { locales, type Locale, translations } from '@/lib/i18n'

export const LANGUAGE_STORAGE_KEY = 'eventdrop-locale'

type LanguageContextValue = {
  locale: Locale
  resolveEventLocale: (defaultLocale: Locale, explicitLocale?: string | null) => void
  setLocale: (
    locale: Locale,
    options?: { persist?: boolean; updateUrl?: boolean }
  ) => void
  t: typeof translations.en
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getRouteDefaultLocale(pathname: string | null): Locale {
  return pathname?.startsWith('/control-room-7x') ? 'tr' : 'nl'
}

function getSupportedLocale(value?: string | null): Locale | null {
  const normalized = (value || '').trim().toLowerCase().split(/[-_]/)[0]
  return locales.includes(normalized as Locale) ? (normalized as Locale) : null
}

function getBrowserLocale() {
  const browserLanguages = [...(navigator.languages || []), navigator.language]

  for (const language of browserLanguages) {
    const supportedLocale = getSupportedLocale(language)
    if (supportedLocale) return supportedLocale
  }

  return null
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const routeDefaultLocale = getRouteDefaultLocale(pathname)
  const [locale, setLocale] = useState<Locale>(routeDefaultLocale)

  const handleSetLocale = useCallback((nextLocale: Locale, options?: {
    persist?: boolean
    updateUrl?: boolean
  }) => {
    if (locales.includes(nextLocale)) {
      setLocale(nextLocale)

      if (options?.persist !== false) {
        try {
          window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale)
        } catch {
          // The UI still updates even when the preference cannot be persisted.
        }
      }

      if (options?.updateUrl !== false) {
        const url = new URL(window.location.href)
        url.searchParams.set('lang', nextLocale)
        window.history.replaceState(window.history.state, '', url)
      }
    }
  }, [])

  const resolveEventLocale = useCallback((defaultLocale: Locale, explicitLocale?: string | null) => {
    const urlLocale = getSupportedLocale(
      explicitLocale ?? new URL(window.location.href).searchParams.get('lang')
    )
    let storedLocale: Locale | null = null

    try {
      storedLocale = getSupportedLocale(window.localStorage.getItem(LANGUAGE_STORAGE_KEY))
    } catch {
      storedLocale = null
    }

    handleSetLocale(urlLocale || storedLocale || getBrowserLocale() || defaultLocale)
  }, [handleSetLocale])

  useEffect(() => {
    if (
      pathname?.startsWith('/event/') ||
      pathname?.startsWith('/join/') ||
      pathname?.startsWith('/control-room-7x')
    ) {
      return
    }

    const timer = window.setTimeout(() => resolveEventLocale(routeDefaultLocale), 0)
    return () => window.clearTimeout(timer)
  }, [pathname, resolveEventLocale, routeDefaultLocale])

  const value = useMemo(
    () => ({
      locale,
      resolveEventLocale,
      setLocale: handleSetLocale,
      t: translations[locale],
    }),
    [handleSetLocale, locale, resolveEventLocale]
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
