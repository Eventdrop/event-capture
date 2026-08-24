import type { UploadRecord } from '@/lib/eventdrop'

export type GuestbookStandaloneRecord = {
  createdAt?: string | null
  created_at?: string | null
  guestName?: string | null
  guest_name?: string | null
  message?: string | null
}

export type GuestbookEntry =
  | {
      createdAt: string | null
      key: string
      message: string
      source: 'upload'
      upload: UploadRecord
    }
  | {
      createdAt: string | null
      guestName: string | null
      key: string
      message: string
      source: 'standalone'
    }

export function sanitizeGuestbookName(value?: string | null) {
  const trimmed = (value || '').trim().replace(/\s+/g, ' ')

  return trimmed ? trimmed.slice(0, 80) : null
}

export function sanitizeGuestbookMessage(value?: string | null) {
  return (value || '').trim()
}

function getTimestamp(value?: string | null) {
  return value ? new Date(value).getTime() || 0 : 0
}

export function buildGuestbookEntries(input: {
  sort?: 'newest' | 'oldest'
  standaloneMessages?: GuestbookStandaloneRecord[]
  uploads?: UploadRecord[]
}) {
  const uploadMessages = (input.uploads || [])
    .filter((item) => sanitizeGuestbookMessage(item.guest_message))
    .map<GuestbookEntry>((item) => ({
      createdAt: item.created_at || null,
      key: `upload-${item.id}`,
      message: sanitizeGuestbookMessage(item.guest_message),
      source: 'upload',
      upload: item,
    }))
  const standaloneMessages = (input.standaloneMessages || [])
    .filter((item) => sanitizeGuestbookMessage(item.message))
    .map<GuestbookEntry>((item, index) => {
      const createdAt = item.createdAt || item.created_at || null

      return {
        createdAt,
        guestName: sanitizeGuestbookName(item.guestName || item.guest_name),
        key: `standalone-${createdAt || 'pending'}-${index}`,
        message: sanitizeGuestbookMessage(item.message),
        source: 'standalone',
      }
    })

  return [...uploadMessages, ...standaloneMessages].sort((left, right) => {
    const leftTime = getTimestamp(left.createdAt)
    const rightTime = getTimestamp(right.createdAt)

    if (leftTime === rightTime) {
      return left.key.localeCompare(right.key)
    }

    return input.sort === 'oldest' ? leftTime - rightTime : rightTime - leftTime
  })
}

export function sanitizeGuestbookPdfFilename(value: string) {
  const safeName = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return `eventdrop-gastenboek-${safeName || 'event'}.pdf`
}
