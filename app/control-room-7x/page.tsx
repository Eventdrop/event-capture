'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { useLanguage } from '@/app/_components/language-provider'
import { getPublicAppUrl } from '@/lib/app-url'
import { brand } from '@/lib/brand'
import {
  buildEventInsertPayload,
  formatEventDisplayName,
  getEventGalleryRoute,
  getEventRoute,
  normalizeEventRecord,
  type NormalizedEvent,
} from '@/lib/events'

function formatEventLabel(event: NormalizedEvent) {
  return formatEventDisplayName(event)
}

export default function AdminPage() {
  const { t } = useLanguage()
  const [authenticated, setAuthenticated] = useState(false)
  const [configured, setConfigured] = useState(true)
  const [loadingSession, setLoadingSession] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [statusMessage, setStatusMessage] = useState(t.admin.loginPrompt)
  const [submitting, setSubmitting] = useState(false)
  const [events, setEvents] = useState<NormalizedEvent[]>([])
  const [eventName, setEventName] = useState('')
  const [albumName, setAlbumName] = useState('')
  const [eventDate, setEventDate] = useState('')

  const publicBaseUrl = getPublicAppUrl()

  const latestEvent = useMemo(() => events[0] || null, [events])

  const getEventIdentifier = (event: NormalizedEvent) => event.slug || event.id
  const getEventShareUrl = (event: NormalizedEvent) =>
    `${publicBaseUrl}${getEventRoute(getEventIdentifier(event))}`
  const getGalleryShareUrl = (event: NormalizedEvent) =>
    `${publicBaseUrl}${getEventGalleryRoute(getEventIdentifier(event))}`

  useEffect(() => {
    setStatusMessage(t.admin.loginPrompt)
  }, [t.admin.loginPrompt])

  const loadEvents = useCallback(async () => {
    const response = await fetch('/api/admin/events', {
      cache: 'no-store',
    })

    const payload = (await response.json()) as {
      ok?: boolean
      events?: Record<string, unknown>[]
      error?: string
    }

    if (!response.ok) {
      throw new Error(payload.error || t.admin.loadError)
    }

    const normalized = (payload.events || [])
      .map((item) => normalizeEventRecord(item))
      .filter((item): item is NormalizedEvent => Boolean(item))

    setEvents(normalized)
  }, [t.admin.loadError])

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch('/api/admin/session', {
          cache: 'no-store',
        })
        const payload = (await response.json()) as {
          authenticated?: boolean
          configured?: boolean
        }

        setAuthenticated(Boolean(payload.authenticated))
        setConfigured(payload.configured !== false)

        if (payload.authenticated) {
          await loadEvents()
          setStatusMessage(t.admin.unlocked)
        } else if (payload.configured === false) {
          setStatusMessage(t.admin.notConfigured)
        }
      } catch (error) {
        console.error('Failed to load admin session', error)
        setStatusMessage(t.admin.loadError)
      } finally {
        setLoadingSession(false)
      }
    }

    void loadSession()
  }, [loadEvents, t.admin.loadError, t.admin.notConfigured, t.admin.unlocked])

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setStatusMessage(t.admin.missingCredentials)
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      })

      const payload = (await response.json()) as {
        authenticated?: boolean
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error || t.admin.invalidCredentials)
      }

      setAuthenticated(true)
      setPassword('')
      await loadEvents()
      setStatusMessage(t.admin.unlocked)
    } catch (error) {
      console.error('Admin auth failed', error)
      setStatusMessage(
        error instanceof Error ? error.message : t.admin.invalidCredentials
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/session', {
      method: 'DELETE',
    })

    setAuthenticated(false)
    setEvents([])
    setStatusMessage(t.admin.signedOut)
  }

  const createEventRecord = async () => {
    if (!eventName.trim() || !albumName.trim()) {
      setStatusMessage(t.admin.createError)
      return
    }

    setSubmitting(true)

    try {
      const payload = buildEventInsertPayload({
        name: eventName,
        albumName,
        eventDate,
      })

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: payload.name,
          albumName: payload.album_name,
          eventDate: payload.event_date,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        event?: Record<string, unknown>
        error?: string
      }

      if (!response.ok) {
        throw new Error(result.error || t.admin.createError)
      }

      const normalized = normalizeEventRecord(result.event)

      if (normalized) {
        setEvents((prev) => [normalized, ...prev.filter((item) => item.id !== normalized.id)])
      }

      setEventName('')
      setAlbumName('')
      setEventDate('')
      setStatusMessage(t.admin.createSuccess)
    } catch (error) {
      console.error('Event creation failed', error)
      setStatusMessage(
        error instanceof Error ? error.message : t.admin.createError
      )
    } finally {
      setSubmitting(false)
    }
  }

  const copyToClipboard = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setStatusMessage(successMessage)
    } catch (error) {
      console.error('Clipboard copy failed', error)
      setStatusMessage(t.admin.loadError)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    const confirmed = window.confirm(t.admin.deleteConfirm)
    if (!confirmed) return

    setSubmitting(true)

    try {
      const response = await fetch('/api/admin/events', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: eventId }),
      })

      const payload = (await response.json()) as { ok?: boolean; error?: string }

      if (!response.ok) {
        throw new Error(payload.error || t.admin.deleteError)
      }

      setEvents((prev) => prev.filter((event) => event.id !== eventId))
      setStatusMessage(t.admin.deleteSuccess)
    } catch (error) {
      console.error('Delete event failed', error)
      setStatusMessage(
        error instanceof Error ? error.message : t.admin.deleteError
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_#f6f4ee_0%,_#edf4fb_100%)]">
      <SiteHeader currentLabel={t.common.restrictedAdmin} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10 md:px-10">
        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[2.2rem] border border-[#D4DFEE] bg-white/85 p-7 shadow-[0_18px_54px_rgba(15,61,102,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6A84A3]">
              {t.common.hiddenAdminAccess}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0B2742]">
              {t.admin.title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#33516F]">
              {t.common.hiddenAdminDescription}
            </p>

            <div className="mt-8 space-y-3 rounded-[1.7rem] border border-[#D4DFEE] bg-[#F7FAFD] p-5 text-sm text-[#33516F]">
              <p className="font-semibold text-[#0B2742]">{brand.name}</p>
              <p>{brand.email}</p>
              <p>{brand.phone}</p>
              <p>{brand.location}</p>
            </div>

            <div className="mt-6 rounded-[1.7rem] bg-[#0F3D66] p-5 text-white">
              <p className="text-xs uppercase tracking-[0.18em] text-[#C9DDF2]">
                {t.admin.hiddenRouteNote}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#EEF6FF]">
                {statusMessage}
              </p>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-[#D4DFEE] bg-[#0F3D66] p-7 text-white shadow-[0_22px_60px_rgba(15,61,102,0.18)]">
            {loadingSession ? (
              <p className="text-sm text-[#DDEAF7]">{t.admin.checkingSession}</p>
            ) : authenticated ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#BFD4EA]">
                      {t.admin.adminAccess}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {t.admin.enabled}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    {t.common.signOut}
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                      {t.admin.eventName}
                    </label>
                    <input
                      value={eventName}
                      onChange={(event) => setEventName(event.target.value)}
                      placeholder="Kingsday Canal Wedding"
                      className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-[#ADC3DA]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                      {t.admin.albumName}
                    </label>
                    <input
                      value={albumName}
                      onChange={(event) => setAlbumName(event.target.value)}
                      placeholder="Orange Night Album"
                      className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-[#ADC3DA]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                      {t.common.eventDate}
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(event) => setEventDate(event.target.value)}
                      className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={createEventRecord}
                  disabled={submitting}
                  className={`rounded-full px-5 py-3 text-sm font-semibold ${
                    submitting
                      ? 'cursor-not-allowed bg-[#7A8EA5] text-[#DCE6F0]'
                      : 'bg-[#F58220] text-white hover:bg-[#DB6E12]'
                  }`}
                >
                  {submitting ? t.admin.saving : t.admin.createButton}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                    {t.admin.username}
                  </label>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="admin"
                    className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-[#ADC3DA]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                    {t.admin.password}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-[#ADC3DA]"
                  />
                </div>

                <button
                  onClick={handleLogin}
                  disabled={submitting}
                  className={`rounded-full px-5 py-3 text-sm font-semibold ${
                    submitting
                      ? 'cursor-not-allowed bg-[#7A8EA5] text-[#DCE6F0]'
                      : 'bg-[#F58220] text-white hover:bg-[#DB6E12]'
                  }`}
                >
                  {submitting ? t.admin.checking : t.admin.unlock}
                </button>

                <p className="text-sm leading-7 text-[#DDEAF7]">
                  {configured ? t.admin.configuredHint : t.admin.notConfigured}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-[#D4DFEE] bg-white/85 p-7 shadow-[0_18px_54px_rgba(15,61,102,0.08)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6A84A3]">
                {t.admin.recentAlbums}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0B2742]">
                {t.admin.recentAlbums}
              </h2>
            </div>

            {latestEvent ? (
              <Link
                href={getEventRoute(getEventIdentifier(latestEvent))}
                className="inline-flex items-center justify-center rounded-full bg-[#0F3D66] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0B2F4F]"
              >
                {t.common.latestPublicAlbum}
              </Link>
            ) : null}
          </div>

          {!authenticated ? (
            <p className="mt-6 text-sm text-[#597594]">{t.admin.unlockToManage}</p>
          ) : events.length === 0 ? (
            <p className="mt-6 text-sm text-[#597594]">{t.admin.noEvents}</p>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="rounded-[1.8rem] border border-[#D4DFEE] bg-[#F8FBFE] p-5"
                >
                  <p className="text-lg font-semibold text-[#0B2742]">
                    {formatEventLabel(event)}
                  </p>
                  <p className="mt-2 break-all text-sm text-[#6A84A3]">
                    {t.common.eventId}: {event.id}
                  </p>
                  {event.slug ? (
                    <p className="mt-1 break-all text-sm text-[#6A84A3]">
                      Public slug: {event.slug}
                    </p>
                  ) : null}
                  {event.eventDate ? (
                    <p className="mt-2 text-sm text-[#33516F]">
                      {t.common.eventDate}: {event.eventDate}
                    </p>
                  ) : null}

                  <div className="mt-4 rounded-[1.5rem] border border-[#D4DFEE] bg-white p-4">
                    <div className="flex justify-center">
                      <QRCodeSVG value={getEventShareUrl(event)} size={160} />
                    </div>
                    <p className="mt-3 text-center text-xs uppercase tracking-[0.18em] text-[#6A84A3]">
                      {t.admin.qrLabel}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      href={getEventRoute(getEventIdentifier(event))}
                      className="inline-flex items-center justify-center rounded-full bg-[#0F3D66] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B2F4F]"
                    >
                      {t.common.uploadPage}
                    </Link>

                    <Link
                      href={getEventGalleryRoute(getEventIdentifier(event))}
                      className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                    >
                      {t.common.gallery}
                    </Link>

                    <button
                      onClick={() =>
                        copyToClipboard(getEventShareUrl(event), t.admin.uploadCopied)
                      }
                      className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                    >
                      {t.common.copyUploadLink}
                    </button>

                    <button
                      onClick={() =>
                        copyToClipboard(
                          getGalleryShareUrl(event),
                          t.admin.galleryCopied
                        )
                      }
                      className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                    >
                      {t.common.copyGalleryLink}
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={submitting}
                      className="inline-flex items-center justify-center rounded-full border border-[#F1B6B6] bg-[#FFF1F1] px-4 py-2 text-sm font-semibold text-[#B52E2E] hover:bg-[#FFE3E3] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {t.common.deleteEvent}
                    </button>
                  </div>

                  <p className="mt-4 break-all text-xs text-[#6A84A3]">
                    Share URL: {getEventShareUrl(event)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
