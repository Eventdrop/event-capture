import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import {
  EVENT_ACCESS_COOKIE_NAME,
  getSafeEventReturnToPath,
  hasEventAccess,
} from '@/lib/event-access'
import { getEventRoute } from '@/lib/events'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import {
  createVideoAccessGrant,
  verifyVideoAccessGrant,
  VIDEO_ACCESS_COOKIE_NAME,
  VIDEO_ACCESS_MAX_AGE,
} from '@/lib/video-access'

export const runtime = 'nodejs'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const identifier = requestUrl.searchParams.get('identifier')?.trim()
  const returnTo = requestUrl.searchParams.get('returnTo') || ''

  if (!identifier || identifier.length > 200) {
    return NextResponse.json({ ok: false, error: 'Invalid event identifier.' }, { status: 400 })
  }

  try {
    const supabase = createAdminSupabaseClient()
    const { data: event, error } = await supabase
      .from('events')
      .select('id, slug')
      .eq(UUID.test(identifier) ? 'id' : 'slug', identifier)
      .maybeSingle()

    if (error) throw error
    if (!event) {
      return NextResponse.json({ ok: false, error: 'Event not found.' }, { status: 404 })
    }

    const cookieStore = await cookies()
    const eventAccess = cookieStore.get(EVENT_ACCESS_COOKIE_NAME)?.value
    const hasAccess = [identifier, event.id, event.slug]
      .filter((value): value is string => Boolean(value))
      .some((value) => hasEventAccess(eventAccess, value))

    if (!hasAccess) {
      return NextResponse.json({ ok: false, error: 'Event access is required.' }, { status: 403 })
    }

    const destination = getSafeEventReturnToPath(returnTo, {
      eventId: event.id,
      eventSlug: event.slug,
    }) || getEventRoute(identifier)
    const response = NextResponse.redirect(new URL(destination, requestUrl.origin))
    const existingVideoGrant = cookieStore.get(VIDEO_ACCESS_COOKIE_NAME)?.value

    if (!verifyVideoAccessGrant(existingVideoGrant, event.id)) {
      response.cookies.set(VIDEO_ACCESS_COOKIE_NAME, createVideoAccessGrant(event.id), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: VIDEO_ACCESS_MAX_AGE,
      })
    }

    return response
  } catch {
    console.error('Video access recovery failed')
    return NextResponse.json({ ok: false, error: 'Video access could not be restored.' }, { status: 500 })
  }
}
