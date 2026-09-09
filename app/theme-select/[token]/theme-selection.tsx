'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { guestbookPdfThemeConfigs, guestbookPdfThemeKeys, type GuestbookPdfThemeKey } from '@/lib/guestbook-pdf-theme'
import { customerThemeTranslations, localeLabels, locales, resolveCustomerThemeLocale, type Locale } from '@/lib/i18n'

const LANGUAGE_KEY = 'eventdrop-customer-theme-locale'
type PageError = '' | 'invalidLink' | 'invalidTheme' | 'error'
const responseError = (status: number): PageError =>
  status === 403 || status === 404 ? 'invalidLink' : status === 400 ? 'invalidTheme' : 'error'

const themes = guestbookPdfThemeKeys.filter((key) => {
  const config = guestbookPdfThemeConfigs[key]
  return config.implemented && ['wedding', 'party'].includes(config.category)
}).sort((a, b) => guestbookPdfThemeConfigs[a].sortOrder - guestbookPdfThemeConfigs[b].sortOrder)

export default function ThemeSelection({ token }: { token: string }) {
  const [eventName, setEventName] = useState('')
  const [selected, setSelected] = useState<GuestbookPdfThemeKey | null>(null)
  const [saved, setSaved] = useState<GuestbookPdfThemeKey | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<PageError>('')
  const [confirmation, setConfirmation] = useState<GuestbookPdfThemeKey | null>(null)
  const [locale, setLocale] = useState<Locale>('nl')
  const t = customerThemeTranslations[locale]
  const endpoint = `/api/guestbook-theme/${encodeURIComponent(token)}`

  useEffect(() => {
    let savedLanguage = null
    try { savedLanguage = localStorage.getItem(LANGUAGE_KEY) } catch {}
    setLocale(resolveCustomerThemeLocale(savedLanguage, navigator.languages || [navigator.language]))
  }, [])

  function changeLanguage(value: string) {
    if (!locales.includes(value as Locale)) return
    setLocale(value as Locale)
    try { localStorage.setItem(LANGUAGE_KEY, value) } catch {}
  }

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    setEventName('')
    setSelected(null)
    setSaved(null)
    setConfirmation(null)
    fetch(endpoint, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok || data.ok !== true) {
          setError(responseError(response.status))
          return
        }
        setEventName(data.name)
        if (themes.includes(data.theme)) setSelected(data.theme)
        setSaved(data.theme)
      })
      .catch(() => { if (!controller.signal.aborted) setError('error') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [endpoint])

  async function save() {
    if (!selected || saving) return
    setSaving(true)
    setError('')
    setConfirmation(null)
    try {
      const response = await fetch(endpoint, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: selected }),
      })
      const data = await response.json()
      if (!response.ok || data.ok !== true || data.theme !== selected) {
        setError(responseError(response.status))
        return
      }
      setSaved(selected)
      setConfirmation(selected)
    } catch {
      setError('error')
    } finally { setSaving(false) }
  }

  const preview = selected ? guestbookPdfThemeConfigs[selected] : null
  return (
    <main lang={locale} className="mx-auto min-h-screen max-w-5xl px-4 py-6 text-[#0B2742] sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">EventDrop Sharing · {t.guestbook}</p>
        <select aria-label={t.language} value={locale} onChange={(event) => changeLanguage(event.target.value)}
          className="min-h-10 shrink-0 rounded-lg border border-[#D4DFEE] bg-white px-2 text-sm">
          {locales.map((code) => <option key={code} value={code}>{localeLabels[code]}</option>)}
        </select>
      </div>
      <h1 className="mt-4 break-words text-2xl font-bold">{eventName || t.title}</h1>
      {loading ? <p role="status" className="mt-6">{t.loading}</p> : null}
      {error ? <p role="alert" className="mt-4 text-sm text-red-700">{t[error]}</p> : null}
      {!loading && eventName ? <>
        <p className="mt-2 text-sm">{t.instruction}</p>
        <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
          <div>
            {(['wedding', 'party'] as const).map((category) => <section key={category} className="mb-5">
              <h2 className="mb-2 text-sm font-bold">{t[category]}</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {themes.filter((key) => guestbookPdfThemeConfigs[key].category === category).map((key) => {
                  const config = guestbookPdfThemeConfigs[key]
                  return <button key={key} type="button" disabled={saving} aria-pressed={selected === key}
                    onClick={() => { setSelected(key); setConfirmation(null) }}
                    className={`min-w-0 rounded-lg border bg-white p-2 text-left disabled:opacity-60 ${selected === key ? 'border-[#F58220] ring-2 ring-[#F58220]/40' : 'border-[#D4DFEE]'}`}>
                    <Image src={config.previewImage!} alt="" width={1414} height={2000} unoptimized
                      className="aspect-[1414/2000] w-full rounded object-contain" />
                    <span className="mt-2 block text-xs font-semibold">{config.label}{saved === key ? <span aria-label={t.selected}> ✓</span> : null}</span>
                  </button>
                })}
              </div>
            </section>)}
          </div>
          <section aria-label={t.preview} className="min-w-0 md:sticky md:top-6 md:self-start">
            {preview ? <>
              <h2 className="mb-2 text-lg font-semibold">{preview.label}</h2>
              <Image src={preview.previewImage!} alt={preview.label} width={1414} height={2000} unoptimized
                className="mx-auto aspect-[1414/2000] max-h-[55vh] w-auto max-w-full object-contain" />
              <button type="button" onClick={save} disabled={saving}
                className="mt-4 min-h-11 w-full rounded-lg bg-[#123D66] px-4 py-3 font-semibold text-white disabled:opacity-60">
                {saving ? t.saving : t.choose}
              </button>
            </> : null}
            <p role="status" className="mt-3 text-sm font-semibold text-green-800">{confirmation ? t.confirmation.replace('{theme}', guestbookPdfThemeConfigs[confirmation].label) : ''}</p>
            <p className="mt-3 text-sm text-[#597594]">{t.info}</p>
          </section>
        </div>
      </> : null}
    </main>
  )
}
