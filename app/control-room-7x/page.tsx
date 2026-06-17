'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { useLanguage } from '@/app/_components/language-provider'
import { getPublicAppUrl, getPublicPath } from '@/lib/app-url'
import {
  buildEventInsertPayload,
  formatEventDisplayName,
  generateEventAccessCode,
  getEventGalleryRoute,
  getEventRoute,
  normalizeEventAccessCode,
  normalizeEventRecord,
  type NormalizedEvent,
} from '@/lib/events'

function formatEventLabel(event: NormalizedEvent) {
  return formatEventDisplayName(event)
}

type EventVisualKind = 'cover' | 'background' | 'posterTemplate' | 'storyTemplate'

type GuestAccessEntry = {
  email: string
  created_at: string | null
}

type GuestMessageEntry = {
  message: string
  file_name: string | null
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
  const [guestMessagesByEvent, setGuestMessagesByEvent] = useState<
    Record<string, GuestMessageEntry[]>
  >({})
  const [eventName, setEventName] = useState('')
  const [albumName, setAlbumName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [accessCodeEnabled, setAccessCodeEnabled] = useState(false)
  const [allowGuestShare, setAllowGuestShare] = useState(true)
  const [allowGuestDownload, setAllowGuestDownload] = useState(true)
  const [allowAlbumDownload, setAllowAlbumDownload] = useState(true)
  const [allowGuestDelete, setAllowGuestDelete] = useState(false)
  const [allowGuestPoster, setAllowGuestPoster] = useState(false)
  const [accessCode, setAccessCode] = useState(() => generateEventAccessCode())
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('')
  const [posterTemplateUrl, setPosterTemplateUrl] = useState('')
  const [storyTemplateUrl, setStoryTemplateUrl] = useState('')
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null)
  const [posterTemplateFile, setPosterTemplateFile] = useState<File | null>(null)
  const [storyTemplateFile, setStoryTemplateFile] = useState<File | null>(null)
  const [uploadingVisual, setUploadingVisual] = useState<
    EventVisualKind | null
  >(null)
  const [updatingEventVisual, setUpdatingEventVisual] = useState<{
    eventId: string
    kind: EventVisualKind
  } | null>(null)
  const [eventDraftsById, setEventDraftsById] = useState<
    Record<string, { name: string; albumName: string }>
  >({})
  const [eventControlsById, setEventControlsById] = useState<
    Record<
      string,
      {
        allowGuestShare: boolean
        allowGuestDownload: boolean
        allowAlbumDownload: boolean
        allowGuestDelete: boolean
        allowGuestPoster: boolean
      }
    >
  >({})

  const publicBaseUrl = getPublicAppUrl()
  const adminUrl = getPublicPath('/control-room-7x')
  const eventVisualLabels: Record<EventVisualKind, string> = {
    cover: t.admin.coverImage,
    background: t.admin.backgroundImage,
    posterTemplate: t.admin.posterTemplateImage,
    storyTemplate: t.admin.storyTemplateImage,
  }

  const latestEvent = useMemo(() => events[0] || null, [events])

  const getEventIdentifier = (event: NormalizedEvent) => event.slug || event.id
  const getEventShareUrl = (event: NormalizedEvent) =>
    `${publicBaseUrl}${getEventRoute(getEventIdentifier(event))}`
  const getGalleryShareUrl = (event: NormalizedEvent) =>
    `${publicBaseUrl}${getEventGalleryRoute(getEventIdentifier(event))}`
  const getPublicJoinPath = (event: NormalizedEvent) =>
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
      guestMessagesByEvent?: Record<string, GuestMessageEntry[]>
      error?: string
    }

    if (!response.ok) {
      throw new Error(payload.error || t.admin.loadError)
    }

    const normalized = (payload.events || [])
      .map((item) => normalizeEventRecord(item))
      .filter((item): item is NormalizedEvent => Boolean(item))

    setEvents(normalized)
    setGuestMessagesByEvent(payload.guestMessagesByEvent || {})
    setEventDraftsById(
      normalized.reduce<Record<string, { name: string; albumName: string }>>(
        (accumulator, event) => {
          accumulator[event.id] = {
            name: event.name,
            albumName: event.albumName,
          }

          return accumulator
        },
        {}
      )
    )
    setEventControlsById(
      normalized.reduce<
        Record<
          string,
          {
            allowGuestShare: boolean
            allowGuestDownload: boolean
            allowAlbumDownload: boolean
            allowGuestDelete: boolean
            allowGuestPoster: boolean
          }
        >
      >((accumulator, event) => {
        accumulator[event.id] = {
          allowGuestShare: event.allowGuestShare,
          allowGuestDownload: event.allowGuestDownload,
          allowAlbumDownload: event.allowAlbumDownload,
          allowGuestDelete: event.allowGuestDelete,
          allowGuestPoster: event.allowGuestPoster,
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
      const persistedPosterTemplateUrl =
        posterTemplateUrl.startsWith('http://') || posterTemplateUrl.startsWith('https://')
          ? posterTemplateUrl
          : ''
      const persistedStoryTemplateUrl =
        storyTemplateUrl.startsWith('http://') || storyTemplateUrl.startsWith('https://')
          ? storyTemplateUrl
          : ''

      const payload = buildEventInsertPayload({
        name: eventName,
        albumName,
        eventDate,
        accessCode,
        accessCodeEnabled,
        coverImageUrl: persistedCoverImageUrl,
        backgroundImageUrl: persistedBackgroundImageUrl,
        posterTemplateUrl: persistedPosterTemplateUrl,
        storyTemplateUrl: persistedStoryTemplateUrl,
        allowGuestShare,
        allowGuestDownload,
        allowAlbumDownload,
        allowGuestDelete,
        allowGuestPoster,
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
          posterTemplateUrl:
            'poster_template_url' in payload ? payload.poster_template_url : undefined,
          storyTemplateUrl:
            'story_template_url' in payload ? payload.story_template_url : undefined,
          allowGuestShare: payload.allow_guest_share,
          allowGuestDownload: payload.allow_guest_download,
          allowAlbumDownload: payload.allow_album_download,
          allowGuestDelete: payload.allow_guest_delete,
          allowGuestPoster: payload.allow_guest_poster,
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

      let mediaUploadError = ''

      if (normalized) {
        let nextEvent = normalized
        const updateCreatedEvent = () => {
          setEvents((prev) => [nextEvent, ...prev.filter((item) => item.id !== nextEvent.id)])
          setEventDraftsById((prev) => ({
            ...prev,
            [nextEvent.id]: {
              name: nextEvent.name,
              albumName: nextEvent.albumName,
            },
          }))
          setEventControlsById((prev) => ({
            ...prev,
            [nextEvent.id]: {
              allowGuestShare: nextEvent.allowGuestShare,
              allowGuestDownload: nextEvent.allowGuestDownload,
              allowAlbumDownload: nextEvent.allowAlbumDownload,
              allowGuestDelete: nextEvent.allowGuestDelete,
              allowGuestPoster: nextEvent.allowGuestPoster,
            },
          }))
        }
        const rememberMediaError = (error: unknown) => {
          mediaUploadError = error instanceof Error ? error.message : t.admin.mediaUploadError
        }

        updateCreatedEvent()

        if (coverImageFile) {
          try {
            const uploadedCover = await uploadVisualForEvent(
              normalized.id,
              coverImageFile,
              'cover'
            )
            nextEvent = uploadedCover.event || { ...nextEvent, coverImageUrl: uploadedCover.url }
            updateCreatedEvent()
          } catch (error) {
            rememberMediaError(error)
          }
        }

        if (backgroundImageFile) {
          try {
            const uploadedBackground = await uploadVisualForEvent(
              normalized.id,
              backgroundImageFile,
              'background'
            )
            nextEvent = uploadedBackground.event || {
              ...nextEvent,
              backgroundImageUrl: uploadedBackground.url,
            }
            updateCreatedEvent()
          } catch (error) {
            rememberMediaError(error)
          }
        }

        if (posterTemplateFile) {
          try {
            const uploadedPosterTemplate = await uploadVisualForEvent(
              normalized.id,
              posterTemplateFile,
              'posterTemplate'
            )
            nextEvent = uploadedPosterTemplate.event || {
              ...nextEvent,
              posterTemplateUrl: uploadedPosterTemplate.url,
            }
            updateCreatedEvent()
          } catch (error) {
            rememberMediaError(error)
          }
        }

        if (storyTemplateFile) {
          try {
            const uploadedStoryTemplate = await uploadVisualForEvent(
              normalized.id,
              storyTemplateFile,
              'storyTemplate'
            )
            nextEvent = uploadedStoryTemplate.event || {
              ...nextEvent,
              storyTemplateUrl: uploadedStoryTemplate.url,
            }
            updateCreatedEvent()
          } catch (error) {
            rememberMediaError(error)
          }
        }
      }

      setEventName('')
      setAlbumName('')
      setEventDate('')
      setAccessCodeEnabled(false)
      setAllowGuestShare(true)
      setAllowGuestDownload(true)
      setAllowAlbumDownload(true)
      setAllowGuestDelete(false)
      setAllowGuestPoster(false)
      setAccessCode(generateEventAccessCode())
      setCoverImageFile(null)
      setBackgroundImageFile(null)
      setPosterTemplateFile(null)
      setStoryTemplateFile(null)
      setCoverImageUrl('')
      setBackgroundImageUrl('')
      setPosterTemplateUrl('')
      setStoryTemplateUrl('')
      setStatusMessage(mediaUploadError ? `${t.admin.createSuccess} ${mediaUploadError}` : t.admin.createSuccess)
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

  const copyGuestEmails = (eventId: string) => {
    const emails = (guestAccessByEvent[eventId] || [])
      .map((entry) => entry.email)
      .filter(Boolean)
      .join('\n')

    if (!emails) {
      setStatusMessage(t.admin.noGuestEmails)
      return
    }

    void copyToClipboard(emails, t.admin.guestEmailsCopied)
  }

  const uploadVisualForEvent = useCallback(
    async (
      eventId: string,
      file: File,
      kind: EventVisualKind
    ) => {
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
          event?: Record<string, unknown>
          error?: string
        }

        if (!response.ok || !payload.url) {
          throw new Error(payload.error || t.admin.mediaUploadError)
        }

        return { url: payload.url, event: normalizeEventRecord(payload.event) }
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
      setGuestMessagesByEvent((prev) => {
        const next = { ...prev }
        delete next[eventId]
        return next
      })
      setEventControlsById((prev) => {
        const next = { ...prev }
        delete next[eventId]
        return next
      })
      setEventDraftsById((prev) => {
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

  const handleEventDraftChange = (
    eventId: string,
    key: 'name' | 'albumName',
    value: string
  ) => {
    setEventDraftsById((prev) => ({
      ...prev,
      [eventId]: {
        name: prev[eventId]?.name || '',
        albumName: prev[eventId]?.albumName || '',
        [key]: value,
      },
    }))
  }

  const saveEventDetails = async (event: NormalizedEvent) => {
    const draft = eventDraftsById[event.id] || {
      name: event.name,
      albumName: event.albumName,
    }

    if (!draft.name.trim() || !draft.albumName.trim()) {
      setStatusMessage(t.admin.eventDetailsSaveError)
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: event.id,
          name: draft.name,
          albumName: draft.albumName,
          allowGuestShare: eventControlsById[event.id]?.allowGuestShare ?? event.allowGuestShare,
          allowGuestDownload:
            eventControlsById[event.id]?.allowGuestDownload ?? event.allowGuestDownload,
          allowAlbumDownload:
            eventControlsById[event.id]?.allowAlbumDownload ?? event.allowAlbumDownload,
          allowGuestDelete:
            eventControlsById[event.id]?.allowGuestDelete ?? event.allowGuestDelete,
          allowGuestPoster:
            eventControlsById[event.id]?.allowGuestPoster ?? event.allowGuestPoster,
        }),
      })

      const payload = (await response.json()) as {
        ok?: boolean
        event?: Record<string, unknown>
        error?: string
      }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || t.admin.eventDetailsSaveError)
      }

      const normalized = normalizeEventRecord(payload.event)

      if (normalized) {
        setEvents((prev) =>
          prev.map((item) => (item.id === event.id ? normalized : item))
        )
        setEventDraftsById((prev) => ({
          ...prev,
          [event.id]: {
            name: normalized.name,
            albumName: normalized.albumName,
          },
        }))
        setEventControlsById((prev) => ({
          ...prev,
          [event.id]: {
            allowGuestShare: normalized.allowGuestShare,
            allowGuestDownload: normalized.allowGuestDownload,
            allowAlbumDownload: normalized.allowAlbumDownload,
            allowGuestDelete: normalized.allowGuestDelete,
            allowGuestPoster: normalized.allowGuestPoster,
          },
        }))
      }

      setStatusMessage(t.admin.eventDetailsSaved)
    } catch (error) {
      console.error('Failed to save event details', error)
      setStatusMessage(
        error instanceof Error ? error.message : t.admin.eventDetailsSaveError
      )
    } finally {
      setSubmitting(false)
    }
  }

  const updateEventVisual = async (
    event: NormalizedEvent,
    file: File | null,
    kind: EventVisualKind
  ) => {
    if (!file) return

    setUpdatingEventVisual({ eventId: event.id, kind })

    try {
      const uploadedVisual = await uploadVisualForEvent(event.id, file, kind)

      setEvents((prev) =>
        prev.map((item) =>
          item.id === event.id
            ? uploadedVisual.event || {
                ...item,
                coverImageUrl: kind === 'cover' ? uploadedVisual.url : item.coverImageUrl,
                backgroundImageUrl:
                  kind === 'background' ? uploadedVisual.url : item.backgroundImageUrl,
                posterTemplateUrl:
                  kind === 'posterTemplate' ? uploadedVisual.url : item.posterTemplateUrl,
                storyTemplateUrl:
                  kind === 'storyTemplate' ? uploadedVisual.url : item.storyTemplateUrl,
              }
            : item
        )
      )
      setStatusMessage(`${eventVisualLabels[kind]} ${t.admin.visualSaved}`)
    } catch (error) {
      console.error('Failed to update event visual', error)
      setStatusMessage(error instanceof Error ? error.message : t.admin.mediaUploadError)
    } finally {
      setUpdatingEventVisual(null)
    }
  }

  const handleEventControlChange = (
    eventId: string,
    key:
      | 'allowGuestShare'
      | 'allowGuestDownload'
      | 'allowAlbumDownload'
      | 'allowGuestDelete'
      | 'allowGuestPoster',
    value: boolean
  ) => {
    setEventControlsById((prev) => ({
      ...prev,
      [eventId]: {
        allowGuestShare: prev[eventId]?.allowGuestShare ?? true,
        allowGuestDownload: prev[eventId]?.allowGuestDownload ?? true,
        allowAlbumDownload: prev[eventId]?.allowAlbumDownload ?? true,
        allowGuestDelete: prev[eventId]?.allowGuestDelete ?? false,
        allowGuestPoster: prev[eventId]?.allowGuestPoster ?? false,
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
          allowAlbumDownload: currentSettings.allowAlbumDownload,
          allowGuestDelete: currentSettings.allowGuestDelete,
          allowGuestPoster: currentSettings.allowGuestPoster,
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
            allowAlbumDownload: normalized.allowAlbumDownload,
            allowGuestDelete: normalized.allowGuestDelete,
            allowGuestPoster: normalized.allowGuestPoster,
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

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
        <section className="grid gap-5 lg:grid-cols-[0.62fr_1.38fr]">
          <div className="rounded-[1.8rem] border border-[#D4DFEE] bg-white/85 p-5 shadow-[0_18px_54px_rgba(15,61,102,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6A84A3]">
                  {t.admin.recentAlbums}
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#0B2742]">
                  {events.length} album
                </h1>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(adminUrl, t.admin.uploadCopied)}
                className="rounded-full border border-[#C8D3E5] bg-white px-3 py-2 text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
              >
                Admin link
              </button>
            </div>

            {!authenticated ? (
              <p className="mt-5 rounded-[1.2rem] bg-[#F7FAFD] p-4 text-sm text-[#597594]">
                {t.admin.unlockToManage}
              </p>
            ) : events.length === 0 ? (
              <p className="mt-5 rounded-[1.2rem] bg-[#F7FAFD] p-4 text-sm text-[#597594]">
                {t.admin.noEvents}
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {events.slice(0, 8).map((event, index) => (
                  <details
                    key={event.id}
                    open={index === 0}
                    className="rounded-[1.2rem] border border-[#D4DFEE] bg-[#F7FAFD] p-3"
                  >
                    <summary className="cursor-pointer text-sm font-semibold text-[#0B2742]">
                      {formatEventLabel(event)}
                    </summary>

                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-[#6A84A3]">
                        {guestAccessByEvent[event.id]?.length || 0} e-mail
                      </p>

                      <div className="grid gap-2">
                        <Link
                          href={getPublicJoinPath(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-full bg-[#F58220] px-3 py-2 text-xs font-semibold text-white hover:bg-[#DB6E12]"
                        >
                          {t.common.guestEntryPage}
                        </Link>
                        <Link
                          href={getPublicGalleryPath(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-3 py-2 text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                        >
                          {t.common.gallery}
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(getEventShareUrl(event), t.admin.uploadCopied)
                          }
                          className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-3 py-2 text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                        >
                          {t.common.copyUploadLink}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              getGalleryShareUrl(event),
                              t.admin.galleryCopied
                            )
                          }
                          className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-3 py-2 text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                        >
                          {t.common.copyGalleryLink}
                        </button>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[1.8rem] border border-[#D4DFEE] bg-[#0F3D66] p-5 text-white shadow-[0_22px_60px_rgba(15,61,102,0.18)] md:p-6">
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

                {statusMessage ? (
                  <div className="rounded-[1.2rem] border border-white/12 bg-white/8 px-4 py-3 text-sm leading-6 text-[#EAF3FB]">
                    {statusMessage}
                  </div>
                ) : null}

                <details className="rounded-[1.2rem] border border-white/12 bg-white/8 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-[#EAF3FB]">
                    {t.admin.passwordSection}
                  </summary>
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
                </details>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                      {t.admin.eventName}
                    </label>
                    <input
                      value={eventName}
                      onChange={(event) => setEventName(event.target.value)}
                      placeholder="Voorjaarsbruiloft aan de gracht"
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
                      placeholder="Album voor de avond"
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
                        placeholder="LENTE26"
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

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
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
                        <span className="text-sm text-[#EAF3FB]">{t.admin.albumDownloadEnabled}</span>
                        <button
                          type="button"
                          onClick={() => setAllowAlbumDownload((current) => !current)}
                          className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold ${
                            allowAlbumDownload ? 'bg-[#F58220] text-white' : 'bg-white text-[#0F3D66]'
                          }`}
                        >
                          {allowAlbumDownload ? t.admin.toggleOn : t.admin.toggleOff}
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

                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                        <span className="text-sm text-[#EAF3FB]">{t.admin.posterEnabled}</span>
                        <button
                          type="button"
                          onClick={() => setAllowGuestPoster((current) => !current)}
                          className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold ${
                            allowGuestPoster ? 'bg-[#F58220] text-white' : 'bg-white text-[#0F3D66]'
                          }`}
                        >
                          {allowGuestPoster ? t.admin.toggleOn : t.admin.toggleOff}
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

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                      {t.admin.posterTemplateImage}
                    </label>
                    <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/8 px-4 py-3 text-sm font-semibold text-white hover:bg-white/12">
                      {uploadingVisual === 'posterTemplate'
                        ? t.admin.mediaUploading
                        : posterTemplateFile?.name || t.admin.uploadPosterTemplate}
                      <input
                        type="file"
                        accept="image/png,image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null
                          setPosterTemplateFile(file)
                          setPosterTemplateUrl(file ? URL.createObjectURL(file) : '')
                        }}
                        className="sr-only"
                      />
                    </label>
                    {posterTemplateUrl ? (
                      <div
                        className="mt-3 h-36 rounded-2xl border border-white/10 bg-black bg-contain bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${posterTemplateUrl})` }}
                      />
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                      {t.admin.storyTemplateImage}
                    </label>
                    <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/8 px-4 py-3 text-sm font-semibold text-white hover:bg-white/12">
                      {uploadingVisual === 'storyTemplate'
                        ? t.admin.mediaUploading
                        : storyTemplateFile?.name || t.admin.uploadStoryTemplate}
                      <input
                        type="file"
                        accept="image/png,image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null
                          setStoryTemplateFile(file)
                          setStoryTemplateUrl(file ? URL.createObjectURL(file) : '')
                        }}
                        className="sr-only"
                      />
                    </label>
                    {storyTemplateUrl ? (
                      <div
                        className="mt-3 h-44 rounded-2xl border border-white/10 bg-black bg-contain bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${storyTemplateUrl})` }}
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
                {t.admin.eventDetails}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0B2742]">
                {t.admin.eventDetails}
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
              {events.map((event, index) => (
                <details
                  key={event.id}
                  open={index === 0}
                  className="rounded-[1.8rem] border border-[#D4DFEE] bg-[#F8FBFE] p-5"
                >
                  <summary className="cursor-pointer text-lg font-semibold text-[#0B2742]">
                    {formatEventLabel(event)}
                  </summary>
                  <p className="mt-2 break-all text-sm text-[#6A84A3]">
                    {t.common.eventId}: {event.id}
                  </p>
                  {event.slug ? (
                    <p className="mt-1 break-all text-sm text-[#6A84A3]">
                      Openbare slug: {event.slug}
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
                      {t.admin.eventDetails}
                    </p>

                    <div className="mt-3 grid gap-3">
                      <label className="block text-sm font-semibold text-[#33516F]">
                        {t.admin.eventName}
                        <input
                          value={eventDraftsById[event.id]?.name ?? event.name}
                          onChange={(inputEvent) =>
                            handleEventDraftChange(
                              event.id,
                              'name',
                              inputEvent.target.value
                            )
                          }
                          className="mt-2 w-full rounded-2xl border border-[#D4DFEE] bg-[#F8FBFE] px-4 py-3 text-sm font-medium text-[#0B2742] outline-none focus:border-[#0F3D66]"
                        />
                      </label>

                      <label className="block text-sm font-semibold text-[#33516F]">
                        {t.admin.albumName}
                        <input
                          value={eventDraftsById[event.id]?.albumName ?? event.albumName}
                          onChange={(inputEvent) =>
                            handleEventDraftChange(
                              event.id,
                              'albumName',
                              inputEvent.target.value
                            )
                          }
                          className="mt-2 w-full rounded-2xl border border-[#D4DFEE] bg-[#F8FBFE] px-4 py-3 text-sm font-medium text-[#0B2742] outline-none focus:border-[#0F3D66]"
                        />
                      </label>
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#D4DFEE] bg-[#F8FBFE] p-4">
                      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                          {t.admin.visualsSection}
                        </p>
                        <p className="text-xs font-semibold text-[#597594]">
                          {t.admin.visualsHelp}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex cursor-pointer items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]">
                        {updatingEventVisual?.eventId === event.id &&
                        updatingEventVisual.kind === 'cover'
                          ? t.admin.mediaUploading
                          : t.admin.updateCover}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(inputEvent) => {
                            const file = inputEvent.target.files?.[0] || null
                            void updateEventVisual(event, file, 'cover')
                            inputEvent.target.value = ''
                          }}
                          className="sr-only"
                        />
                      </label>

                      <label className="flex cursor-pointer items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]">
                        {updatingEventVisual?.eventId === event.id &&
                        updatingEventVisual.kind === 'background'
                          ? t.admin.mediaUploading
                          : t.admin.updateBackground}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(inputEvent) => {
                            const file = inputEvent.target.files?.[0] || null
                            void updateEventVisual(event, file, 'background')
                            inputEvent.target.value = ''
                          }}
                          className="sr-only"
                        />
                      </label>

                      <label className="flex cursor-pointer items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]">
                        {updatingEventVisual?.eventId === event.id &&
                        updatingEventVisual.kind === 'posterTemplate'
                          ? t.admin.mediaUploading
                          : t.admin.updatePosterTemplate}
                        <input
                          type="file"
                          accept="image/png,image/*"
                          onChange={(inputEvent) => {
                            const file = inputEvent.target.files?.[0] || null
                            void updateEventVisual(event, file, 'posterTemplate')
                            inputEvent.target.value = ''
                          }}
                          className="sr-only"
                        />
                      </label>

                      <label className="flex cursor-pointer items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]">
                        {updatingEventVisual?.eventId === event.id &&
                        updatingEventVisual.kind === 'storyTemplate'
                          ? t.admin.mediaUploading
                          : t.admin.updateStoryTemplate}
                        <input
                          type="file"
                          accept="image/png,image/*"
                          onChange={(inputEvent) => {
                            const file = inputEvent.target.files?.[0] || null
                            void updateEventVisual(event, file, 'storyTemplate')
                            inputEvent.target.value = ''
                          }}
                          className="sr-only"
                        />
                      </label>
                      </div>

                      <div className="mt-3 grid gap-2 text-xs font-semibold text-[#33516F] sm:grid-cols-2">
                        {([
                          [t.admin.coverImage, event.coverImageUrl],
                          [t.admin.backgroundImage, event.backgroundImageUrl],
                          [t.admin.posterTemplateImage, event.posterTemplateUrl],
                          [t.admin.storyTemplateImage, event.storyTemplateUrl],
                        ] as const).map(([label, value]) => (
                          <div
                            key={label}
                            className={`rounded-xl px-3 py-2 ${
                              value
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {label}: {value ? t.admin.visualReady : t.admin.visualMissing}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => saveEventDetails(event)}
                      disabled={submitting}
                      className={`mt-4 rounded-full px-4 py-2 text-sm font-semibold ${
                        submitting
                          ? 'cursor-not-allowed bg-stone-300 text-stone-500'
                          : 'bg-[#0F3D66] text-white hover:bg-[#0B2F4F]'
                      }`}
                    >
                      {submitting ? t.admin.saving : t.admin.saveEventDetails}
                    </button>
                  </div>

                  <div className="mt-4 rounded-[1.5rem] border border-[#D4DFEE] bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                      {t.admin.publicTools}
                    </p>

                    <div className="mt-3 grid gap-3">
                      {([
                        ['allowGuestShare', t.admin.shareEnabled],
                        ['allowGuestDownload', t.admin.downloadEnabled],
                        ['allowAlbumDownload', t.admin.albumDownloadEnabled],
                        ['allowGuestDelete', t.admin.deleteEnabled],
                        ['allowGuestPoster', t.admin.posterEnabled],
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

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.2rem] border border-[#D4DFEE] bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                        Misafir linki
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={getPublicJoinPath(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-full bg-[#F58220] px-4 py-2 text-sm font-semibold text-white hover:bg-[#DB6E12]"
                        >
                          Ac
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(getEventShareUrl(event), t.admin.uploadCopied)
                          }
                          className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                        >
                          Kopyala
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[1.2rem] border border-[#D4DFEE] bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                        Galeri
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={getPublicGalleryPath(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-full bg-[#0F3D66] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B2F4F]"
                        >
                          Ac
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              getGalleryShareUrl(event),
                              t.admin.galleryCopied
                            )
                          }
                          className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                        >
                          Kopyala
                        </button>
                      </div>
                    </div>

                    {event.accessCode ? (
                      <div className="rounded-[1.2rem] border border-[#D4DFEE] bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                          Event code
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#F8FBFE] px-4 py-2 text-sm font-semibold tracking-[0.16em] text-[#0F3D66]">
                            {event.accessCode}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(event.accessCode, t.admin.codeCopied)
                            }
                            className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                          >
                            Kopyala
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div className="rounded-[1.2rem] border border-[#F1B6B6] bg-[#FFF7F7] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B52E2E]">
                        Tehlikeli islem
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={submitting}
                        className="mt-3 inline-flex items-center justify-center rounded-full border border-[#F1B6B6] bg-[#FFF1F1] px-4 py-2 text-sm font-semibold text-[#B52E2E] hover:bg-[#FFE3E3] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {t.common.deleteEvent}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[1.2rem] border border-[#D4DFEE] bg-white p-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                        Misafir notlari
                      </p>
                      <p className="text-sm font-semibold text-[#0B2742]">
                        {guestMessagesByEvent[event.id]?.length || 0} not
                      </p>
                    </div>

                    {guestMessagesByEvent[event.id]?.length ? (
                      <div className="mt-3 space-y-2">
                        {guestMessagesByEvent[event.id].map((entry, messageIndex) => (
                          <div
                            key={`${event.id}-message-${messageIndex}`}
                            className="rounded-2xl bg-[#F7FAFD] px-3 py-2 text-sm text-[#33516F]"
                          >
                            <p className="break-words font-medium text-[#0B2742]">
                              {entry.message}
                            </p>
                            <p className="mt-1 text-xs text-[#6A84A3]">
                              {entry.file_name || 'Foto'} · {entry.created_at ? new Date(entry.created_at).toLocaleString() : t.admin.guestEmailTimeUnknown}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-[#6A84A3]">
                        Bu album icin henuz misafir notu yok.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 rounded-[1.2rem] border border-[#D4DFEE] bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                          {t.admin.guestEmails}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#0B2742]">
                          {t.admin.guestEmailSummary.replace(
                            '{count}',
                            String(guestAccessByEvent[event.id]?.length || 0)
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyGuestEmails(event.id)}
                        disabled={!guestAccessByEvent[event.id]?.length}
                        className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {t.admin.copyGuestEmails}
                      </button>
                    </div>

                    {guestAccessByEvent[event.id]?.length ? (
                      <details className="mt-3 rounded-2xl bg-[#F7FAFD] px-3 py-2">
                        <summary className="cursor-pointer text-sm font-semibold text-[#0F3D66]">
                          {t.admin.showGuestEmails}
                        </summary>
                        <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
                          {guestAccessByEvent[event.id].map((entry) => (
                            <div
                              key={`${event.id}-${entry.email}`}
                              className="flex flex-col gap-1 rounded-xl bg-white px-3 py-2 text-sm text-[#33516F]"
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
                      </details>
                    ) : (
                      <p className="mt-3 text-sm text-[#597594]">
                        {t.admin.noGuestEmails}
                      </p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
