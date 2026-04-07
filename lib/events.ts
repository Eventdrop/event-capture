import { addHours } from '@/lib/eventdrop'

type EventRecordLike = {
  id?: string | null
  name?: string | null
  album_name?: string | null
  slug?: string | null
  access_code?: string | null
  event_date?: string | null
  created_at?: string | null
  expires_at?: string | null
}

export type NormalizedEvent = {
  id: string
  name: string
  albumName: string
  slug: string
  accessCode: string
  eventDate: string | null
  createdAt: string | null
  expiresAt: string | null
}

function normalizeLabel(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’`"]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
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

export function deriveLegacyEventAccessCode(id?: string | null) {
  if (!id) return ''
  return id.replace(/-/g, '').slice(0, 6).toUpperCase()
}

export function deriveEventAccessCode(
  record: Pick<EventRecordLike, 'id' | 'access_code'>
) {
  return normalizeEventAccessCode(record.access_code || '') || deriveLegacyEventAccessCode(record.id)
}

export function buildEventInsertPayload(input: {
  name: string
  albumName: string
  eventDate?: string
  accessCode?: string
}) {
  const now = new Date()
  const accessCode = normalizeEventAccessCode(input.accessCode || generateEventAccessCode())
  const slugBase = slugifyEventName(`${input.name}-${input.albumName}`) || 'eventdrop-event'
  const expiresAt = addHours(now, 48).toISOString()

  return {
    name: input.name.trim(),
    album_name: input.albumName.trim(),
    slug: `${slugBase}-${Math.random().toString(36).slice(2, 6)}`,
    access_code: accessCode,
    event_date: input.eventDate || null,
    expires_at: expiresAt,
  }
}

export function normalizeEventRecord(
  record: EventRecordLike | null | undefined
): NormalizedEvent | null {
  if (!record?.id || !record?.name) return null

  return {
    id: record.id,
    name: record.name,
    albumName: record.album_name || record.name,
    slug: record.slug || '',
    accessCode: deriveEventAccessCode(record),
    eventDate: record.event_date || null,
    createdAt: record.created_at || null,
    expiresAt: record.expires_at || null,
  }
}

export function formatEventDisplayName(event: Pick<NormalizedEvent, 'name' | 'albumName'>) {
  const name = event.name.trim()
  const albumName = event.albumName.trim()

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
