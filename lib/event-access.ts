import { normalizeEventAccessCode } from '@/lib/events'

export const EVENT_ACCESS_COOKIE_NAME = 'eventdrop_event_access'
export const EVENT_ACCESS_LIMIT = 24

export type EventAccessGrant = {
  eventId: string
  eventSlug: string
  email: string
  grantedAt: string
}

export function normalizeGuestEmail(value: string) {
  return value.trim().toLowerCase()
}

export function isValidGuestEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeGuestEmail(value))
}

export function parseEventAccessCookie(rawValue?: string | null) {
  if (!rawValue) return [] as EventAccessGrant[]

  try {
    const parsed = JSON.parse(rawValue) as EventAccessGrant[]

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      (item) =>
        Boolean(item?.eventId) &&
        typeof item?.eventId === 'string' &&
        typeof item?.eventSlug === 'string'
    )
  } catch {
    return []
  }
}

export function serializeEventAccessCookie(grants: EventAccessGrant[]) {
  return JSON.stringify(grants.slice(0, EVENT_ACCESS_LIMIT))
}

export function grantEventAccess(
  currentValue: string | undefined,
  grant: EventAccessGrant
) {
  const grants = parseEventAccessCookie(currentValue).filter(
    (item) => item.eventId !== grant.eventId
  )

  return serializeEventAccessCookie([grant, ...grants])
}

export function hasEventAccess(
  currentValue: string | undefined,
  identifier: string
) {
  const normalizedIdentifier = identifier.trim()

  return parseEventAccessCookie(currentValue).some(
    (item) =>
      item.eventId === normalizedIdentifier || item.eventSlug === normalizedIdentifier
  )
}

export function normalizeEventAccessInput(input: {
  email?: string
  code?: string
  identifier?: string
  returnTo?: string
}) {
  return {
    email: normalizeGuestEmail(input.email || ''),
    code: normalizeEventAccessCode(input.code || ''),
    identifier: (input.identifier || '').trim(),
    returnTo: (input.returnTo || '').trim(),
  }
}

export function isSafeReturnToPath(value: string) {
  return value.startsWith('/event/') && !value.startsWith('//')
}
