'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { useLanguage } from '@/app/_components/language-provider'
import { getPublicAppUrl, getPublicPath } from '@/lib/app-url'
import { brand } from '@/lib/brand'
import {
  buildEventInsertPayload,
  formatEventDisplayName,
  generateEventAccessCode,
  getEventGalleryRoute,
  getEventJoinRoute,
  getEventRoute,
  normalizeEventAccessCode,
  normalizeEventRecord,
  type NormalizedEvent,
} from '@/lib/events'

function formatEventLabel(event: NormalizedEvent) {
  return formatEventDisplayName(event)
}

type GuestAccessEntry = {
  email: string
  created_at: string | null
}

export default function AdminPage() {
  const { t } = useLanguage()
  const [authenticated, setAuthenticated] = useState(false)
  const [configured, setConfigured] = useState(true)
  const [canChangePassword, setCanChangePassword] = useState(false)
  const [adminUsername, setAdminUsername] = useState('')
  const [loadingSession, setLoadingSession] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [currentPasswordForChange, setCurrentPasswordForChange] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [confirmNextPassword, setConfirmNextPassword] = useState('')
  const [statusMessage, setStatusMessage] = useState(t.admin.loginPrompt)
  const [submitting, setSubmitting] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [events, setEvents] = useState<NormalizedEvent[]>([])
  const [guestAccessByEvent, setGuestAccessByEvent] = useState<
    Record<string, GuestAccessEntry[]>
  >({})
  const [eventName, setEventName] = useState('')
  const [albumName, setAlbumName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [accessCodeEnabled, setAccessCodeEnabled] = useState(false)
  const [allowGuestShare, setAllowGuestShare] = useState(true)
  const [allowGuestDownload, setAllowGuestDownload] = useState(true)
  const [allowGuestDelete, setAllowGuestDelete] = useState(false)
  const [accessCode, setAccessCode] = useState(() => generateEventAccessCode())
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('')
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null)
  const [uploadingVisual, setUploadingVisual] = useState<'cover' | 'background' | null>(null)
  const [eventControlsById, setEventControlsById] = useState<
    Record<
      string,
      {
        allowGuestShare: boolean
        allowGuestDownload: boolean
        allowGuestDelete: boolean
      }
    >
  >({})

  const publicBaseUrl = getPublicAppUrl()
  const adminUrl = getPublicPath('/control-room-7x')

  const latestEvent = useMemo(() => events[0] || null, [events])

  const getEventIdentifier = (event: NormalizedEvent) => event.slug || event.id
  const getEventShareUrl = (event: NormalizedEvent) =>
    `${publicBaseUrl}${getEventJoinRoute(getEventIdentifier(event))}`
  const getGalleryShareUrl = (event: NormalizedEvent) =>
    `${publicBaseUrl}${getEventGalleryRoute(getEventIdentifier(event))}`
  const getPublicJoinPath = (event: NormalizedEvent) =>
    getPublicPath(getEventJoinRoute(getEventIdentifier(event)))
  const getPublicUploadPath = (event: NormalizedEvent) =>
    getPublicPath(getEventRoute(getEventIdentifier(event)))
  const getPublicGalleryPath = (event: NormalizedEvent) =>
    getPublicPath(getEventGalleryRoute(getEventIdentifier(event)))

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
      guestAccessByEvent?: Record<string, GuestAccessEntry[]>
      error?: string
    }

    if (!response.ok) {
      throw new Error(payload.error || t.admin.loadError)
    }

    const normalized = (payload.events || [])
      .map((item) => normalizeEventRecord(item))
      .filter((item): item is NormalizedEvent => Boolean(item))

    setEvents(normalized)
    setEventControlsById(
      normalized.reduce<
        Record<
          string,
          {
            allowGuestShare: boolean
            allowGuestDownload: boolean
            allowGuestDelete: boolean
          }
        >
      >((accumulator, event) => {
        accumulator[event.id] = {
          allowGuestShare: event.allowGuestShare,
          allowGuestDownload: event.allowGuestDownload,
          allowGuestDelete: event.allowGuestDelete,
        }

        return accumulator
      }, {})
    )
    setGuestAccessByEvent(payload.guestAccessByEvent || {})
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
          username?: string
          canChangePassword?: boolean
        }

        setAuthenticated(Boolean(payload.authenticated))
        setConfigured(payload.configured !== false)
        setCanChangePassword(Boolean(payload.canChangePassword))
        setAdminUsername(payload.username || '')
        if (payload.username) {
          setUsername(payload.username)
        }

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
    setCurrentPasswordForChange('')
    setNextPassword('')
    setConfirmNextPassword('')
    setEvents([])
    setEventControlsById({})
    setGuestAccessByEvent({})
    setStatusMessage(t.admin.signedOut)
  }

  const handlePasswordChange = async () => {
    if (!adminUsername.trim() || !currentPasswordForChange || !nextPassword || !confirmNextPassword) {
      setStatusMessage(t.admin.passwordFieldsRequired)
      return
    }

    if (nextPassword !== confirmNextPassword) {
      setStatusMessage(t.admin.passwordMismatch)
      return
    }

    if (nextPassword.length < 8) {
      setStatusMessage(t.admin.passwordTooShort)
      return
    }

    setSavingPassword(true)

    try {
      const response = await fetch('/api/admin/credentials', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentUsername: adminUsername.trim(),
          currentPassword: currentPasswordForChange,
          nextPassword,
          confirmPassword: confirmNextPassword,
        }),
      })

      const payload = (await response.json()) as {
        ok?: boolean
        username?: string
        error?: string
      }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || t.admin.passwordChangeError)
      }

      setAdminUsername(payload.username || adminUsername)
      setCurrentPasswordForChange('')
      setNextPassword('')
      setConfirmNextPassword('')
      setPassword('')
      setStatusMessage(t.admin.passwordChangeSuccess)
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : t.admin.passwordChangeError
      )
    } finally {
      setSavingPassword(false)
    }
  }

  const createEventRecord = async () => {
    if (!eventName.trim() || !albumName.trim()) {
      setStatusMessage(t.admin.createError)
      return
    }

    setSubmitting(true)

    try {
      const persistedCoverImageUrl =
        coverImageUrl.startsWith('http://') || coverImageUrl.startsWith('https://')
          ? coverImageUrl
          : ''
      const persistedBackgroundImageUrl =
        backgroundImageUrl.startsWith('http://') ||
        backgroundImageUrl.startsWith('https://')
          ? backgroundImageUrl
          : ''

      const payload = buildEventInsertPayload({
        name: eventName,
        albumName,
        eventDate,
        accessCode,
        accessCodeEnabled,
        coverImageUrl: persistedCoverImageUrl,
        backgroundImageUrl: persistedBackgroundImageUrl,
        allowGuestShare,
        allowGuestDownload,
        allowGuestDelete,
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
          accessCode: payload.access_code,
          accessCodeEnabled,
          coverImageUrl: payload.cover_image_url,
          backgroundImageUrl: payload.background_image_url,
          allowGuestShare: payload.allow_guest_share,
          allowGuestDownload: payload.allow_guest_download,
          allowGuestDelete: payload.allow_guest_delete,
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
        let nextEvent = normalized

        if (coverImageFile) {
          const uploadedCoverUrl = await uploadVisualForEvent(
            normalized.id,
            coverImageFile,
            'cover'
          )
          nextEvent = { ...nextEvent, coverImageUrl: uploadedCoverUrl }
        }

        if (backgroundImageFile) {
          const uploadedBackgroundUrl = await uploadVisualForEvent(
            normalized.id,
            backgroundImageFile,
            'background'
          )
          nextEvent = {
            ...nextEvent,
            backgroundImageUrl: uploadedBackgroundUrl,
          }
        }

        setEvents((prev) => [nextEvent, ...prev.filter((item) => item.id !== nextEvent.id)])
        setEventControlsById((prev) => ({
          ...prev,
          [nextEvent.id]: {
            allowGuestShare: nextEvent.allowGuestShare,
            allowGuestDownload: nextEvent.allowGuestDownload,
            allowGuestDelete: nextEvent.allowGuestDelete,
          },
        }))
      }

      setEventName('')
      setAlbumName('')
      setEventDate('')
      setAccessCodeEnabled(false)
      setAllowGuestShare(true)
      setAllowGuestDownload(true)
      setAllowGuestDelete(false)
      setAccessCode(generateEventAccessCode())
      setCoverImageFile(null)
      setBackgroundImageFile(null)
      setCoverImageUrl('')
      setBackgroundImageUrl('')
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

  const uploadVisualForEvent = useCallback(
    async (eventId: string, file: File, kind: 'cover' | 'background') => {
      setUploadingVisual(kind)
      setStatusMessage(t.admin.mediaUploading)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('eventId', eventId)
        formData.append('kind', kind)

        const response = await fetch('/api/admin/event-media', {
          method: 'POST',
          body: formData,
        })

        const payload = (await response.json()) as {
          ok?: boolean
          url?: string
          error?: string
        }

        if (!response.ok || !payload.url) {
          throw new Error(payload.error || t.admin.mediaUploadError)
        }

        return payload.url
      } finally {
        setUploadingVisual(null)
      }
    },
    [t.admin.mediaUploadError, t.admin.mediaUploading]
  )

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
      setGuestAccessByEvent((prev) => {
        const next = { ...prev }
        delete next[eventId]
        return next
      })
      setEventControlsById((prev) => {
        const next = { ...prev }
        delete next[eventId]
        return next
      })
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

  const handleEventControlChange = (
    eventId: string,
    key: 'allowGuestShare' | 'allowGuestDownload' | 'allowGuestDelete',
    value: boolean
  ) => {
    setEventControlsById((prev) => ({
      ...prev,
      [eventId]: {
        allowGuestShare: prev[eventId]?.allowGuestShare ?? true,
        allowGuestDownload: prev[eventId]?.allowGuestDownload ?? true,
        allowGuestDelete: prev[eventId]?.allowGuestDelete ?? false,
        [key]: value,
      },
    }))
  }

  const saveEventControls = async (eventId: string) => {
    const currentSettings = eventControlsById[eventId]

    if (!currentSettings) return

    setSubmitting(true)

    try {
      const response = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: eventId,
          allowGuestShare: currentSettings.allowGuestShare,
          allowGuestDownload: currentSettings.allowGuestDownload,
          allowGuestDelete: currentSettings.allowGuestDelete,
        }),
      })

      const payload = (await response.json()) as {
        ok?: boolean
        event?: Record<string, unknown>
        error?: string
      }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || t.admin.visibilitySaveError)
      }

      const normalized = normalizeEventRecord(payload.event)

      if (normalized) {
        setEvents((prev) => prev.map((event) => (event.id === eventId ? normalized : event)))
        setEventControlsById((prev) => ({
          ...prev,
          [eventId]: {
            allowGuestShare: normalized.allowGuestShare,
            allowGuestDownload: normalized.allowGuestDownload,
            allowGuestDelete: normalized.allowGuestDelete,
          },
        }))
      }

      setStatusMessage(t.admin.visibilitySaved)
    } catch (error) {
      console.error('Failed to save event controls', error)
      setStatusMessage(
        error instanceof Error ? error.message : t.admin.visibilitySaveError
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
              <p className="mt-3 break-all text-xs text-[#BFD4EA]">{adminUrl}</p>
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

                <div className="rounded-[1.8rem] border border-white/12 bg-white/8 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#BFD4EA]">
                    {t.admin.createTitle}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#EAF3FB]">
                    Drop your moments
                  </p>
                </div>

                <div className="rounded-[1.8rem] border border-white/12 bg-white/8 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#BFD4EA]">
                    {t.admin.passwordSection}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#EAF3FB]">
                    {canChangePassword
                      ? t.admin.passwordSectionHelp
                      : t.admin.passwordSectionUnavailable}
                  </p>

                  {canChangePassword ? (
                    <>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                            {t.admin.username}
                          </label>
                          <input
                            value={adminUsername}
                            readOnly
                            disabled={savingPassword}
                            className="w-full rounded-2xl border border-[#D4DFEE] bg-white px-4 py-3 text-sm text-[#0B2742]"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                            {t.admin.currentPassword}
                          </label>
                          <input
                            type="password"
                            value={currentPasswordForChange}
                            onChange={(event) => setCurrentPasswordForChange(event.target.value)}
                            disabled={savingPassword}
                            className="w-full rounded-2xl border border-[#D4DFEE] bg-white px-4 py-3 text-sm text-[#0B2742]"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                            {t.admin.newPassword}
                          </label>
                          <input
                            type="password"
                            value={nextPassword}
                            onChange={(event) => setNextPassword(event.target.value)}
                            disabled={savingPassword}
                            className="w-full rounded-2xl border border-[#D4DFEE] bg-white px-4 py-3 text-sm text-[#0B2742]"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                            {t.admin.confirmNewPassword}
                          </label>
                          <input
                            type="password"
                            value={confirmNextPassword}
                            onChange={(event) => setConfirmNextPassword(event.target.value)}
                            disabled={savingPassword}
                            className="w-full rounded-2xl border border-[#D4DFEE] bg-white px-4 py-3 text-sm text-[#0B2742]"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handlePasswordChange}
                        disabled={savingPassword}
                        className={`mt-4 rounded-full px-5 py-3 text-sm font-semibold ${
                          savingPassword
                            ? 'cursor-not-allowed bg-[#7A8EA5] text-[#DCE6F0]'
                            : 'bg-[#F58220] text-white hover:bg-[#DB6E12]'
                        }`}
                      >
                        {savingPassword ? t.admin.savingPassword : t.admin.changePassword}
                      </button>
                    </>
                  ) : null}
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
                      className="w-full rounded-2xl border border-[#D4DFEE] bg-white px-4 py-3 text-sm text-[#0B2742] placeholder:text-[#7D95AF]"
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
                      className="w-full rounded-2xl border border-[#D4DFEE] bg-white px-4 py-3 text-sm text-[#0B2742] placeholder:text-[#7D95AF]"
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
                      className="w-full rounded-2xl border border-[#D4DFEE] bg-white px-4 py-3 text-sm text-[#0B2742]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/12 bg-white/8 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[#EAF3FB]">
                          {t.admin.eventCodeToggle}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#DDEAF7]">
                          {accessCodeEnabled
                            ? t.admin.eventCodeEnabledHelp
                            : t.admin.eventCodeDisabledHelp}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAccessCodeEnabled((current) => !current)}
                        className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold ${
                          accessCodeEnabled
                            ? 'bg-[#F58220] text-white'
                            : 'bg-white text-[#0F3D66]'
                        }`}
                      >
                        {accessCodeEnabled ? t.admin.toggleOn : t.admin.toggleOff}
                      </button>
                    </div>

                    <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                      {t.admin.accessCodeField}
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        disabled={!accessCodeEnabled}
                        value={accessCode}
                        onChange={(event) =>
                          setAccessCode(normalizeEventAccessCode(event.target.value))
                        }
                        placeholder="YUNA26"
                        autoCapitalize="characters"
                        autoCorrect="off"
                        className={`w-full rounded-2xl border border-[#D4DFEE] px-4 py-3 text-sm uppercase tracking-[0.18em] placeholder:text-[#7D95AF] ${
                          accessCodeEnabled
                            ? 'bg-white text-[#0B2742]'
                            : 'cursor-not-allowed bg-[#E7EDF4] text-[#7D95AF]'
                        }`}
                      />
                      <button
                        type="button"
                        disabled={!accessCodeEnabled}
                        onClick={() => setAccessCode(generateEventAccessCode())}
                        className={`rounded-full px-4 py-3 text-sm font-semibold ${
                          accessCodeEnabled
                            ? 'border border-white/20 text-white hover:bg-white/10'
                            : 'cursor-not-allowed border border-white/10 text-[#9CB2C8]'
                        }`}
                      >
                        {t.admin.regenerateCode}
                      </button>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#DDEAF7]">
                      {t.admin.accessCodeHelp}
                    </p>
                  </div>

                  <div className="md:col-span-2 rounded-2xl border border-white/12 bg-white/8 p-4">
                    <p className="text-sm font-medium text-[#EAF3FB]">
                      {t.admin.publicTools}
                    </p>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                        <span className="text-sm text-[#EAF3FB]">{t.admin.shareEnabled}</span>
                        <button
                          type="button"
                          onClick={() => setAllowGuestShare((current) => !current)}
                          className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold ${
                            allowGuestShare ? 'bg-[#F58220] text-white' : 'bg-white text-[#0F3D66]'
                          }`}
                        >
                          {allowGuestShare ? t.admin.toggleOn : t.admin.toggleOff}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                        <span className="text-sm text-[#EAF3FB]">{t.admin.downloadEnabled}</span>
                        <button
                          type="button"
                          onClick={() => setAllowGuestDownload((current) => !current)}
                          className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold ${
                            allowGuestDownload ? 'bg-[#F58220] text-white' : 'bg-white text-[#0F3D66]'
                          }`}
                        >
                          {allowGuestDownload ? t.admin.toggleOn : t.admin.toggleOff}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                        <span className="text-sm text-[#EAF3FB]">{t.admin.deleteEnabled}</span>
                        <button
                          type="button"
                          onClick={() => setAllowGuestDelete((current) => !current)}
                          className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold ${
                            allowGuestDelete ? 'bg-[#F58220] text-white' : 'bg-white text-[#0F3D66]'
                          }`}
                        >
                          {allowGuestDelete ? t.admin.toggleOn : t.admin.toggleOff}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                      {t.admin.coverImage}
                    </label>
                    <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/8 px-4 py-3 text-sm font-semibold text-white hover:bg-white/12">
                      {uploadingVisual === 'cover'
                        ? t.admin.mediaUploading
                        : coverImageFile?.name || t.admin.uploadCover}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null
                          setCoverImageFile(file)
                          setCoverImageUrl(file ? URL.createObjectURL(file) : '')
                        }}
                        className="sr-only"
                      />
                    </label>
                    {coverImageUrl ? (
                      <div
                        className="mt-3 h-28 rounded-2xl border border-white/10 bg-cover bg-center"
                        style={{ backgroundImage: `url(${coverImageUrl})` }}
                      />
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                      {t.admin.backgroundImage}
                    </label>
                    <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/8 px-4 py-3 text-sm font-semibold text-white hover:bg-white/12">
                      {uploadingVisual === 'background'
                        ? t.admin.mediaUploading
                        : backgroundImageFile?.name || t.admin.uploadBackground}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null
                          setBackgroundImageFile(file)
                          setBackgroundImageUrl(file ? URL.createObjectURL(file) : '')
                        }}
                        className="sr-only"
                      />
                    </label>
                    {backgroundImageUrl ? (
                      <div
                        className="mt-3 h-28 rounded-2xl border border-white/10 bg-cover bg-center"
                        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
                      />
                    ) : null}
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
                href={getPublicJoinPath(latestEvent)}
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
                  {event.accessCode ? (
                    <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-[#0F3D66]">
                      {t.admin.accessCodeLabel}: {event.accessCode}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-[#6A84A3]">
                      {t.admin.emailOnlyEntry}
                    </p>
                  )}
                  {event.eventDate ? (
                    <p className="mt-2 text-sm text-[#33516F]">
                      {t.common.eventDate}: {event.eventDate}
                    </p>
                  ) : null}

                  <div className="mt-4 rounded-[1.5rem] border border-[#D4DFEE] bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                      {t.admin.publicTools}
                    </p>

                    <div className="mt-3 grid gap-3">
                      {([
                        ['allowGuestShare', t.admin.shareEnabled],
                        ['allowGuestDownload', t.admin.downloadEnabled],
                        ['allowGuestDelete', t.admin.deleteEnabled],
                      ] as const).map(([key, label]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-2xl border border-[#D4DFEE] bg-[#F8FBFE] px-4 py-3"
                        >
                          <span className="text-sm text-[#33516F]">{label}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleEventControlChange(
                                event.id,
                                key,
                                !eventControlsById[event.id]?.[key]
                              )
                            }
                            className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold ${
                              eventControlsById[event.id]?.[key]
                                ? 'bg-[#F58220] text-white'
                                : 'bg-[#E8EEF6] text-[#0F3D66]'
                            }`}
                          >
                            {eventControlsById[event.id]?.[key]
                              ? t.admin.toggleOn
                              : t.admin.toggleOff}
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => saveEventControls(event.id)}
                      disabled={submitting}
                      className={`mt-4 rounded-full px-4 py-2 text-sm font-semibold ${
                        submitting
                          ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                          : 'bg-[#0F3D66] text-white hover:bg-[#0B2F4F]'
                      }`}
                    >
                      {t.admin.saveVisibility}
                    </button>
                  </div>

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
                      href={getPublicJoinPath(event)}
                      className="inline-flex items-center justify-center rounded-full bg-[#F58220] px-4 py-2 text-sm font-semibold text-white hover:bg-[#DB6E12]"
                    >
                      {t.common.guestEntryPage}
                    </Link>

                    <Link
                      href={getPublicUploadPath(event)}
                      className="inline-flex items-center justify-center rounded-full bg-[#0F3D66] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B2F4F]"
                    >
                      {t.common.uploadPage}
                    </Link>

                    <Link
                      href={getPublicGalleryPath(event)}
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

                    {event.accessCode ? (
                      <button
                        onClick={() =>
                          copyToClipboard(event.accessCode, t.admin.codeCopied)
                        }
                        className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                      >
                        {t.admin.copyCodeButton}
                      </button>
                    ) : null}

                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={submitting}
                      className="inline-flex items-center justify-center rounded-full border border-[#F1B6B6] bg-[#FFF1F1] px-4 py-2 text-sm font-semibold text-[#B52E2E] hover:bg-[#FFE3E3] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {t.common.deleteEvent}
                    </button>
                  </div>

                  <p className="mt-4 break-all text-xs text-[#6A84A3]">
                    Guest entry URL: {getEventShareUrl(event)}
                  </p>

                  <div className="mt-4 rounded-[1.2rem] border border-[#D4DFEE] bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                      {t.admin.guestEmails}
                    </p>

                    {guestAccessByEvent[event.id]?.length ? (
                      <div className="mt-3 space-y-2">
                        {guestAccessByEvent[event.id].map((entry) => (
                          <div
                            key={`${event.id}-${entry.email}`}
                            className="flex flex-col gap-1 rounded-xl bg-[#F7FAFD] px-3 py-2 text-sm text-[#33516F]"
                          >
                            <span className="font-medium text-[#0B2742]">
                              {entry.email}
                            </span>
                            <span className="text-xs text-[#6A84A3]">
                              {entry.created_at
                                ? new Date(entry.created_at).toLocaleString()
                                : t.admin.guestEmailTimeUnknown}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-[#597594]">
                        {t.admin.noGuestEmails}
                      </p>
                    )}
                  </div>
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
