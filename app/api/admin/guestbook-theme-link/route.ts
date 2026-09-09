import { hasAdminSession } from '@/lib/admin-auth'
import { getOrCreateGuestbookShortCode } from '@/lib/guestbook-theme-short-link'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const reply = (body: object, status = 200) => Response.json(body, {
    status, headers: { 'Cache-Control': 'no-store' },
  })
  try {
    if (!(await hasAdminSession())) return reply({ error: 'Geen toegang.' }, 401)
    const body = await request.json().catch(() => null)
    if (typeof body?.eventId !== 'string' ||
      !/^[0-9a-f-]{36}$/i.test(body.eventId)) {
      return reply({ error: 'Ongeldig evenement.' }, 400)
    }
    const { data, error } = await createAdminSupabaseClient().from('events')
      .select('id,event_date').eq('id', body.eventId).maybeSingle()
    if (error) throw error
    if (!data) return reply({ error: 'Evenement niet gevonden.' }, 404)
    return reply({ ok: true, path: `/t/${await getOrCreateGuestbookShortCode(data.id, data.event_date)}` })
  } catch {
    console.error('Guestbook theme link creation failed')
    return reply({ error: 'De klantlink kon niet worden gemaakt.' }, 500)
  }
}
