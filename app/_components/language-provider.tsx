'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { locales, type Locale, translations } from '@/lib/i18n'

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: typeof translations.en
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'eventdrop-locale'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') {
      return 'nl'
    }

    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null

    if (stored && locales.includes(stored)) {
      return stored
    }

    const browserLocale = navigator.language.toLowerCase()

    if (browserLocale.startsWith('tr')) {
      return 'tr'
    }

    if (browserLocale.startsWith('nl')) {
      return 'nl'
    }

    return 'en'
  })

  const handleSetLocale = (nextLocale: Locale) => {
    setLocale(nextLocale)
    window.localStorage.setItem(STORAGE_KEY, nextLocale)
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
