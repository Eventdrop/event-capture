import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { hasAdminSession } from '@/lib/admin-auth'
import {
  EVENT_ACCESS_COOKIE_NAME,
  hasEventAccess,
} from '@/lib/event-access'
import { normalizeEventRecord, type NormalizedEvent } from '@/lib/events'
import {
  sanitizeGuestbookMessage,
  sanitizeGuestbookName,
} from '@/lib/guestbook'
import { logOperation } from '@/lib/ops-log'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { withRetry } from '@/lib/with-retry'

export const runtime = 'nodejs'

const MAX_GUESTBOOK_MESSAGE_LENGTH = 500

type GuestbookMessageRow = {
  created_at?: string | null
  guest_name?: string | null
  message?: string | null
  related_upload_id?: string | null
}

function isMissingGuestbookTableError(error: { message?: string } | null | undefined) {
  const message = (error?.message || '').toLowerCase()

  return (
    message.includes('guestbook_messages') ||
    message.includes('relation') ||
    message.includes('does not exist') ||
    message.includes('schema cache') ||
    message.includes('could not find')
  )
}

function serializeGuestbookMessage(row: GuestbookMessageRow) {
  return {
    createdAt: row.created_at || null,
    guestName: sanitizeGuestbookName(row.guest_name),
    message: sanitizeGuestbookMessage(row.message),
    relatedUploadId: row.related_upload_id || null,
  }
}

async function resolveEvent(identifier: string) {
  const supabase = createAdminSupabaseClient()
  const idLookup = await withRetry(
    () => supabase.from('events').select('*').eq('id', identifier).maybeSingle(),
    {
      attempts: 3,
      delayMs: 250,
    }
  )

  if (idLookup.error) throw idLookup.error

  let event = normalizeEventRecord(idLookup.data)

  if (!event) {
    const slugLookup = await withRetry(
      () => supabase.from('events').select('*').eq('slug', identifier).maybeSingle(),
      {
        attempts: 3,
        delayMs: 250,
      }
    )

    if (slugLookup.error) throw slugLookup.error
    event = normalizeEventRecord(slugLookup.data)
  }

  return event
}

async function authorizeEventAccess(event: NormalizedEvent) {
  if (await hasAdminSession()) return true

  const cookieStore = await cookies()
  const accessCookie = cookieStore.get(EVENT_ACCESS_COOKIE_NAME)?.value

  return (
    hasEventAccess(accessCookie, event.id) ||
    Boolean(event.slug && hasEventAccess(accessCookie, event.slug))
  )
}

async function getAuthorizedEvent(identifier: string) {
  const event = await resolveEvent(identifier)

  if (!event) {
    return {
      error: NextResponse.json(
        {
          ok: false,
          error: 'Event niet gevonden.',
        },
        { status: 404 }
      ),
      event: null,
    }
  }

  if (!(await authorizeEventAccess(event))) {
    return {
      error: NextResponse.json(
        {
          ok: false,
          error: 'Geen toegang.',
        },
        { status: 401 }
      ),
      event: null,
    }
  }

  return { error: null, event }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const identifier = (searchParams.get('event') || '').trim()

  if (!identifier) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Event is verplicht.',
      },
      { status: 400 }
    )
  }

  try {
    const { error, event } = await getAuthorizedEvent(identifier)
    if (error) return error
    if (!event) throw new Error('Authorized event missing')

    if (!event.guestbookEnabled) {
      return NextResponse.json({ ok: true, messages: [] })
    }

    const supabase = createAdminSupabaseClient()
    const result = await withRetry(
      () =>
        supabase
          .from('guestbook_messages')
          .select('guest_name,message,related_upload_id,created_at')
          .eq('event_id', event.id)
          .order('created_at', { ascending: false })
          .limit(500),
      {
        attempts: 3,
        delayMs: 250,
      }
    )

    if (result.error) {
      if (isMissingGuestbookTableError(result.error)) {
        return NextResponse.json({ ok: true, messages: [] })
      }

      throw result.error
    }

    const messages = ((result.data || []) as GuestbookMessageRow[])
      .map(serializeGuestbookMessage)
      .filter((message) => message.message)

    return NextResponse.json({ ok: true, messages })
  } catch (error) {
    logOperation('error', 'guestbook-messages', 'Failed to load guestbook messages', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        ok: false,
        error: 'Berichten konden niet worden geladen.',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        event?: string
        guestName?: string | null
        message?: string | null
        relatedUploadId?: string | null
      }
    | null
  const identifier = (body?.event || '').trim()
  const guestName = sanitizeGuestbookName(body?.guestName)
  const message = sanitizeGuestbookMessage(body?.message)
  const relatedUploadId = (body?.relatedUploadId || '').trim()

  if (!identifier) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Event is verplicht.',
      },
      { status: 400 }
    )
  }

  if (!message) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Schrijf eerst een bericht.',
      },
      { status: 400 }
    )
  }

  if (message.length > MAX_GUESTBOOK_MESSAGE_LENGTH) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Bericht is te lang.',
      },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminSupabaseClient()
    const event = await resolveEvent(identifier)

    if (!event) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Event niet gevonden.',
        },
        { status: 404 }
      )
    }

    if (!event.guestbookEnabled) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Gastenboek is uitgeschakeld.',
        },
        { status: 403 }
      )
    }

    let verifiedRelatedUploadId: string | null = null

    if (relatedUploadId) {
      const relatedUploadLookup = await withRetry(
        () =>
          supabase
            .from('uploads')
            .select('id,event_id')
            .eq('id', relatedUploadId)
            .eq('event_id', event.id)
            .maybeSingle(),
        {
          attempts: 3,
          delayMs: 250,
        }
      )

      if (relatedUploadLookup.error) throw relatedUploadLookup.error
      verifiedRelatedUploadId = relatedUploadLookup.data?.id || null
    }

    if (!verifiedRelatedUploadId && !(await authorizeEventAccess(event))) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Geen toegang.',
        },
        { status: 401 }
      )
    }

    const result = await withRetry(
      () =>
        supabase
          .from('guestbook_messages')
          .insert([
            {
              event_id: event.id,
              guest_name: guestName,
              message,
              related_upload_id: verifiedRelatedUploadId,
            },
          ])
          .select('guest_name,message,related_upload_id,created_at')
          .single(),
      {
        attempts: 3,
        delayMs: 250,
      }
    )

    if (result.error) throw result.error

    return NextResponse.json({
      ok: true,
      message: serializeGuestbookMessage(result.data as GuestbookMessageRow),
    })
  } catch (error) {
    logOperation('error', 'guestbook-messages', 'Failed to create guestbook message', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error && isMissingGuestbookTableError({ message: error.message })
            ? 'Gastenboek is nog niet ingericht.'
            : 'Bericht kon niet worden geplaatst.',
      },
      { status: 500 }
    )
  }
}
