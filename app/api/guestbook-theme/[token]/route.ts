import { guestbookPdfThemeConfigs, guestbookPdfThemeKeys, normalizeGuestbookPdfTheme } from '@/lib/guestbook-pdf-theme'
import { resolveGuestbookThemeToken } from '@/lib/guestbook-theme-link'
import { resolveGuestbookShortCode, SHORT_THEME_CODE } from '@/lib/guestbook-theme-short-link'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ token: string }> }

function reply(body: object, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } })
}

async function handle(request: Request, context: Context, save: boolean) {
  try {
    const { token } = await context.params
    const eventId = SHORT_THEME_CODE.test(token)
      ? await resolveGuestbookShortCode(token)
      : resolveGuestbookThemeToken(token)
    if (!eventId) return reply({ error: 'Deze link is ongeldig of verlopen. Vraag een nieuwe link aan.' }, 403)
    const supabase = createAdminSupabaseClient()
    if (save) {
      if (request.headers.get('origin') !== new URL(request.url).origin) {
        return reply({ error: 'Geen toegang.' }, 403)
      }
      const body = await request.json().catch(() => null)
      const theme = guestbookPdfThemeKeys.find((key) => key === body?.theme)
      const config = theme ? guestbookPdfThemeConfigs[theme] : null
      if (!theme || !config?.implemented || !['wedding', 'party'].includes(config.category)) {
        return reply({ error: 'Kies een beschikbaar thema.' }, 400)
      }
      const { data, error } = await supabase.from('events')
        .update({ guestbook_pdf_theme: theme }).eq('id', eventId)
        .select('guestbook_pdf_theme').maybeSingle()
      if (error) throw error
      if (!data) return reply({ error: 'Evenement niet gevonden.' }, 404)
      return reply({ ok: true, theme: data.guestbook_pdf_theme })
    }
    const { data, error } = await supabase.from('events')
      .select('name,album_name,guestbook_pdf_theme').eq('id', eventId).maybeSingle()
    if (error) throw error
    if (!data) return reply({ error: 'Evenement niet gevonden.' }, 404)
    return reply({ ok: true, name: data.album_name || data.name,
      theme: normalizeGuestbookPdfTheme(data.guestbook_pdf_theme) })
  } catch {
    console.error('Customer guestbook theme request failed')
    return reply({ error: 'Het thema kon niet worden geladen of opgeslagen. Probeer het opnieuw.' }, 500)
  }
}

export const GET = (request: Request, context: Context) => handle(request, context, false)
export const PATCH = (request: Request, context: Context) => handle(request, context, true)
