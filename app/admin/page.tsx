'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { brand } from '@/lib/brand'
import { buildEventInsertPayload, normalizeEventRecord, type NormalizedEvent } from '@/lib/events'
import { supabase } from '@/lib/supabase'

type SessionUser = {
  email?: string
}

function formatEventLabel(event: NormalizedEvent) {
  return event.albumName === event.name
    ? event.name
    : `${event.name} · ${event.albumName}`
}

export default function AdminPage() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [authMode, setAuthMode] = useState<'login' | 'magic-link'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [statusMessage, setStatusMessage] = useState(
    'Sign in to create and manage shared event albums.'
  )
  const [submitting, setSubmitting] = useState(false)
  const [events, setEvents] = useState<NormalizedEvent[]>([])
  const [eventName, setEventName] = useState('')
  const [albumName, setAlbumName] = useState('')
  const [eventDate, setEventDate] = useState('')

  const publicBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')

  const latestEvent = useMemo(() => events[0] || null, [events])

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Failed to read session', error)
      }

      setUser(data.session?.user ? { email: data.session.user.email } : null)
      setLoadingSession(false)
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email } : null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) return

    const loadEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12)

      if (error) {
        console.error('Failed to load events', error)
        setStatusMessage('Signed in, but events could not be loaded.')
        return
      }

      const normalized = (data || [])
        .map((item) => normalizeEventRecord(item))
        .filter((item): item is NormalizedEvent => Boolean(item))

      setEvents(normalized)
    }

    void loadEvents()
  }, [user])

  const handleLogin = async () => {
    if (!email) {
      setStatusMessage('Enter an admin email address.')
      return
    }

    setSubmitting(true)

    try {
      if (authMode === 'magic-link') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: publicBaseUrl ? `${publicBaseUrl}/admin` : undefined,
          },
        })

        if (error) throw error

        setStatusMessage('Magic link sent. Check your inbox to continue.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        setStatusMessage('Signed in. You can now create a new event album.')
      }
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
    await supabase.auth.signOut()
    setEvents([])
    setStatusMessage('Signed out from the admin panel.')
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

      const richInsert = await supabase
        .from('events')
        .insert([payload])
        .select('*')
        .single()

      let createdRecord = richInsert.data

      if (richInsert.error) {
        const fallbackInsert = await supabase
          .from('events')
          .insert([
            {
              name: `${eventName.trim()} - ${albumName.trim()}`,
            },
          ])
          .select('*')
          .single()

        if (fallbackInsert.error) {
          throw fallbackInsert.error
        }

        createdRecord = fallbackInsert.data
      }

      const normalized = normalizeEventRecord(createdRecord)

      if (normalized) {
        setEvents((prev) => [normalized, ...prev])
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

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_#f6f2ea_0%,_#efe8dc_100%)]">
      <SiteHeader currentLabel="Admin Panel" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10 md:px-10">
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(61,44,22,0.12)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Brand contact
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
              Manage your guest album flow in one place.
            </h1>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              Sign in as an admin, create an event name and album name, then share
              the upload page with your guests using a QR code or direct link.
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
            ) : user ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                      Signed in
                    </p>
                    <p className="mt-2 text-lg font-semibold text-stone-50">
                      {user.email || 'Admin user'}
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
                <div className="flex gap-3">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      authMode === 'login'
                        ? 'bg-amber-300 text-stone-950'
                        : 'border border-white/15 text-stone-200'
                    }`}
                  >
                    Email + Password
                  </button>

                  <button
                    onClick={() => setAuthMode('magic-link')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      authMode === 'magic-link'
                        ? 'bg-amber-300 text-stone-950'
                        : 'border border-white/15 text-stone-200'
                    }`}
                  >
                    Magic Link
                  </button>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-200">
                    Admin Email
                  </label>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@eventdrop.app"
                    className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400"
                  />
                </div>

                {authMode === 'login' ? (
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
                ) : null}

                <button
                  onClick={handleLogin}
                  disabled={submitting}
                  className={`rounded-full px-5 py-3 text-sm font-semibold ${
                    submitting
                      ? 'cursor-not-allowed bg-stone-500 text-stone-200'
                      : 'bg-amber-300 text-stone-950 hover:bg-amber-200'
                  }`}
                >
                  {submitting
                    ? 'Working...'
                    : authMode === 'login'
                      ? 'Sign In'
                      : 'Send Magic Link'}
                </button>

                <p className="text-sm leading-7 text-stone-300">
                  Temporary admin access uses Supabase Auth. If no admin user exists
                  yet, create one in the Supabase dashboard first.
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
                href={`/event/${latestEvent.id}`}
                className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50 hover:bg-stone-800"
              >
                Open latest event
              </Link>
            ) : null}
          </div>

          {events.length === 0 ? (
            <p className="mt-6 text-sm text-stone-500">
              No event records found yet. After signing in, create your first
              shared album here.
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
                  {event.eventDate ? (
                    <p className="mt-2 text-sm text-stone-600">
                      Event date: {event.eventDate}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={`/event/${event.id}`}
                      className="inline-flex items-center justify-center rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-stone-50 hover:bg-stone-800"
                    >
                      Upload page
                    </Link>

                    <Link
                      href={`/event/${event.id}/gallery`}
                      className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-stone-100"
                    >
                      Gallery
                    </Link>
                  </div>

                  <p className="mt-4 break-all text-xs text-stone-500">
                    Share URL: {publicBaseUrl ? `${publicBaseUrl}/event/${event.id}` : `/event/${event.id}`}
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
