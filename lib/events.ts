import type { Locale } from '@/lib/i18n'

type EventRecordLike = {
  id?: string | null
  name?: string | null
  album_name?: string | null
  slug?: string | null
  access_code?: string | null
  cover_image_url?: string | null
  background_image_url?: string | null
  poster_template_url?: string | null
  story_template_url?: string | null
  event_date?: string | null
  default_locale?: string | null
  allow_guest_share?: boolean | null
  allow_guest_download?: boolean | null
  allow_album_download?: boolean | null
  allow_guest_delete?: boolean | null
  allow_guest_poster?: boolean | null
  is_demo_template?: boolean | null
  created_at?: string | null
}

export type NormalizedEvent = {
  id: string
  name: string
  albumName: string
  slug: string
  accessCode: string
  coverImageUrl: string
  backgroundImageUrl: string
  posterTemplateUrl: string
  storyTemplateUrl: string
  eventDate: string | null
  defaultLocale: Locale
  allowGuestShare: boolean
  allowGuestDownload: boolean
  allowAlbumDownload: boolean
  allowGuestDelete: boolean
  allowGuestPoster: boolean
  isDemoTemplate: boolean
  createdAt: string | null
}

function normalizeLabel(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’`"]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
}

export function cleanRepeatedEventLabel(value: string) {
  const label = value.trim()
  const separators = [' - ', ' · ', ' | ']

  for (const separator of separators) {
    let separatorIndex = label.indexOf(separator)

    while (separatorIndex >= 0) {
      const left = label.slice(0, separatorIndex).trim()
      const right = label.slice(separatorIndex + separator.length).trim()

      if (left && right && normalizeLabel(left) === normalizeLabel(right)) {
        return left
      }

      separatorIndex = label.indexOf(separator, separatorIndex + separator.length)
    }
  }

  return label
}

export function slugifyEventName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

const ACCESS_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function normalizeEventAccessCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function generateEventAccessCode(length = 6) {
  let code = ''

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * ACCESS_CODE_CHARS.length)
    code += ACCESS_CODE_CHARS[randomIndex]
  }

  return code
}

export function normalizeEventLocale(value?: string | null): Locale {
  return value === 'tr' || value === 'en' || value === 'de' || value === 'fr' ? value : 'nl'
}

export function deriveLegacyEventAccessCode(id?: string | null) {
  if (!id) return ''
  return id.replace(/-/g, '').slice(0, 6).toUpperCase()
}

export function deriveEventAccessCode(
  record: Pick<EventRecordLike, 'id' | 'access_code'>
) {
  if (record.access_code === null) return ''

  return (
    normalizeEventAccessCode(record.access_code || '') ||
    deriveLegacyEventAccessCode(record.id)
  )
}

export function buildEventInsertPayload(input: {
  name: string
  albumName: string
  eventDate?: string
  defaultLocale?: Locale
  accessCode?: string
  accessCodeEnabled?: boolean
  coverImageUrl?: string
  backgroundImageUrl?: string
  posterTemplateUrl?: string
  storyTemplateUrl?: string
  allowGuestShare?: boolean
  allowGuestDownload?: boolean
  allowAlbumDownload?: boolean
  allowGuestDelete?: boolean
  allowGuestPoster?: boolean
  isDemoTemplate?: boolean
}) {
  const accessCode = input.accessCodeEnabled === false
    ? null
    : normalizeEventAccessCode(input.accessCode || generateEventAccessCode())
  const slugBase = slugifyEventName(`${input.name}-${input.albumName}`) || 'eventdrop-event'
  const payload = {
    name: cleanRepeatedEventLabel(input.name),
    album_name: cleanRepeatedEventLabel(input.albumName),
    slug: `${slugBase}-${Math.random().toString(36).slice(2, 6)}`,
    access_code: accessCode,
    cover_image_url: input.coverImageUrl || null,
    background_image_url: input.backgroundImageUrl || null,
    event_date: input.eventDate || null,
    default_locale: normalizeEventLocale(input.defaultLocale),
    allow_guest_share: input.allowGuestShare !== false,
    allow_guest_download: input.allowGuestDownload !== false,
    allow_album_download: input.allowAlbumDownload !== false,
    allow_guest_delete: input.allowGuestDelete === true,
    allow_guest_poster: input.allowGuestPoster === true,
  }

  return {
    ...payload,
    ...(input.isDemoTemplate === true ? { is_demo_template: true } : {}),
    ...(input.posterTemplateUrl ? { poster_template_url: input.posterTemplateUrl } : {}),
    ...(input.storyTemplateUrl ? { story_template_url: input.storyTemplateUrl } : {}),
  }
}

export function normalizeEventRecord(
  record: EventRecordLike | null | undefined
): NormalizedEvent | null {
  if (!record?.id || !record?.name) return null

  return {
    id: record.id,
    name: cleanRepeatedEventLabel(record.name),
    albumName: cleanRepeatedEventLabel(record.album_name || record.name),
    slug: record.slug || '',
    accessCode: deriveEventAccessCode(record),
    coverImageUrl: record.cover_image_url || '',
    backgroundImageUrl: record.background_image_url || '',
    posterTemplateUrl: record.poster_template_url || '',
    storyTemplateUrl: record.story_template_url || '',
    eventDate: record.event_date || null,
    defaultLocale: normalizeEventLocale(record.default_locale),
    allowGuestShare: record.allow_guest_share !== false,
    allowGuestDownload: record.allow_guest_download !== false,
    allowAlbumDownload: record.allow_album_download !== false,
    allowGuestDelete: record.allow_guest_delete === true,
    allowGuestPoster: record.allow_guest_poster === true,
    isDemoTemplate: record.is_demo_template === true,
    createdAt: record.created_at || null,
  }
}

export function isEventCodeEnabled(event: Pick<NormalizedEvent, 'accessCode'>) {
  return Boolean(event.accessCode)
}

export function formatEventDisplayName(event: Pick<NormalizedEvent, 'name' | 'albumName'>) {
  const name = cleanRepeatedEventLabel(event.name)
  const albumName = cleanRepeatedEventLabel(event.albumName)

  if (!name) return albumName
  if (!albumName) return name

  const normalizedName = normalizeLabel(name)
  const normalizedAlbum = normalizeLabel(albumName)

  if (normalizedName === normalizedAlbum) {
    return name
  }

  if (normalizedName.includes(normalizedAlbum)) {
    return name
  }

  if (normalizedAlbum.includes(normalizedName)) {
    return albumName
  }

  return `${name} · ${albumName}`
}

export function getEventRoute(identifier: string) {
  return `/event/${identifier}`
}

export function getEventGalleryRoute(identifier: string) {
  return `/event/${identifier}/gallery`
}

export function getEventJoinRoute(identifier: string) {
  return `/join/${identifier}`
}
