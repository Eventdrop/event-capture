'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { useLanguage } from '@/app/_components/language-provider'
import { localeLabels, locales, type Locale } from '@/lib/i18n'
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
import {
  getGuestbookPdfThemeConfig,
  guestbookPdfThemeConfigs,
  guestbookPdfThemeKeys,
  guestbookPdfThemeLabels,
  normalizeGuestbookPdfTheme,
  type GuestbookPdfThemeKey,
} from '@/lib/guestbook-pdf-theme'
import { formatGuestbookDate } from '@/lib/guestbook'

function formatEventLabel(event: NormalizedEvent) {
  return formatEventDisplayName(event)
}

type EventVisualKind =
  | 'cover'
  | 'guestbookCover'
  | 'background'
  | 'posterTemplate'
  | 'storyTemplate'
  | 'photostripBackground'

type GuestAccessEntry = {
  email: string
  created_at: string | null
}

type GuestMessageEntry = {
  guest_name?: string | null
  id?: string | null
  message: string
  file_name: string | null
  related_upload_id?: string | null
  created_at: string | null
  source?: 'guestbook' | 'upload'
}

type DownloadStatsEntry = {
  downloads: number
  files: number
  posters: number
  stories: number
  lastEmail: string | null
  lastDownloadedAt: string | null
}

type GuestbookMessageApiEntry = {
  createdAt?: string | null
  guestName?: string | null
  id?: string | null
  message?: string | null
  relatedUploadId?: string | null
}

type AdminEventSection = 'events' | 'templates'

type EventControls = {
  allowGuestShare: boolean
  allowGuestDownload: boolean
  allowAlbumDownload: boolean
  allowGuestDelete: boolean
  allowGuestPoster: boolean
  guestbookEnabled: boolean
  photostripEnabled: boolean
  guestbookPdfTheme: GuestbookPdfThemeKey
}

function AdminSettingsSection({
  children,
  defaultOpen = false,
  title,
  toggleLabel,
}: {
  children: ReactNode
  defaultOpen?: boolean
  title: string
  toggleLabel: string
}) {
  return (
    <details
      open={defaultOpen}
      className="rounded-[1.35rem] border border-[#D4DFEE] bg-white"
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-[#0B2742] [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          {title}
          <span className="text-xs font-semibold text-[#6A84A3]">{toggleLabel}</span>
        </span>
      </summary>
      <div className="border-t border-[#E4ECF5] px-4 py-4">{children}</div>
    </details>
  )
}

export default function AdminPage() {
  const { t, locale } = useLanguage()
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
  const [downloadStatsByEvent, setDownloadStatsByEvent] = useState<
    Record<string, DownloadStatsEntry>
  >({})
  const [adminSection, setAdminSection] = useState<AdminEventSection>('events')
  const [selectedAlbumId, setSelectedAlbumId] = useState('')
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [defaultLocale, setDefaultLocale] = useState<Locale>('nl')
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
    Record<string, { albumName: string; eventDate: string; name: string }>
  >({})
  const [guestMessageDraftsById, setGuestMessageDraftsById] = useState<
    Record<string, { guestName: string; message: string }>
  >({})
  const [editingGuestMessageId, setEditingGuestMessageId] = useState('')
  const [updatingGuestMessageId, setUpdatingGuestMessageId] = useState('')
  const [refreshingGuestbookEventId, setRefreshingGuestbookEventId] = useState('')
  const [eventControlsById, setEventControlsById] = useState<
    Record<string, EventControls>
  >({})
  const [demoCloneSource, setDemoCloneSource] = useState<NormalizedEvent | null>(null)
  const [demoCustomerName, setDemoCustomerName] = useState('')
  const [createdDemoEvent, setCreatedDemoEvent] = useState<NormalizedEvent | null>(null)

  const publicBaseUrl = getPublicAppUrl()
  const adminUrl = getPublicPath('/control-room-7x')
  const eventVisualLabels: Record<EventVisualKind, string> = {
    cover: t.admin.coverImage,
    guestbookCover: t.admin.guestbookCoverPhoto,
    background: t.admin.backgroundImage,
    posterTemplate: t.admin.posterTemplateImage,
    storyTemplate: t.admin.storyTemplateImage,
    photostripBackground: t.admin.photostripBackground,
  }

  const customerEvents = useMemo(
    () => events.filter((event) => !event.isDemoTemplate),
    [events]
  )
  const demoTemplateEvents = useMemo(
    () => events.filter((event) => event.isDemoTemplate),
    [events]
  )
  const visibleEvents = adminSection === 'templates' ? demoTemplateEvents : customerEvents
  const selectedVisibleEvent =
    visibleEvents.find((event) => event.id === selectedAlbumId) || visibleEvents[0] || null
  const latestEvent = useMemo(() => customerEvents[0] || null, [customerEvents])
  const creatingDemoTemplate = adminSection === 'templates'

  const getEventIdentifier = (event: NormalizedEvent) => event.id
  const getEventShareUrl = (event: NormalizedEvent) =>
    `${publicBaseUrl}${getEventRoute(getEventIdentifier(event))}`
  const getGalleryShareUrl = (event: NormalizedEvent) =>
    `${publicBaseUrl}${getEventGalleryRoute(getEventIdentifier(event))}`
  const getPublicJoinPath = (event: NormalizedEvent) =>
    getPublicPath(getEventRoute(getEventIdentifier(event)))
  const getPublicGalleryPath = (event: NormalizedEvent) =>
    getPublicPath(getEventGalleryRoute(getEventIdentifier(event)))

  const getSelectedGuestbookPdfTheme = (event: NormalizedEvent) =>
    eventControlsById[event.id]?.guestbookPdfTheme ?? event.guestbookPdfTheme

  const refreshSelectedGuestbookMessages = useCallback(async (eventId: string) => {
    if (!eventId) return

    setRefreshingGuestbookEventId(eventId)

    try {
      const response = await fetch(
        `/api/guestbook-messages?event=${encodeURIComponent(eventId)}`,
        { cache: 'no-store' }
      )
      const payload = (await response.json()) as {
        error?: string
        messages?: GuestbookMessageApiEntry[]
        ok?: boolean
      }

      if (!response.ok || payload.ok !== true) {
        throw new Error(payload.error || t.admin.loadError)
      }

      const refreshedMessages = (payload.messages || [])
        .map<GuestMessageEntry>((message) => ({
          created_at: message.createdAt || null,
          file_name: null,
          guest_name: message.guestName || null,
          id: message.id || null,
          message: message.message || '',
          related_upload_id: message.relatedUploadId || null,
          source: 'guestbook',
        }))
        .filter((message) => message.message)

      setGuestMessagesByEvent((prev) => {
        const uploadMessages = (prev[eventId] || []).filter(
          (message) => message.source === 'upload'
        )
        const nextMessages = [...refreshedMessages, ...uploadMessages].sort((left, right) => {
          const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0
          const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0

          return rightTime - leftTime
        })

        return {
          ...prev,
          [eventId]: nextMessages,
        }
      })
    } catch (error) {
      console.error('Failed to refresh guestbook messages', error)
      setStatusMessage(error instanceof Error ? error.message : t.admin.loadError)
    } finally {
      setRefreshingGuestbookEventId('')
    }
  }, [t.admin.loadError])

  useEffect(() => {
    setStatusMessage(t.admin.loginPrompt)
  }, [t.admin.loginPrompt])

  useEffect(() => {
    if (!authenticated || !selectedVisibleEvent?.id) return

    void refreshSelectedGuestbookMessages(selectedVisibleEvent.id)
  }, [authenticated, refreshSelectedGuestbookMessages, selectedVisibleEvent?.id])

  const loadEvents = useCallback(async () => {
    const response = await fetch('/api/admin/events', {
      cache: 'no-store',
    })

    const payload = (await response.json()) as {
      ok?: boolean
      events?: Record<string, unknown>[]
      guestAccessByEvent?: Record<string, GuestAccessEntry[]>
      guestMessagesByEvent?: Record<string, GuestMessageEntry[]>
      downloadStatsByEvent?: Record<string, DownloadStatsEntry>
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
    setDownloadStatsByEvent(payload.downloadStatsByEvent || {})
    setEventDraftsById(
      normalized.reduce<Record<string, { albumName: string; eventDate: string; name: string }>>(
        (accumulator, event) => {
          accumulator[event.id] = {
            albumName: event.albumName,
            eventDate: event.eventDate || '',
            name: event.name,
          }

          return accumulator
        },
        {}
      )
    )
    setEventControlsById(
      normalized.reduce<Record<string, EventControls>>((accumulator, event) => {
        accumulator[event.id] = {
          allowGuestShare: event.allowGuestShare,
          allowGuestDownload: event.allowGuestDownload,
          allowAlbumDownload: event.allowAlbumDownload,
          allowGuestDelete: event.allowGuestDelete,
          allowGuestPoster: event.allowGuestPoster,
          guestbookEnabled: event.guestbookEnabled,
          photostripEnabled: event.photostripEnabled,
          guestbookPdfTheme: event.guestbookPdfTheme,
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
    setGuestMessageDraftsById({})
    setEditingGuestMessageId('')
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
    if (!eventName.trim()) {
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
        albumName: eventName,
        eventDate: creatingDemoTemplate ? '' : eventDate,
        defaultLocale,
        accessCode,
        accessCodeEnabled,
        isDemoTemplate: creatingDemoTemplate,
        coverImageUrl: persistedCoverImageUrl,
        backgroundImageUrl: persistedBackgroundImageUrl,
        posterTemplateUrl: persistedPosterTemplateUrl,
        storyTemplateUrl: persistedStoryTemplateUrl,
        allowGuestShare,
        allowGuestDownload,
        allowAlbumDownload,
        allowGuestDelete,
        allowGuestPoster,
        guestbookEnabled: true,
        photostripEnabled: false,
        guestbookPdfTheme: 'wedding',
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
          defaultLocale: payload.default_locale,
          accessCode: payload.access_code,
          accessCodeEnabled,
          isDemoTemplate: creatingDemoTemplate,
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
          guestbookEnabled: payload.guestbook_enabled,
          photostripEnabled: payload.photostrip_enabled,
          guestbookPdfTheme: payload.guestbook_pdf_theme,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        event?: Record<string, unknown>
        error?: string
      }

      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || t.admin.createError)
      }

      const normalized = normalizeEventRecord(result.event)

      if (!normalized) {
        throw new Error(result.error || t.admin.createError)
      }

      if (creatingDemoTemplate && !normalized.isDemoTemplate) {
        throw new Error(t.admin.createError)
      }

      let mediaUploadError = ''

      let nextEvent = normalized
      const updateCreatedEvent = () => {
        setEvents((prev) => [nextEvent, ...prev.filter((item) => item.id !== nextEvent.id)])
        setEventDraftsById((prev) => ({
          ...prev,
          [nextEvent.id]: {
            albumName: nextEvent.albumName,
            eventDate: nextEvent.eventDate || '',
            name: nextEvent.name,
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
            guestbookEnabled: nextEvent.guestbookEnabled,
            photostripEnabled: nextEvent.photostripEnabled,
            guestbookPdfTheme: nextEvent.guestbookPdfTheme,
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
          nextEvent =
            uploadedCover.event && (!creatingDemoTemplate || uploadedCover.event.isDemoTemplate)
              ? uploadedCover.event
              : { ...nextEvent, coverImageUrl: uploadedCover.url }
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
          nextEvent =
            uploadedBackground.event &&
            (!creatingDemoTemplate || uploadedBackground.event.isDemoTemplate)
              ? uploadedBackground.event
              : {
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
          nextEvent =
            uploadedPosterTemplate.event &&
            (!creatingDemoTemplate || uploadedPosterTemplate.event.isDemoTemplate)
              ? uploadedPosterTemplate.event
              : {
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
          nextEvent =
            uploadedStoryTemplate.event &&
            (!creatingDemoTemplate || uploadedStoryTemplate.event.isDemoTemplate)
              ? uploadedStoryTemplate.event
              : {
                  ...nextEvent,
                  storyTemplateUrl: uploadedStoryTemplate.url,
                }
          updateCreatedEvent()
        } catch (error) {
          rememberMediaError(error)
        }
      }

      setEventName('')
      setEventDate('')
      setDefaultLocale('nl')
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

  const openDemoCloneModal = (event: NormalizedEvent) => {
    setDemoCloneSource(event)
    setDemoCustomerName('')
    setCreatedDemoEvent(null)
    setStatusMessage(t.admin.demoCloneIntro)
  }

  const closeDemoCloneModal = () => {
    setDemoCloneSource(null)
    setDemoCustomerName('')
    setCreatedDemoEvent(null)
  }

  const generateDemoAccessCode = () => {
    const existingCodes = new Set(
      events
        .map((event) => event.accessCode)
        .filter((code): code is string => Boolean(code))
    )

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const code = generateEventAccessCode()

      if (!existingCodes.has(code)) return code
    }

    return generateEventAccessCode(8)
  }

  const createDemoClone = async () => {
    if (!demoCloneSource) return

    const customerName = demoCustomerName.trim()

    if (!customerName) {
      setStatusMessage(t.admin.demoNameRequired)
      return
    }

    setSubmitting(true)

    try {
      const demoName = `Demo - ${customerName}`
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: demoName,
          albumName: demoName,
          eventDate: '',
          defaultLocale: demoCloneSource.defaultLocale,
          accessCode: demoCloneSource.accessCode ? generateDemoAccessCode() : '',
          accessCodeEnabled: Boolean(demoCloneSource.accessCode),
          isDemoTemplate: false,
          coverImageUrl: demoCloneSource.coverImageUrl,
          backgroundImageUrl: demoCloneSource.backgroundImageUrl,
          posterTemplateUrl: demoCloneSource.posterTemplateUrl,
          storyTemplateUrl: demoCloneSource.storyTemplateUrl,
          allowGuestShare: demoCloneSource.allowGuestShare,
          allowGuestDownload: demoCloneSource.allowGuestDownload,
          allowAlbumDownload: demoCloneSource.allowAlbumDownload,
          allowGuestDelete: demoCloneSource.allowGuestDelete,
          allowGuestPoster: demoCloneSource.allowGuestPoster,
          photostripEnabled: demoCloneSource.photostripEnabled,
          photostripBackgroundUrl: demoCloneSource.photostripBackgroundUrl,
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

      if (!normalized) {
        throw new Error(t.admin.createError)
      }

      setEvents((prev) => [normalized, ...prev.filter((event) => event.id !== normalized.id)])
      setEventDraftsById((prev) => ({
        ...prev,
        [normalized.id]: {
          albumName: normalized.albumName,
          eventDate: normalized.eventDate || '',
          name: normalized.name,
        },
      }))
      setEventControlsById((prev) => ({
        ...prev,
        [normalized.id]: {
          allowGuestShare: normalized.allowGuestShare,
          allowGuestDownload: normalized.allowGuestDownload,
          allowAlbumDownload: normalized.allowAlbumDownload,
          allowGuestDelete: normalized.allowGuestDelete,
          allowGuestPoster: normalized.allowGuestPoster,
          guestbookEnabled: normalized.guestbookEnabled,
          photostripEnabled: normalized.photostripEnabled,
          guestbookPdfTheme: normalized.guestbookPdfTheme,
        },
      }))
      setGuestAccessByEvent((prev) => ({ ...prev, [normalized.id]: [] }))
      setGuestMessagesByEvent((prev) => ({ ...prev, [normalized.id]: [] }))
      setDownloadStatsByEvent((prev) => {
        const next = { ...prev }
        delete next[normalized.id]
        return next
      })
      setCreatedDemoEvent(normalized)
      setStatusMessage(t.admin.demoCreated)
    } catch (error) {
      console.error('Demo clone failed', error)
      setStatusMessage(error instanceof Error ? error.message : t.admin.createError)
    } finally {
      setSubmitting(false)
    }
  }

  const getQrSvg = (eventId: string) =>
    document.querySelector<SVGSVGElement>(`[data-event-qr="${eventId}"] svg`)

  const getQrFileName = (event: NormalizedEvent, extension: 'png' | 'svg') => {
    const safeName = formatEventLabel(event)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)

    return `${safeName || 'event'}-qr.${extension}`
  }

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const downloadQrSvg = (event: NormalizedEvent) => {
    const svg = getQrSvg(event.id)
    if (!svg) return

    const copy = svg.cloneNode(true) as SVGSVGElement
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    const source = new XMLSerializer().serializeToString(copy)
    downloadBlob(
      new Blob([source], { type: 'image/svg+xml;charset=utf-8' }),
      getQrFileName(event, 'svg')
    )
  }

  const downloadQrPng = (event: NormalizedEvent) => {
    const svg = getQrSvg(event.id)
    if (!svg) return

    const copy = svg.cloneNode(true) as SVGSVGElement
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    copy.setAttribute('width', '1024')
    copy.setAttribute('height', '1024')
    const source = new XMLSerializer().serializeToString(copy)
    const sourceUrl = URL.createObjectURL(
      new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    )
    const image = new Image()

    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1024
      canvas.height = 1024
      const context = canvas.getContext('2d')
      if (!context) {
        URL.revokeObjectURL(sourceUrl)
        return
      }
      context.fillStyle = '#FFFFFF'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(sourceUrl)
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, getQrFileName(event, 'png'))
      }, 'image/png')
    }

    image.onerror = () => URL.revokeObjectURL(sourceUrl)
    image.src = sourceUrl
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

        if (!response.ok || payload.ok !== true || !payload.url) {
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

  const handleEventDraftChange = (eventId: string, value: string) => {
    setEventDraftsById((prev) => ({
      ...prev,
      [eventId]: {
        albumName: value,
        eventDate: prev[eventId]?.eventDate || '',
        name: value,
      },
    }))
  }

  const handleEventDateDraftChange = (eventId: string, value: string) => {
    setEventDraftsById((prev) => ({
      ...prev,
      [eventId]: {
        albumName: prev[eventId]?.albumName || '',
        eventDate: value,
        name: prev[eventId]?.name || '',
      },
    }))
  }

  const startEditingGuestMessage = (entry: GuestMessageEntry) => {
    if (!entry.id) return

    setEditingGuestMessageId(entry.id)
    setGuestMessageDraftsById((prev) => ({
      ...prev,
      [entry.id as string]: {
        guestName: entry.guest_name || '',
        message: entry.message,
      },
    }))
  }

  const cancelEditingGuestMessage = () => {
    setEditingGuestMessageId('')
  }

  const saveGuestMessage = async (eventId: string, entry: GuestMessageEntry) => {
    if (!entry.id) return

    const draft = guestMessageDraftsById[entry.id] || {
      guestName: entry.guest_name || '',
      message: entry.message,
    }

    setUpdatingGuestMessageId(entry.id)

    try {
      const response = await fetch('/api/guestbook-messages', {
        body: JSON.stringify({
          id: entry.id,
          guestName: draft.guestName,
          message: draft.message,
          source: entry.source,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      })

      const payload = (await response.json()) as {
        error?: string
        message?: {
          createdAt?: string | null
          guestName?: string | null
          id?: string | null
          message?: string | null
          relatedUploadId?: string | null
        }
        ok?: boolean
      }

      if (!response.ok || payload.ok !== true || !payload.message) {
        throw new Error(payload.error || t.admin.guestbookMessageSaveError)
      }

      setGuestMessagesByEvent((prev) => ({
        ...prev,
        [eventId]: (prev[eventId] || []).map((item) =>
          item.id === entry.id
            ? {
                ...item,
                created_at: payload.message?.createdAt || item.created_at,
                guest_name: payload.message?.guestName || null,
                message: payload.message?.message || '',
                related_upload_id:
                  payload.message?.relatedUploadId || item.related_upload_id,
              }
            : item
        ),
      }))
      setEditingGuestMessageId('')
      setStatusMessage(t.admin.guestbookMessageSaved)
    } catch (error) {
      console.error('Failed to update guestbook message', error)
      setStatusMessage(
        error instanceof Error ? error.message : t.admin.guestbookMessageSaveError
      )
    } finally {
      setUpdatingGuestMessageId('')
    }
  }

  const deleteGuestMessage = async (eventId: string, entry: GuestMessageEntry) => {
    if (!entry.id) return
    if (!window.confirm(t.admin.guestbookMessageDeleteConfirm)) return

    setUpdatingGuestMessageId(entry.id)

    try {
      const response = await fetch('/api/guestbook-messages', {
        body: JSON.stringify({
          id: entry.id,
          source: entry.source,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
      })

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; ok?: boolean }
        | null

      if (!response.ok || payload?.ok !== true) {
        throw new Error(payload?.error || t.admin.guestbookMessageDeleteError)
      }

      setGuestMessagesByEvent((prev) => ({
        ...prev,
        [eventId]: (prev[eventId] || []).filter((item) => item.id !== entry.id),
      }))
      setEditingGuestMessageId((current) => (current === entry.id ? '' : current))
      setStatusMessage(t.admin.guestbookMessageDeleted)
    } catch (error) {
      console.error('Failed to delete guestbook message', error)
      setStatusMessage(
        error instanceof Error ? error.message : t.admin.guestbookMessageDeleteError
      )
    } finally {
      setUpdatingGuestMessageId('')
    }
  }

  const handleGuestMessageDraftChange = (
    entryId: string,
    field: 'guestName' | 'message',
    value: string
  ) => {
    setGuestMessageDraftsById((prev) => ({
      ...prev,
      [entryId]: {
        guestName: prev[entryId]?.guestName || '',
        message: prev[entryId]?.message || '',
        [field]: field === 'message' ? value.slice(0, 500) : value,
      },
    }))
  }

  const getGuestMessageDraft = (entry: GuestMessageEntry) => {
    if (!entry.id) {
      return {
        guestName: entry.guest_name || '',
        message: entry.message,
      }
    }

    return (
      guestMessageDraftsById[entry.id] || {
        guestName: entry.guest_name || '',
        message: entry.message,
      }
    )
  }

  const saveEventDetails = async (event: NormalizedEvent) => {
    const draft = eventDraftsById[event.id] || {
      albumName: event.albumName,
      eventDate: event.eventDate || '',
      name: event.name,
    }

    if (!draft.name.trim()) {
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
          albumName: draft.name,
          eventDate: draft.eventDate,
          allowGuestShare: eventControlsById[event.id]?.allowGuestShare ?? event.allowGuestShare,
          allowGuestDownload:
            eventControlsById[event.id]?.allowGuestDownload ?? event.allowGuestDownload,
          allowAlbumDownload:
            eventControlsById[event.id]?.allowAlbumDownload ?? event.allowAlbumDownload,
          allowGuestDelete:
            eventControlsById[event.id]?.allowGuestDelete ?? event.allowGuestDelete,
          allowGuestPoster:
            eventControlsById[event.id]?.allowGuestPoster ?? event.allowGuestPoster,
          guestbookEnabled:
            eventControlsById[event.id]?.guestbookEnabled ?? event.guestbookEnabled,
          photostripEnabled:
            eventControlsById[event.id]?.photostripEnabled ?? event.photostripEnabled,
          guestbookPdfTheme:
            eventControlsById[event.id]?.guestbookPdfTheme ?? event.guestbookPdfTheme,
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
            albumName: normalized.albumName,
            eventDate: normalized.eventDate || '',
            name: normalized.name,
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
          guestbookEnabled: normalized.guestbookEnabled,
          photostripEnabled: normalized.photostripEnabled,
          guestbookPdfTheme: normalized.guestbookPdfTheme,
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
                guestbookCoverImageUrl:
                  kind === 'guestbookCover'
                    ? uploadedVisual.url
                    : item.guestbookCoverImageUrl,
                backgroundImageUrl:
                  kind === 'background' ? uploadedVisual.url : item.backgroundImageUrl,
                posterTemplateUrl:
                  kind === 'posterTemplate' ? uploadedVisual.url : item.posterTemplateUrl,
                storyTemplateUrl:
                  kind === 'storyTemplate' ? uploadedVisual.url : item.storyTemplateUrl,
                photostripBackgroundUrl:
                  kind === 'photostripBackground'
                    ? uploadedVisual.url
                    : item.photostripBackgroundUrl,
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

  const removeEventVisual = async (event: NormalizedEvent, kind: EventVisualKind) => {
    setUpdatingEventVisual({ eventId: event.id, kind })

    try {
      const response = await fetch('/api/admin/event-media', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          kind,
        }),
      })

      const payload = (await response.json()) as {
        ok?: boolean
        event?: Record<string, unknown>
        error?: string
      }

      if (!response.ok || payload.ok !== true) {
        throw new Error(payload.error || t.admin.mediaUploadError)
      }

      const normalized = normalizeEventRecord(payload.event)
      setEvents((prev) =>
        prev.map((item) =>
          item.id === event.id
            ? normalized || {
                ...item,
                guestbookCoverImageUrl:
                  kind === 'guestbookCover' ? '' : item.guestbookCoverImageUrl,
                photostripBackgroundUrl:
                  kind === 'photostripBackground' ? '' : item.photostripBackgroundUrl,
              }
            : item
        )
      )
      setStatusMessage(`${eventVisualLabels[kind]} ${t.admin.visualSaved}`)
    } catch (error) {
      console.error('Failed to remove event visual', error)
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
      | 'allowGuestPoster'
      | 'guestbookEnabled'
      | 'photostripEnabled',
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
        guestbookEnabled: prev[eventId]?.guestbookEnabled ?? true,
        photostripEnabled: prev[eventId]?.photostripEnabled ?? false,
        guestbookPdfTheme: prev[eventId]?.guestbookPdfTheme ?? 'wedding',
        [key]: value,
      },
    }))
  }

  const handleEventThemeChange = (
    eventId: string,
    value: GuestbookPdfThemeKey
  ) => {
    setEventControlsById((prev) => ({
      ...prev,
      [eventId]: {
        allowGuestShare: prev[eventId]?.allowGuestShare ?? true,
        allowGuestDownload: prev[eventId]?.allowGuestDownload ?? true,
        allowAlbumDownload: prev[eventId]?.allowAlbumDownload ?? true,
        allowGuestDelete: prev[eventId]?.allowGuestDelete ?? false,
        allowGuestPoster: prev[eventId]?.allowGuestPoster ?? false,
        guestbookEnabled: prev[eventId]?.guestbookEnabled ?? true,
        photostripEnabled: prev[eventId]?.photostripEnabled ?? false,
        guestbookPdfTheme: normalizeGuestbookPdfTheme(value),
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
          guestbookEnabled: currentSettings.guestbookEnabled,
          photostripEnabled: currentSettings.photostripEnabled,
          guestbookPdfTheme: currentSettings.guestbookPdfTheme,
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
            guestbookEnabled: normalized.guestbookEnabled,
            photostripEnabled: normalized.photostripEnabled,
            guestbookPdfTheme: normalized.guestbookPdfTheme,
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
        <nav className="rounded-[1.6rem] border border-[#D4DFEE] bg-white/85 p-2 shadow-[0_14px_36px_rgba(15,61,102,0.08)]">
          <div className="grid gap-2 sm:grid-cols-2">
            {([
              ['events', t.admin.eventsTab],
              ['templates', t.admin.demoTemplatesTab],
            ] as const).map(([section, label]) => (
              <button
                key={section}
                type="button"
                onClick={() => setAdminSection(section)}
                className={`rounded-[1.1rem] px-4 py-3 text-sm font-semibold transition ${
                  adminSection === section
                    ? 'bg-[#0F3D66] text-white shadow-[0_10px_24px_rgba(15,61,102,0.18)]'
                    : 'text-[#0F3D66] hover:bg-[#EDF4FB]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        <section className="rounded-[1.8rem] border border-[#D4DFEE] bg-[#0F3D66] p-5 text-white shadow-[0_22px_60px_rgba(15,61,102,0.18)] md:p-6">
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

                <details className="rounded-[1.2rem] border border-white/12 bg-white/8 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-[#EAF3FB]">
                    + Nieuw album
                  </summary>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                      {creatingDemoTemplate ? t.admin.demoTemplateName : t.admin.eventName}
                    </label>
                    <input
                      value={eventName}
                      onChange={(event) => setEventName(event.target.value)}
                      placeholder={
                        creatingDemoTemplate
                          ? t.admin.demoTemplateNamePlaceholder
                          : 'Voorjaarsbruiloft aan de gracht'
                      }
                      className="w-full rounded-2xl border border-[#D4DFEE] bg-white px-4 py-3 text-sm text-[#0B2742] placeholder:text-[#7D95AF]"
                    />
                  </div>

                  {creatingDemoTemplate ? null : (
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
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#EAF3FB]">
                      Album varsayilan dili
                    </label>
                    <select
                      value={defaultLocale}
                      onChange={(event) => setDefaultLocale(event.target.value as Locale)}
                      className="w-full rounded-2xl border border-[#D4DFEE] bg-white px-4 py-3 text-sm text-[#0B2742]"
                    >
                      {locales.map((locale) => (
                        <option key={locale} value={locale}>
                          {localeLabels[locale]}
                        </option>
                      ))}
                    </select>
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
                  {submitting
                    ? t.admin.saving
                    : creatingDemoTemplate
                      ? t.admin.createDemoTemplateButton
                      : t.admin.createButton}
                </button>
                </details>
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
        </section>

        <section className="rounded-[1.8rem] border border-[#D4DFEE] bg-white/85 p-5 shadow-[0_18px_54px_rgba(15,61,102,0.08)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6A84A3]">
                Albümler
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#0B2742]">
                {visibleEvents.length} album
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
            <p className="mt-4 rounded-[1.2rem] bg-[#F7FAFD] p-4 text-sm text-[#597594]">
              {t.admin.unlockToManage}
            </p>
          ) : visibleEvents.length === 0 ? (
            <p className="mt-4 rounded-[1.2rem] bg-[#F7FAFD] p-4 text-sm text-[#597594]">
              {creatingDemoTemplate ? t.admin.noDemoTemplates : t.admin.noEvents}
            </p>
          ) : (
            <>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {visibleEvents.map((event) => {
                const isSelected = event.id === selectedVisibleEvent?.id

                return (
                  <button
                    key={event.id}
                    type="button"
                    title={formatEventLabel(event)}
                    onClick={() => setSelectedAlbumId(event.id)}
                    className={`w-44 shrink-0 truncate rounded-full border px-4 py-2 text-left text-xs font-semibold ${
                      isSelected
                        ? 'border-[#0F3D66] bg-[#0F3D66] text-white shadow-[0_10px_24px_rgba(15,61,102,0.16)]'
                        : 'border-[#D4DFEE] bg-[#F7FAFD] text-[#0B2742] hover:bg-white'
                    }`}
                  >
                    {formatEventLabel(event)}
                  </button>
                )
              })}
            </div>

            {selectedVisibleEvent ? (
              <div className="mt-3 rounded-[1.2rem] border border-[#D4DFEE] bg-[#F7FAFD] p-3">
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-white px-2.5 py-1 text-[0.7rem] font-semibold text-[#0F3D66]">
                    {guestAccessByEvent[selectedVisibleEvent.id]?.length || 0} e-mail
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[0.7rem] font-semibold text-[#0F3D66]">
                    ZIP {downloadStatsByEvent[selectedVisibleEvent.id]?.downloads || 0}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[0.7rem] font-semibold text-[#0F3D66]">
                    Poster {downloadStatsByEvent[selectedVisibleEvent.id]?.posters || 0}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[0.7rem] font-semibold text-[#0F3D66]">
                    Instagram {downloadStatsByEvent[selectedVisibleEvent.id]?.stories || 0}
                  </span>
                  {downloadStatsByEvent[selectedVisibleEvent.id]?.lastEmail ? (
                    <span className="rounded-full bg-white px-2.5 py-1 text-[0.7rem] font-semibold text-[#597594]">
                      Son: {downloadStatsByEvent[selectedVisibleEvent.id]?.lastEmail}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={getPublicJoinPath(selectedVisibleEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-[#F58220] px-3 py-2 text-xs font-semibold text-white hover:bg-[#DB6E12]"
                  >
                    {t.common.guestEntryPage}
                  </Link>
                  <Link
                    href={getPublicGalleryPath(selectedVisibleEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-3 py-2 text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                  >
                    {t.common.gallery}
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(getEventShareUrl(selectedVisibleEvent), t.admin.uploadCopied)
                    }
                    className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-3 py-2 text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                  >
                    {t.common.copyUploadLink}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        getGalleryShareUrl(selectedVisibleEvent),
                        t.admin.galleryCopied
                      )
                    }
                    className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-3 py-2 text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                  >
                    {t.common.copyGalleryLink}
                  </button>
                </div>
              </div>
            ) : null}
            </>
          )}
        </section>

        <section className="rounded-[2.2rem] border border-[#D4DFEE] bg-white/85 p-7 shadow-[0_18px_54px_rgba(15,61,102,0.08)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6A84A3]">
                {t.admin.selectedAlbumLabel}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#0B2742]">
                {selectedVisibleEvent ? formatEventLabel(selectedVisibleEvent) : t.admin.eventDetails}
              </h2>
            </div>
          </div>

          {!authenticated ? (
            <p className="mt-6 text-sm text-[#597594]">{t.admin.unlockToManage}</p>
          ) : visibleEvents.length === 0 ? (
            <p className="mt-6 text-sm text-[#597594]">
              {creatingDemoTemplate ? t.admin.noDemoTemplates : t.admin.noEvents}
            </p>
          ) : (
            <div className="mt-6 grid gap-4">
              {selectedVisibleEvent ? [selectedVisibleEvent].map((event) => (
                <div
                  key={event.id}
                  id={`event-editor-${event.id}`}
                  className="rounded-[1.8rem] border border-[#D4DFEE] bg-[#F8FBFE] p-5"
                >
                  <p className="mt-2 break-all text-sm text-[#6A84A3]">
                    {t.common.eventId}: {event.id}
                  </p>
                  {event.slug ? (
                    <p className="mt-1 break-all text-sm text-[#6A84A3]">
                      {t.admin.publicSlugLabel}: {event.slug}
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

                  <div className="mt-4 space-y-3">
                  <AdminSettingsSection title={t.admin.settingsGeneral} toggleLabel={t.admin.openClose} defaultOpen>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                      {t.admin.eventDetails}
                    </p>

                    <div className="mt-3 grid gap-3">
                      <label className="block text-sm font-semibold text-[#33516F]">
                        {t.admin.eventName}
                        <input
                          value={eventDraftsById[event.id]?.name ?? event.name}
                          onChange={(inputEvent) =>
                            handleEventDraftChange(event.id, inputEvent.target.value)
                          }
                          className="mt-2 w-full rounded-2xl border border-[#D4DFEE] bg-[#F8FBFE] px-4 py-3 text-sm font-medium text-[#0B2742] outline-none focus:border-[#0F3D66]"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-[#33516F]">
                        {t.common.eventDate}
                        <input
                          type="date"
                          value={eventDraftsById[event.id]?.eventDate ?? event.eventDate ?? ''}
                          onChange={(inputEvent) =>
                            handleEventDateDraftChange(event.id, inputEvent.target.value)
                          }
                          className="mt-2 w-full rounded-2xl border border-[#D4DFEE] bg-[#F8FBFE] px-4 py-3 text-sm font-medium text-[#0B2742] outline-none focus:border-[#0F3D66]"
                        />
                      </label>
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
                  </AdminSettingsSection>

                  <AdminSettingsSection title={t.admin.settingsBrandingMedia} toggleLabel={t.admin.openClose}>
                    <div className="rounded-2xl border border-[#D4DFEE] bg-[#F8FBFE] p-4">
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
                          [t.admin.guestbookCoverPhoto, event.guestbookCoverImageUrl],
                          [t.admin.backgroundImage, event.backgroundImageUrl],
                          [t.admin.posterTemplateImage, event.posterTemplateUrl],
                          [t.admin.storyTemplateImage, event.storyTemplateUrl],
                          [t.admin.photostripBackground, event.photostripBackgroundUrl],
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

                    {eventControlsById[event.id]?.photostripEnabled ?? event.photostripEnabled ? (
                      <div className="mt-3 rounded-2xl border border-[#D4DFEE] bg-[#F8FBFE] p-4">
                        <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                          <div
                            className="aspect-[9/16] rounded-2xl border border-[#D4DFEE] bg-white bg-cover bg-center"
                            style={
                              event.photostripBackgroundUrl
                                ? {
                                    backgroundImage: `url(${event.photostripBackgroundUrl})`,
                                  }
                                : undefined
                            }
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#0B2742]">
                              {t.admin.photostripBackground}
                            </p>
                            <p className="mt-1 text-xs text-[#597594]">
                              {t.admin.photostripBackgroundHelp}
                            </p>
                            <p className="mt-2 text-xs font-semibold text-[#33516F]">
                              {event.photostripBackgroundUrl
                                ? t.admin.visualReady
                                : t.admin.visualMissing}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]">
                                {updatingEventVisual?.eventId === event.id &&
                                updatingEventVisual.kind === 'photostripBackground'
                                  ? t.admin.mediaUploading
                                  : event.photostripBackgroundUrl
                                    ? t.admin.changeFile
                                    : t.admin.chooseFile}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(inputEvent) => {
                                    const file = inputEvent.target.files?.[0] || null
                                    void updateEventVisual(event, file, 'photostripBackground')
                                    inputEvent.target.value = ''
                                  }}
                                  className="sr-only"
                                />
                              </label>

                              {event.photostripBackgroundUrl ? (
                                <button
                                  type="button"
                                  onClick={() => void removeEventVisual(event, 'photostripBackground')}
                                  disabled={
                                    updatingEventVisual?.eventId === event.id &&
                                    updatingEventVisual.kind === 'photostripBackground'
                                  }
                                  className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {t.admin.guestbookCoverPhotoRemove}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                  </AdminSettingsSection>

                  <AdminSettingsSection title={t.admin.settingsFeatures} toggleLabel={t.admin.openClose}>
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
                        ['guestbookEnabled', t.admin.guestbookLabel],
                        ['photostripEnabled', 'Photostrip Story 5x15'],
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

                      {eventControlsById[event.id]?.guestbookEnabled ?? event.guestbookEnabled ? (
                        (() => {
                          const selectedTheme = getSelectedGuestbookPdfTheme(event)
                          const selectedThemeConfig = getGuestbookPdfThemeConfig(selectedTheme)

                          return (
                        <>
                          <label className="flex items-center justify-between gap-4 rounded-2xl border border-[#D4DFEE] bg-[#F8FBFE] px-4 py-3">
                            <span className="text-sm text-[#33516F]">
                              {t.admin.guestbookPdfStyle}
                            </span>
                            <select
                              value={selectedTheme}
                              onChange={(item) =>
                                handleEventThemeChange(
                                  event.id,
                                  normalizeGuestbookPdfTheme(item.target.value)
                                )
                              }
                              className="min-w-36 rounded-xl border border-[#B9CBE0] bg-white px-3 py-2 text-sm font-semibold text-[#0F3D66] outline-none focus:border-[#F58220]"
                            >
                              {guestbookPdfThemeKeys.map((theme) => {
                                const themeConfig = guestbookPdfThemeConfigs[theme]

                                return (
                                <option
                                  key={theme}
                                  value={theme}
                                  disabled={!themeConfig.implemented}
                                >
                                  {guestbookPdfThemeLabels[theme]}
                                  {themeConfig.implemented ? '' : ` - ${t.admin.comingSoon}`}
                                </option>
                                )
                              })}
                            </select>
                          </label>

                          <div className="rounded-2xl border border-[#D4DFEE] bg-[#F8FBFE] p-4">
                            <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                              <div
                                className="aspect-[3/4] rounded-2xl border border-[#D4DFEE] bg-white bg-cover bg-center"
                                style={
                                  selectedThemeConfig.previewImage
                                    ? {
                                        backgroundImage: `url(${selectedThemeConfig.previewImage})`,
                                      }
                                    : undefined
                                }
                              />
                              <div>
                                <p className="text-sm font-semibold text-[#0B2742]">
                                  {guestbookPdfThemeLabels[selectedTheme]}
                                </p>
                                <p className="mt-1 text-xs text-[#597594]">
                                  {selectedThemeConfig.implemented
                                    ? t.admin.guestbookPdfPreviewHelp
                                    : t.admin.guestbookPdfThemeComingSoon}
                                </p>
                              </div>
                            </div>
                          </div>

                          {selectedThemeConfig.implemented ? (
                            <div className="rounded-2xl border border-[#D4DFEE] bg-[#F8FBFE] p-4">
                              <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                                <div
                                  className="aspect-[3/4] rounded-2xl border border-[#D4DFEE] bg-white bg-cover bg-center"
                                  style={
                                    event.guestbookCoverImageUrl || event.coverImageUrl
                                      ? {
                                          backgroundImage: `url(${
                                            event.guestbookCoverImageUrl || event.coverImageUrl
                                          })`,
                                        }
                                      : undefined
                                  }
                                />
                                <div>
                                  <p className="text-sm font-semibold text-[#0B2742]">
                                    {t.admin.guestbookCoverPhoto}
                                  </p>
                                  <p className="mt-1 text-xs text-[#597594]">
                                    {t.admin.guestbookCoverPhotoHelp}
                                  </p>
                                  <p className="mt-1 text-xs text-[#597594]">
                                    {selectedThemeConfig.photoRecommendation}
                                  </p>
                                  <p className="mt-2 text-xs font-semibold text-[#33516F]">
                                    {event.guestbookCoverImageUrl
                                      ? t.admin.guestbookCoverPhotoActive
                                      : event.coverImageUrl
                                        ? t.admin.guestbookCoverPhotoFallback
                                        : t.admin.guestbookCoverPhotoEmpty}
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]">
                                      {updatingEventVisual?.eventId === event.id &&
                                      updatingEventVisual.kind === 'guestbookCover'
                                        ? t.admin.mediaUploading
                                        : event.guestbookCoverImageUrl
                                          ? t.admin.guestbookCoverPhotoReplace
                                          : t.admin.guestbookCoverPhotoUpload}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(inputEvent) => {
                                          const file = inputEvent.target.files?.[0] || null
                                          void updateEventVisual(event, file, 'guestbookCover')
                                          inputEvent.target.value = ''
                                        }}
                                        className="sr-only"
                                      />
                                    </label>

                                    {event.guestbookCoverImageUrl ? (
                                      <button
                                        type="button"
                                        onClick={() => void removeEventVisual(event, 'guestbookCover')}
                                        disabled={
                                          updatingEventVisual?.eventId === event.id &&
                                          updatingEventVisual.kind === 'guestbookCover'
                                        }
                                        className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        {t.admin.guestbookCoverPhotoRemove}
                                      </button>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </>
                          )
                        })()
                      ) : null}
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
                  </AdminSettingsSection>

                  <AdminSettingsSection title={t.admin.settingsAccessSharing} toggleLabel={t.admin.openClose}>
                  <div className="rounded-[1.5rem] border border-[#D4DFEE] bg-white p-4">
                    <div className="flex justify-center" data-event-qr={event.id}>
                      <QRCodeSVG value={getEventShareUrl(event)} size={160} />
                    </div>
                    <p className="mt-3 text-center text-xs uppercase tracking-[0.18em] text-[#6A84A3]">
                      {t.admin.qrLabel}
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => downloadQrPng(event)}
                        className="rounded-full bg-[#0F3D66] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0B2F4F]"
                      >
                        {t.admin.downloadQrPng}
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadQrSvg(event)}
                        className="rounded-full border border-[#B9CBE0] bg-white px-3 py-2 text-xs font-semibold text-[#0F3D66] hover:bg-[#F2F6FA]"
                      >
                        {t.admin.downloadQrSvg}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(getEventShareUrl(event), t.admin.uploadCopied)
                        }
                        className="rounded-full border border-[#B9CBE0] bg-white px-3 py-2 text-xs font-semibold text-[#0F3D66] hover:bg-[#F2F6FA]"
                      >
                        {t.common.copyUploadLink}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {event.isDemoTemplate ? (
                      <div className="rounded-[1.2rem] border border-[#D4DFEE] bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                          {t.admin.editAction}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById(`event-editor-${event.id}`)
                              ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }
                          className="mt-3 inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                        >
                          {t.admin.editAction}
                        </button>
                      </div>
                    ) : null}

                    <div className="rounded-[1.2rem] border border-[#D4DFEE] bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                        {t.admin.guestLinkLabel}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={getPublicJoinPath(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-full bg-[#F58220] px-4 py-2 text-sm font-semibold text-white hover:bg-[#DB6E12]"
                        >
                          {t.admin.openAction}
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(getEventShareUrl(event), t.admin.uploadCopied)
                          }
                          className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                        >
                          {t.admin.copyAction}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[1.2rem] border border-[#D4DFEE] bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                        {t.common.gallery}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={getPublicGalleryPath(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-full bg-[#0F3D66] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B2F4F]"
                        >
                          {t.admin.openAction}
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
                          {t.admin.copyAction}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[1.2rem] border border-[#D4DFEE] bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                        Demo
                      </p>
                      <button
                        type="button"
                        onClick={() => openDemoCloneModal(event)}
                        disabled={submitting}
                        className="mt-3 inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {event.isDemoTemplate ? t.admin.createDemoFromTemplate : t.admin.demoCloneAction}
                      </button>
                    </div>

                    {event.accessCode ? (
                      <div className="rounded-[1.2rem] border border-[#D4DFEE] bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                          {t.admin.accessCodeLabel}
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
                            {t.admin.copyAction}
                          </button>
                        </div>
                      </div>
                    ) : null}

                  </div>
                  </AdminSettingsSection>

                  <AdminSettingsSection title={t.admin.settingsDownloadsExports} toggleLabel={t.admin.openClose}>

                  {event.guestbookEnabled ? (
                  <div className="rounded-[1.2rem] border border-[#D4DFEE] bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6A84A3]">
                        {t.admin.guestbookMessagesTitle}
                      </p>
                      <p className="text-sm font-semibold text-[#0B2742]">
                        {t.admin.guestbookMessagesSummary.replace(
                          '{count}',
                          String(guestMessagesByEvent[event.id]?.length || 0)
                        )}
                      </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void refreshSelectedGuestbookMessages(event.id)}
                        disabled={refreshingGuestbookEventId === event.id}
                        className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {t.admin.refreshGuestbook}
                      </button>
                      {getGuestbookPdfThemeConfig(event.guestbookPdfTheme).implemented ? (
                        guestMessagesByEvent[event.id]?.length ? (
                          <a
                            href={`/api/admin/guestbook-pdf?eventId=${encodeURIComponent(event.id)}`}
                            className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
                          >
                            {t.admin.downloadGuestbookPdf}
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStatusMessage(t.admin.noGuestbookMessages)}
                            className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] opacity-60"
                          >
                            {t.admin.downloadGuestbookPdf}
                          </button>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setStatusMessage(t.admin.guestbookPdfThemeComingSoon)
                          }
                          className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] opacity-60"
                        >
                          {t.admin.guestbookPdfThemeComingSoonButton}
                        </button>
                      )}
                      </div>
                    </div>

                    {guestMessagesByEvent[event.id]?.length ? (
                      <div className="mt-3 space-y-2">
                        {guestMessagesByEvent[event.id].map((entry, messageIndex) => (
                          <div
                            key={entry.id || `${event.id}-message-${messageIndex}`}
                            className="rounded-2xl bg-[#F7FAFD] px-3 py-2 text-sm text-[#33516F]"
                          >
                            {entry.id && editingGuestMessageId === entry.id ? (
                              <div className="space-y-2">
                                <input
                                  value={getGuestMessageDraft(entry).guestName}
                                  onChange={(inputEvent) =>
                                    handleGuestMessageDraftChange(
                                      entry.id as string,
                                      'guestName',
                                      inputEvent.target.value
                                    )
                                  }
                                  placeholder={t.admin.guestbookMessageNamePlaceholder}
                                  className="w-full rounded-xl border border-[#D4DFEE] bg-white px-3 py-2 text-sm font-medium text-[#0B2742] outline-none focus:border-[#0F3D66]"
                                />
                                <textarea
                                  value={getGuestMessageDraft(entry).message}
                                  onChange={(inputEvent) =>
                                    handleGuestMessageDraftChange(
                                      entry.id as string,
                                      'message',
                                      inputEvent.target.value
                                    )
                                  }
                                  maxLength={500}
                                  rows={3}
                                  className="w-full rounded-xl border border-[#D4DFEE] bg-white px-3 py-2 text-sm font-medium text-[#0B2742] outline-none focus:border-[#0F3D66]"
                                />
                                <p className="text-right text-xs text-[#6A84A3]">
                                  {getGuestMessageDraft(entry).message.length}/500
                                </p>
                              </div>
                            ) : (
                              <>
                                {entry.guest_name ? (
                                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[#0F3D66]">
                                    {entry.guest_name}
                                  </p>
                                ) : null}
                                <p className="break-words font-medium text-[#0B2742]">
                                  {entry.message}
                                </p>
                              </>
                            )}
                            <p className="mt-1 text-xs text-[#6A84A3]">
                              {entry.file_name || (entry.source === 'guestbook' ? t.admin.guestbookLabel : t.admin.guestbookPhotoSource)} · {formatGuestbookDate(entry.created_at, locale) || t.admin.guestEmailTimeUnknown}
                            </p>
                            {entry.id ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {editingGuestMessageId === entry.id ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => void saveGuestMessage(event.id, entry)}
                                      disabled={updatingGuestMessageId === entry.id}
                                      className="rounded-full bg-[#0F3D66] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0B2F4F] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {updatingGuestMessageId === entry.id
                                        ? t.admin.saving
                                        : t.admin.guestbookMessageSave}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEditingGuestMessage}
                                      disabled={updatingGuestMessageId === entry.id}
                                      className="rounded-full border border-[#C8D3E5] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {t.admin.guestbookMessageCancel}
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => startEditingGuestMessage(entry)}
                                      disabled={Boolean(updatingGuestMessageId)}
                                      className="rounded-full border border-[#C8D3E5] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F3D66] hover:bg-[#EDF4FB] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {t.admin.guestbookMessageEdit}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => void deleteGuestMessage(event.id, entry)}
                                      disabled={Boolean(updatingGuestMessageId)}
                                      className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {t.admin.guestbookMessageDelete}
                                    </button>
                                  </>
                                )}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-[#6A84A3]">
                        {t.admin.guestbookMessagesEmpty}
                      </p>
                    )}
                  </div>
                  ) : null}

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
                  </AdminSettingsSection>

                  <AdminSettingsSection title={t.admin.settingsDangerZone} toggleLabel={t.admin.openClose}>
                    <div className="rounded-[1.2rem] border border-[#F1B6B6] bg-[#FFF7F7] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B52E2E]">
                        {t.admin.dangerAction}
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
                  </AdminSettingsSection>
                  </div>
                </div>
              )) : null}
            </div>
          )}
        </section>
      </main>

      {demoCloneSource ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-[1.5rem] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-[#0B2742]">
                  {t.admin.demoCloneTitle}
                </p>
                <p className="mt-1 text-sm text-[#597594]">
                  {t.admin.demoCloneIntro}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDemoCloneModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F6FA] text-[#0F3D66] hover:bg-[#E2ECF6]"
                aria-label={t.gallery.cancel}
                title={t.gallery.cancel}
              >
                ×
              </button>
            </div>

            <label className="mt-5 block text-sm font-semibold text-[#33516F]">
              {t.admin.demoCustomerName}
              <input
                value={demoCustomerName}
                onChange={(event) => setDemoCustomerName(event.target.value)}
                disabled={submitting || Boolean(createdDemoEvent)}
                placeholder={t.admin.demoCustomerPlaceholder}
                className="mt-2 w-full rounded-2xl border border-[#D4DFEE] bg-[#F8FBFE] px-4 py-3 text-sm font-medium text-[#0B2742] outline-none focus:border-[#0F3D66] disabled:opacity-60"
              />
            </label>

            {createdDemoEvent ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-semibold text-emerald-800">{t.admin.demoCreated}</p>
                <p className="mt-1 break-words text-sm text-emerald-700">
                  {formatEventLabel(createdDemoEvent)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={getPublicJoinPath(createdDemoEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-[#F58220] px-4 py-2 text-sm font-semibold text-white hover:bg-[#DB6E12]"
                  >
                    {t.admin.demoOpenUpload}
                  </Link>
                  <Link
                    href={getPublicGalleryPath(createdDemoEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-[#0F3D66] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B2F4F]"
                  >
                    {t.admin.demoOpenGallery}
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(getGalleryShareUrl(createdDemoEvent), t.admin.galleryCopied)
                    }
                    className="inline-flex items-center justify-center rounded-full border border-[#B9CBE0] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#F2F6FA]"
                  >
                    {t.admin.demoCopyLink}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeDemoCloneModal}
                className="inline-flex items-center justify-center rounded-full border border-[#C8D3E5] bg-white px-4 py-2 text-sm font-semibold text-[#0F3D66] hover:bg-[#EDF4FB]"
              >
                {t.gallery.cancel}
              </button>
              {!createdDemoEvent ? (
                <button
                  type="button"
                  onClick={createDemoClone}
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-full bg-[#0F3D66] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B2F4F] disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  {submitting ? t.admin.saving : t.admin.demoCreate}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <SiteFooter />
    </div>
  )
}
