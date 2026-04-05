'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { brand } from '@/lib/brand'
import {
  buildEventInsertPayload,
  getEventGalleryRoute,
  getEventRoute,
  normalizeEventRecord,
  type NormalizedEvent,
} from '@/lib/events'

function formatEventLabel(event: NormalizedEvent) {
  return event.albumName === event.name
    ? event.name
    : `${event.name} · ${event.albumName}`
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [configured, setConfigured] = useState(true)
  const [loadingSession, setLoadingSession] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [statusMessage, setStatusMessage] = useState(
    'Enter your admin username and password.'
  )
  const [submitting, setSubmitting] = useState(false)
  const [events, setEvents] = useState<NormalizedEvent[]>([])
  const [eventName, setEventName] = useState('')
  const [albumName, setAlbumName] = useState('')
  const [eventDate, setEventDate] = useState('')

  const publicBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')

  const latestEvent = useMemo(() => events[0] || null, [events])

  const getEventIdentifier = (event: NormalizedEvent) => event.slug || event.id
  const getEventShareUrl = (event: NormalizedEvent) =>
    `${publicBaseUrl}${getEventRoute(getEventIdentifier(event))}`
  const getGalleryShareUrl = (event: NormalizedEvent) =>
    `${publicBaseUrl}${getEventGalleryRoute(getEventIdentifier(event))}`

  const loadEvents = async () => {
    const response = await fetch('/api/admin/events', {
      cache: 'no-store',
    })

    const payload = (await response.json()) as {
      ok?: boolean
      events?: Record<string, unknown>[]
      error?: string
    }

    if (!response.ok) {
      throw new Error(payload.error || 'Could not load events.')
    }

    const normalized = (payload.events || [])
      .map((item) => normalizeEventRecord(item))
      .filter((item): item is NormalizedEvent => Boolean(item))

    setEvents(normalized)
  }

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
          setStatusMessage('Admin panel unlocked.')
        } else if (payload.configured === false) {
          setStatusMessage('Admin login is not configured on the server.')
        }
      } catch (error) {
        console.error('Failed to load admin session', error)
        setStatusMessage('Could not read the admin session.')
      } finally {
        setLoadingSession(false)
      }
    }

    void loadSession()
  }, [])

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setStatusMessage('Enter both username and password.')
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
        throw new Error(payload.error || 'Admin login failed.')
      }

      setAuthenticated(true)
      setPassword('')
      await loadEvents()
      setStatusMessage('Signed in. You can now create a new event album.')
    } catch (error) {
      console.error('Admin auth failed', error)
      setStatusMessage(
        error instanceof Error ? error.message : 'Admin login failed.'
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
    setStatusMessage('Signed out from the hidden admin panel.')
  }

  const createEventRecord = async () => {
    if (!eventName.trim() || !albumName.trim()) {
      setStatusMessage('Enter both the event name and the album name.')
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
        throw new Error(result.error || 'Event creation failed.')
      }

      const normalized = normalizeEventRecord(result.event)

      if (normalized) {
        setEvents((prev) => [normalized, ...prev.filter((item) => item.id !== normalized.id)])
      }

      setEventName('')
      setAlbumName('')
      setEventDate('')
      setStatusMessage('Event album created successfully.')
    } catch (error) {
      console.error('Event creation failed', error)
      setStatusMessage(
        error instanceof Error ? error.message : 'Event creation failed.'
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
      setStatusMessage('Could not copy the link on this device.')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    const confirmed = window.confirm(
      'Delete this event? This should remove the event record and may also remove related uploads depending on your database rules.'
    )

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
        throw new Error(payload.error || 'Event deletion failed.')
      }

      setEvents((prev) => prev.filter((event) => event.id !== eventId))
      setStatusMessage('Event deleted successfully.')
    } catch (error) {
      console.error('Delete event failed', error)
      setStatusMessage(
        error instanceof Error ? error.message : 'Event deletion failed.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_#f6f2ea_0%,_#efe8dc_100%)]">
      <SiteHeader currentLabel="Restricted Admin" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10 md:px-10">
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(61,44,22,0.12)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Hidden admin access
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
              This page is private and not linked from the public homepage.
            </h1>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              Use a private username and password to manage the latest public album
              that appears on the homepage for guest uploads.
            </p>

            <div className="mt-8 space-y-3 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5 text-sm text-stone-700">
              <p className="font-semibold text-stone-900">{brand.name}</p>
              <p>{brand.email}</p>
              <p>{brand.phone}</p>
              <p>{brand.location}</p>
            </div>

            <p className="mt-6 text-sm text-stone-500">{statusMessage}</p>
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-stone-950 p-6 text-stone-50 shadow-[0_18px_50px_rgba(35,24,12,0.22)]">
            {loadingSession ? (
              <p className="text-sm text-stone-300">Checking admin session...</p>
            ) : authenticated ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                      Admin access
                    </p>
                    <p className="mt-2 text-lg font-semibold text-stone-50">
                      Restricted mode enabled
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-stone-50 hover:bg-white/10"
                  >
                    Sign Out
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-stone-200">
                      Event Name
                    </label>
                    <input
                      value={eventName}
                      onChange={(event) => setEventName(event.target.value)}
                      placeholder="Aylin & Marco Wedding"
                      className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-200">
                      Album Name
                    </label>
                    <input
                      value={albumName}
                      onChange={(event) => setAlbumName(event.target.value)}
                      placeholder="Golden Hour Album"
                      className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-200">
                      Event Date
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
                      ? 'cursor-not-allowed bg-stone-500 text-stone-200'
                      : 'bg-amber-300 text-stone-950 hover:bg-amber-200'
                  }`}
                >
                  {submitting ? 'Saving...' : 'Create Event Album'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-200">
                    Username
                  </label>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="admin"
                    className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-200">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400"
                  />
                </div>

                <button
                  onClick={handleLogin}
                  disabled={submitting}
                  className={`rounded-full px-5 py-3 text-sm font-semibold ${
                    submitting
                      ? 'cursor-not-allowed bg-stone-500 text-stone-200'
                      : 'bg-amber-300 text-stone-950 hover:bg-amber-200'
                  }`}
                >
                  {submitting ? 'Checking...' : 'Unlock Admin'}
                </button>

                <p className="text-sm leading-7 text-stone-300">
                  {configured
                    ? 'Use the private admin username and password configured for this environment.'
                    : 'Admin login is not configured on the server yet.'}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(61,44,22,0.12)] backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                Event list
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
                Recent shared albums
              </h2>
            </div>

            {latestEvent ? (
              <Link
                href={getEventRoute(getEventIdentifier(latestEvent))}
                className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50 hover:bg-stone-800"
              >
                Open latest public album
              </Link>
            ) : null}
          </div>

          {!authenticated ? (
            <p className="mt-6 text-sm text-stone-500">
              Unlock the admin panel to list, create, or delete event albums.
            </p>
          ) : events.length === 0 ? (
            <p className="mt-6 text-sm text-stone-500">
              No event records found yet. Create the first album and it will become
              the public homepage upload target.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5"
                >
                  <p className="text-lg font-semibold text-stone-950">
                    {formatEventLabel(event)}
                  </p>
                  <p className="mt-2 break-all text-sm text-stone-500">
                    Event ID: {event.id}
                  </p>
                  {event.slug ? (
                    <p className="mt-1 break-all text-sm text-stone-500">
                      Public slug: {event.slug}
                    </p>
                  ) : null}
                  {event.eventDate ? (
                    <p className="mt-2 text-sm text-stone-600">
                      Event date: {event.eventDate}
                    </p>
                  ) : null}

                  <div className="mt-4 rounded-[1.25rem] border border-stone-200 bg-white p-4">
                    <div className="flex justify-center">
                      <QRCodeSVG value={getEventShareUrl(event)} size={160} />
                    </div>
                    <p className="mt-3 text-center text-xs uppercase tracking-[0.18em] text-stone-500">
                      Guest upload QR
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      href={getEventRoute(getEventIdentifier(event))}
                      className="inline-flex items-center justify-center rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-stone-50 hover:bg-stone-800"
                    >
                      Upload page
                    </Link>

                    <Link
                      href={getEventGalleryRoute(getEventIdentifier(event))}
                      className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-stone-100"
                    >
                      Gallery
                    </Link>

                    <button
                      onClick={() =>
                        copyToClipboard(
                          getEventShareUrl(event),
                          'Guest upload link copied.'
                        )
                      }
                      className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-stone-100"
                    >
                      Copy upload link
                    </button>

                    <button
                      onClick={() =>
                        copyToClipboard(
                          getGalleryShareUrl(event),
                          'Gallery link copied.'
                        )
                      }
                      className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-stone-100"
                    >
                      Copy gallery link
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={submitting}
                      className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete event
                    </button>
                  </div>

                  <p className="mt-4 break-all text-xs text-stone-500">
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
