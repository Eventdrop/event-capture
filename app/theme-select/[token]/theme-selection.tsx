'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { guestbookPdfThemeConfigs, guestbookPdfThemeKeys, type GuestbookPdfThemeKey } from '@/lib/guestbook-pdf-theme'

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
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const endpoint = `/api/guestbook-theme/${encodeURIComponent(token)}`

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    setEventName('')
    setSelected(null)
    setSaved(null)
    setConfirmation('')
    fetch(endpoint, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok || data.ok !== true) throw new Error(data.error || 'Deze link is niet beschikbaar.')
        setEventName(data.name)
        if (themes.includes(data.theme)) setSelected(data.theme)
        setSaved(data.theme)
      })
      .catch((reason) => { if (!controller.signal.aborted) setError(reason.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [endpoint])

  async function save() {
    if (!selected || saving) return
    setSaving(true)
    setError('')
    setConfirmation('')
    try {
      const response = await fetch(endpoint, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: selected }),
      })
      const data = await response.json()
      if (!response.ok || data.ok !== true || data.theme !== selected) {
        throw new Error(data.error || 'Het thema kon niet worden opgeslagen.')
      }
      setSaved(selected)
      setConfirmation(`✓ ${guestbookPdfThemeConfigs[selected].label} is gekozen`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Het thema kon niet worden opgeslagen.')
    } finally { setSaving(false) }
  }

  const preview = selected ? guestbookPdfThemeConfigs[selected] : null
  return (
    <main lang="nl" className="mx-auto min-h-screen max-w-5xl px-4 py-6 text-[#0B2742] sm:px-6">
      <p className="text-sm font-semibold">EventDrop Sharing · Gastenboek</p>
      <h1 className="mt-4 break-words text-2xl font-bold">{eventName || 'Jullie gastenboek'}</h1>
      {loading ? <p role="status" className="mt-6">Even laden...</p> : null}
      {error ? <p role="alert" className="mt-4 text-sm text-red-700">{error}</p> : null}
      {!loading && eventName ? <>
        <p className="mt-2 text-sm">Kies hieronder het ontwerp voor jullie gastenboek.</p>
        <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
          <div>
            {(['wedding', 'party'] as const).map((category) => <section key={category} className="mb-5">
              <h2 className="mb-2 text-sm font-bold">{category === 'wedding' ? 'Wedding' : 'Party'}</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {themes.filter((key) => guestbookPdfThemeConfigs[key].category === category).map((key) => {
                  const config = guestbookPdfThemeConfigs[key]
                  return <button key={key} type="button" disabled={saving} aria-pressed={selected === key}
                    onClick={() => { setSelected(key); setConfirmation('') }}
                    className={`min-w-0 rounded-lg border bg-white p-2 text-left disabled:opacity-60 ${selected === key ? 'border-[#F58220] ring-2 ring-[#F58220]/40' : 'border-[#D4DFEE]'}`}>
                    <Image src={config.previewImage!} alt="" width={1414} height={2000} unoptimized
                      className="aspect-[1414/2000] w-full rounded object-contain" />
                    <span className="mt-2 block text-xs font-semibold">{config.label}{saved === key ? ' ✓' : ''}</span>
                  </button>
                })}
              </div>
            </section>)}
          </div>
          <section aria-label="Voorbeeld" className="min-w-0 md:sticky md:top-6 md:self-start">
            {preview ? <>
              <h2 className="mb-2 text-lg font-semibold">{preview.label}</h2>
              <Image src={preview.previewImage!} alt={preview.label} width={1414} height={2000} unoptimized
                className="mx-auto aspect-[1414/2000] max-h-[55vh] w-auto max-w-full object-contain" />
              <button type="button" onClick={save} disabled={saving}
                className="mt-4 min-h-11 w-full rounded-lg bg-[#123D66] px-4 py-3 font-semibold text-white disabled:opacity-60">
                {saving ? 'Opslaan...' : 'Kies dit thema'}
              </button>
            </> : null}
            <p role="status" className="mt-3 text-sm font-semibold text-green-800">{confirmation}</p>
            <p className="mt-3 text-sm text-[#597594]">Namen en datum worden automatisch aangepast aan jullie evenement.</p>
          </section>
        </div>
      </> : null}
    </main>
  )
}
