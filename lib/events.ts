import { addHours } from '@/lib/eventdrop'

type EventRecordLike = {
  id?: string | null
  name?: string | null
  album_name?: string | null
  slug?: string | null
  event_date?: string | null
  created_at?: string | null
  expires_at?: string | null
}

export type NormalizedEvent = {
  id: string
  name: string
  albumName: string
  slug: string
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

export function buildEventInsertPayload(input: {
  name: string
  albumName: string
  eventDate?: string
}) {
  const now = new Date()
  const slugBase = slugifyEventName(`${input.name}-${input.albumName}`) || 'eventdrop-event'
  const expiresAt = addHours(now, 48).toISOString()

  return {
    name: input.name.trim(),
    album_name: input.albumName.trim(),
    slug: `${slugBase}-${Math.random().toString(36).slice(2, 6)}`,
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
