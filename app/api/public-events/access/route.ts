import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { hasAdminSession } from '@/lib/admin-auth'
import {
  EVENT_ACCESS_COOKIE_NAME,
  getSafeEventReturnToPath,
  grantEventAccess,
  hasEventAccess,
  isValidGuestEmail,
  normalizeEventAccessInput,
} from '@/lib/event-access'
import {
  getEventRoute,
  normalizeEventRecord,
  type NormalizedEvent,
} from '@/lib/events'
import { logOperation } from '@/lib/ops-log'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { withRetry } from '@/lib/with-retry'

export const runtime = 'nodejs'

const MARKETING_CONSENT_VERSION = 'event-access-v1'
const MARKETING_CONSENT_TEXTS = {
  nl: 'Ja, ik ontvang graag af en toe nieuws, inspiratie en aanbiedingen van EventDrop Sharing en Photobooth Holland per e-mail.',
  en: 'Yes, I would like to occasionally receive news, inspiration and offers from EventDrop Sharing and Photobooth Holland by email.',
  tr: "Evet, EventDrop Sharing ve Photobooth Holland'dan zaman zaman e-posta ile haberler, ilham veren içerikler ve teklifler almak istiyorum.",
  de: 'Ja, ich möchte gelegentlich Neuigkeiten, Inspirationen und Angebote von EventDrop Sharing und Photobooth Holland per E-Mail erhalten.',
  fr: 'Oui, je souhaite recevoir de temps en temps par e-mail des actualités, de l’inspiration et des offres d’EventDrop Sharing et de Photobooth Holland.',
} as const

type MarketingConsentLocale = keyof typeof MARKETING_CONSENT_TEXTS

function isEventActive(event: NormalizedEvent) {
  void event
  return true
}

function isMissingColumnError(error: { message?: string } | null | undefined) {
  const message = (error?.message || '').toLowerCase()

  return (
    message.includes('column') ||
    message.includes('schema cache') ||
    message.includes('could not find')
  )
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const identifiers = [
    searchParams.get('identifier'),
    searchParams.get('eventId'),
    searchParams.get('eventSlug'),
  ].filter((value): value is string => Boolean(value?.trim()))

  if (identifiers.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        hasAccess: false,
        errorCode: 'MISSING_IDENTIFIER',
      },
      { status: 400 }
    )
  }

  if (await hasAdminSession()) {
    return NextResponse.json({
      ok: true,
      hasAccess: true,
    })
  }

  const cookieStore = await cookies()
  const existingCookie = cookieStore.get(EVENT_ACCESS_COOKIE_NAME)?.value
  const hasAccess = identifiers.some((identifier) =>
    hasEventAccess(existingCookie, identifier)
  )

  return NextResponse.json(
    {
      ok: hasAccess,
      hasAccess,
    },
    { status: hasAccess ? 200 : 401 }
  )
}

async function persistGuestAccessLog(input: {
  eventId: string
  eventSlug: string
  email: string
  source: string
}) {
  try {
    const supabase = createAdminSupabaseClient()
    const richInsert = await withRetry(
      () =>
        supabase.from('guest_access_logs').insert([
          {
            event_id: input.eventId,
            event_slug: input.eventSlug || null,
            email: input.email,
            source: input.source,
          },
        ]),
      {
        attempts: 3,
        delayMs: 250,
      }
    )

    if (!richInsert.error) return

    const message = richInsert.error.message.toLowerCase()
    const canFallback =
      message.includes('column') ||
      message.includes('schema cache') ||
      message.includes('could not find')

    if (!canFallback) {
      throw richInsert.error
    }

    const fallbackInsert = await withRetry(
      () =>
        supabase.from('guest_access_logs').insert([
          {
            event_id: input.eventId,
            email: input.email,
          },
        ]),
      {
        attempts: 3,
        delayMs: 250,
      }
    )

    if (fallbackInsert.error) {
      throw fallbackInsert.error
    }
  } catch (error) {
    console.error('Failed to persist guest access log', error)
  }
}

function normalizeMarketingLocale(value: string | null | undefined) {
  const locale = (value || '').trim().toLowerCase()
  return locale in MARKETING_CONSENT_TEXTS ? (locale as MarketingConsentLocale) : 'nl'
}

function getMarketingConsentText(locale: MarketingConsentLocale) {
  return MARKETING_CONSENT_TEXTS[locale]
}

async function persistMarketingSubscriber(input: {
  email: string
  eventId: string
  locale?: string | null
}) {
  try {
    const now = new Date().toISOString()
    const supabase = createAdminSupabaseClient()
    const locale = normalizeMarketingLocale(input.locale)
    const result = await withRetry(
      () =>
        supabase.from('marketing_subscribers').upsert(
          {
            email: input.email.trim().toLowerCase(),
            consented_at: now,
            source_event_id: input.eventId,
            source: 'event-access',
            locale,
            consent_version: MARKETING_CONSENT_VERSION,
            consent_text: getMarketingConsentText(locale),
            unsubscribed_at: null,
            updated_at: now,
          },
          {
            onConflict: 'email',
          }
        ),
      {
        attempts: 3,
        delayMs: 250,
      }
    )

    if (result.error) {
      throw result.error
    }
  } catch (error) {
    logOperation('warn', 'public-access', 'Failed to persist marketing subscriber', {
      error: error instanceof Error ? error.message : 'Unknown error',
      eventId: input.eventId,
    })
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        email?: string
        code?: string
        identifier?: string
        returnTo?: string
        marketingConsent?: boolean
        locale?: string
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
    let eventByIdentifier: NormalizedEvent | null = null

    if (identifier) {
      const idLookup = await withRetry(
        () =>
          supabase
            .from('events')
            .select('*')
            .eq('id', identifier)
            .maybeSingle(),
        {
          attempts: 3,
          delayMs: 250,
        }
      )

      eventByIdentifier = normalizeEventRecord(idLookup.data)

      if (!eventByIdentifier) {
        const slugLookup = await withRetry(
          () =>
            supabase
              .from('events')
              .select('*')
              .eq('slug', identifier)
              .maybeSingle(),
          {
            attempts: 3,
            delayMs: 250,
          }
        )

        if (slugLookup.error && !isMissingColumnError(slugLookup.error)) {
          throw slugLookup.error
        }

        eventByIdentifier = normalizeEventRecord(slugLookup.data)
      }

      if (eventByIdentifier && !isEventActive(eventByIdentifier)) {
        eventByIdentifier = null
      }
    }

    if (!identifier && !code) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: 'MISSING_CODE',
        },
        { status: 400 }
      )
    }

    let matchedEvent: NormalizedEvent | null = null

    if (identifier) {
      matchedEvent = eventByIdentifier
    } else if (code) {
      const codeLookup = await withRetry(
        () =>
          supabase
            .from('events')
            .select('*')
            .eq('access_code', code)
            .order('created_at', { ascending: false })
            .limit(1),
        {
          attempts: 3,
          delayMs: 250,
        }
      )

      if (codeLookup.error && !isMissingColumnError(codeLookup.error)) {
        throw codeLookup.error
      }

      matchedEvent =
        (codeLookup.data || [])
          .map((item) => normalizeEventRecord(item))
          .filter((item): item is NormalizedEvent => Boolean(item))
          .filter(isEventActive)[0] || null

      if (!matchedEvent && isMissingColumnError(codeLookup.error)) {
        const fallbackLookup = await withRetry(
          () =>
            supabase
              .from('events')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(100),
          {
            attempts: 3,
            delayMs: 250,
          }
        )

        if (fallbackLookup.error) {
          throw fallbackLookup.error
        }

        matchedEvent =
          (fallbackLookup.data || [])
            .map((item) => normalizeEventRecord(item))
            .filter((item): item is NormalizedEvent => Boolean(item))
            .filter(isEventActive)
            .find((event) => event.accessCode === code) || null
      }
    }

    if (!matchedEvent) {
      return NextResponse.json(
        {
          ok: false,
          errorCode:
            identifier
              ? 'INVALID_EVENT'
              : 'INVALID_CODE',
        },
        { status: 404 }
      )
    }

    const redirectTo =
      getSafeEventReturnToPath(returnTo, {
        eventId: matchedEvent.id,
        eventSlug: matchedEvent.slug,
      }) || getEventRoute(matchedEvent.slug || matchedEvent.id)

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

    if (body?.marketingConsent === true) {
      await persistMarketingSubscriber({
        email,
        eventId: matchedEvent.id,
        locale: body.locale,
      })
    }

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
    logOperation('error', 'public-access', 'Event access failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      identifier,
    })
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'ACCESS_FAILED',
        error: error instanceof Error ? error.message : 'Toegang tot het evenement is niet gelukt.',
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
