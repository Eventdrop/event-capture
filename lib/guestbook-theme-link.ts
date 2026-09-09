import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

const PURPOSE = 'eventdrop-guestbook-theme-v1'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function getKey() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('Guestbook theme link secret is not configured')
  return createHash('sha256').update(`${PURPOSE}:${secret}`).digest()
}

export function createGuestbookThemeToken(eventId: string) {
  if (!UUID.test(eventId)) throw new Error('Invalid event ID')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv)
  cipher.setAAD(Buffer.from(PURPOSE))
  const payload = JSON.stringify({ eventId, expiresAt: Date.now() + 90 * 86400000 })
  const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url')
}

export function resolveGuestbookThemeToken(token: string): string | null {
  if (!/^[A-Za-z0-9_-]{60,512}$/.test(token)) return null
  const key = getKey()
  try {
    const data = Buffer.from(token, 'base64url')
    const decipher = createDecipheriv('aes-256-gcm', key, data.subarray(0, 12))
    decipher.setAAD(Buffer.from(PURPOSE))
    decipher.setAuthTag(data.subarray(12, 28))
    const payload = JSON.parse(Buffer.concat([
      decipher.update(data.subarray(28)), decipher.final(),
    ]).toString('utf8'))
    return typeof payload.eventId === 'string' && UUID.test(payload.eventId) &&
      typeof payload.expiresAt === 'number' && payload.expiresAt > Date.now()
      ? payload.eventId : null
  } catch {
    return null
  }
}
