import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

export const VIDEO_ACCESS_COOKIE_NAME = 'eventdrop_video_access'
export const VIDEO_ACCESS_MAX_AGE = 12 * 60 * 60
const SIGNING_CONTEXT = 'eventdrop-video-access-v1'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type VideoAccessGrant = {
  eventId: string
  uploaderSessionId: string
  issuedAt: number
  expiresAt: number
  purpose: 'video_upload'
}

function sign(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret?.trim() || secret === 'eventdrop-admin-session') {
    throw new Error('Video access signing secret is not configured')
  }
  return createHmac('sha256', secret)
    .update(`${SIGNING_CONTEXT}.${payload}`).digest()
}

export function createVideoAccessGrant(eventId: string): string {
  if (!UUID.test(eventId)) throw new Error('Invalid video grant event ID')
  const issuedAt = Math.floor(Date.now() / 1000)
  const grant: VideoAccessGrant = {
    eventId,
    uploaderSessionId: randomUUID(),
    issuedAt,
    expiresAt: issuedAt + VIDEO_ACCESS_MAX_AGE,
    purpose: 'video_upload',
  }
  const payload = Buffer.from(JSON.stringify(grant)).toString('base64url')
  return `${payload}.${sign(payload).toString('base64url')}`
}

// The expected ID must be the resolved event UUID, never an unchecked slug.
export function verifyVideoAccessGrant(
  token: string | null | undefined,
  expectedEventId: string
): VideoAccessGrant | null {
  if (!token || token.length > 2048 || !UUID.test(expectedEventId)) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, signature] = parts
  if (!/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]{43}$/.test(signature)) return null
  const expectedSignature = sign(payload)
  const suppliedSignature = Buffer.from(signature, 'base64url')
  if (suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)) return null
  try {
    const grant = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    const now = Math.floor(Date.now() / 1000)
    if (
      grant?.purpose !== 'video_upload' ||
      typeof grant.eventId !== 'string' || !UUID.test(grant.eventId) ||
      grant.eventId !== expectedEventId ||
      typeof grant.uploaderSessionId !== 'string' || !UUID.test(grant.uploaderSessionId) ||
      !Number.isSafeInteger(grant.issuedAt) || grant.issuedAt < 0 || grant.issuedAt > now ||
      !Number.isSafeInteger(grant.expiresAt) || grant.expiresAt <= now ||
      grant.expiresAt - grant.issuedAt !== VIDEO_ACCESS_MAX_AGE
    ) return null
    return {
      eventId: grant.eventId,
      uploaderSessionId: grant.uploaderSessionId,
      issuedAt: grant.issuedAt,
      expiresAt: grant.expiresAt,
      purpose: grant.purpose,
    }
  } catch {
    return null
  }
}
