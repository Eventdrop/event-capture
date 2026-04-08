import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  EVENT_ACCESS_COOKIE_NAME,
  grantEventAccess,
  isSafeReturnToPath,
  isValidGuestEmail,
  normalizeEventAccessInput,
} from '@/lib/event-access'
import {
  getEventRoute,
  normalizeEventRecord,
  type NormalizedEvent,
} from '@/lib/events'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

function isEventActive(event: Pick<NormalizedEvent, 'expiresAt'>) {
  if (!event.expiresAt) return true
  return new Date(event.expiresAt).getTime() > Date.now()
}

async function persistGuestAccessLog(input: {
  eventId: string
  eventSlug: string
  email: string
  source: string
}) {
  try {
    const supabase = createAdminSupabaseClient()
    const richInsert = await supabase.from('guest_access_logs').insert([
      {
        event_id: input.eventId,
        event_slug: input.eventSlug || null,
        email: input.email,
        source: input.source,
      },
    ])

    if (!richInsert.error) return

    const message = richInsert.error.message.toLowerCase()
    const canFallback =
      message.includes('column') ||
      message.includes('schema cache') ||
      message.includes('could not find')

    if (!canFallback) {
      throw richInsert.error
    }

    const fallbackInsert = await supabase.from('guest_access_logs').insert([
      {
        event_id: input.eventId,
        email: input.email,
      },
    ])

    if (fallbackInsert.error) {
      throw fallbackInsert.error
    }
  } catch (error) {
    console.error('Failed to persist guest access log', error)
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        email?: string
        code?: string
        identifier?: string
        returnTo?: string
      }
    | null

  const { email, code, identifier, returnTo } = normalizeEventAccessInput(body || {})

  if (!isValidGuestEmail(email)) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'INVALID_EMAIL',
      },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300)

    if (error) {
      throw error
    }

    const events = (data || [])
      .map((item) => normalizeEventRecord(item))
      .filter((item): item is NormalizedEvent => Boolean(item))
      .filter(isEventActive)

    const eventByIdentifier = identifier
      ? events.find((event) => event.id === identifier || event.slug === identifier)
      : null

    if (!identifier && !code) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'MISSING_CODE',
        },
        { status: 400 }
      )
    }

    const matchedEvent = identifier
      ? eventByIdentifier && (!eventByIdentifier.accessCode || eventByIdentifier.accessCode === code)
        ? eventByIdentifier
        : null
      : events.find((event) => event.accessCode && event.accessCode === code)

    if (!matchedEvent) {
      return NextResponse.json(
        {
          ok: false,
          errorCode:
            identifier && eventByIdentifier?.accessCode
              ? 'INVALID_CODE'
              : identifier
                ? 'INVALID_EVENT'
                : 'INVALID_CODE',
        },
        { status: 404 }
      )
    }

    const redirectTo =
      isSafeReturnToPath(returnTo) &&
      (returnTo === getEventRoute(matchedEvent.slug || matchedEvent.id) ||
        returnTo === `${getEventRoute(matchedEvent.slug || matchedEvent.id)}/gallery`)
        ? returnTo
        : getEventRoute(matchedEvent.slug || matchedEvent.id)

    const cookieStore = await cookies()
    const existingCookie = cookieStore.get(EVENT_ACCESS_COOKIE_NAME)?.value

    const response = NextResponse.json({
      ok: true,
      redirectTo,
      event: matchedEvent,
    })

    await persistGuestAccessLog({
      eventId: matchedEvent.id,
      eventSlug: matchedEvent.slug || matchedEvent.id,
      email,
      source: identifier ? 'direct' : 'manual',
    })

    response.cookies.set(EVENT_ACCESS_COOKIE_NAME, grantEventAccess(existingCookie, {
      eventId: matchedEvent.id,
      eventSlug: matchedEvent.slug || matchedEvent.id,
      email,
      grantedAt: new Date().toISOString(),
    }), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 3,
    })

    return response
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'ACCESS_FAILED',
        error: error instanceof Error ? error.message : 'Event access failed.',
      },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(EVENT_ACCESS_COOKIE_NAME)
  return response
}
