import { createHash, createHmac, randomUUID } from 'node:crypto'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const SHORT_THEME_CODE = /^[A-Za-z0-9_-]{12}$/

function codeForId(id: string) {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('Guestbook theme link secret is not configured')
  // A random record ID produces a 72-bit opaque code; deriving it permits reuse
  // without storing the raw code or an encrypted customer payload.
  return createHmac('sha256', secret)
    .update(`eventdrop-guestbook-short-v1:${id}`).digest('base64url').slice(0, 12)
}

function hashCode(code: string) {
  return createHash('sha256').update(code).digest('hex')
}

export async function getOrCreateGuestbookShortCode(eventId: string, eventDate?: string | null) {
  const supabase = createAdminSupabaseClient()
  const now = new Date().toISOString()
  const expiresAt = new Date(
    eventDate
      ? Date.parse(`${eventDate}T00:00:00.000Z`) + 7 * 86400000
      : Date.parse(now) + 90 * 86400000
  ).toISOString()
  const { data: existing, error } = await supabase.from('guestbook_theme_links')
    .select('id,code_hash,expires_at').eq('event_id', eventId).is('revoked_at', null)
    .gt('expires_at', now).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (error) throw error
  if (existing) {
    const code = codeForId(existing.id)
    if (hashCode(code) === existing.code_hash) {
      if (eventDate && existing.expires_at !== expiresAt) {
        const { error: updateError } = await supabase.from('guestbook_theme_links')
          .update({ expires_at: expiresAt }).eq('id', existing.id)
        if (updateError) throw updateError
      }
      return code
    }
  }
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const id = randomUUID()
    const code = codeForId(id)
    const { error: insertError } = await supabase.from('guestbook_theme_links').insert({
      id, code_hash: hashCode(code), event_id: eventId,
      expires_at: expiresAt,
    })
    if (!insertError) return code
    if (insertError.code !== '23505') throw insertError
  }
  throw new Error('Could not allocate a unique Guestbook theme link')
}

export async function resolveGuestbookShortCode(code: string): Promise<string | null> {
  if (!SHORT_THEME_CODE.test(code)) return null
  const { data, error } = await createAdminSupabaseClient().from('guestbook_theme_links')
    .select('event_id').eq('code_hash', hashCode(code)).is('revoked_at', null)
    .gt('expires_at', new Date().toISOString()).maybeSingle()
  if (error) throw error
  return data?.event_id || null
}
