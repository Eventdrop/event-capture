import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  EVENT_ACCESS_COOKIE_NAME,
  parseEventAccessCookie,
} from '@/lib/event-access'
import { normalizeEventRecord } from '@/lib/events'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

const allowedActivities = new Set(['poster', 'story'])

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    eventIdentifier?: string
    activity?: string
    itemCount?: number
  } | null
  const eventIdentifier = body?.eventIdentifier?.trim() || ''
  const activity = body?.activity?.trim() || ''

  if (!eventIdentifier || !allowedActivities.has(activity)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()
  const idLookup = await supabase.from('events').select('*').eq('id', eventIdentifier).maybeSingle()
  const slugLookup = !idLookup.data
    ? await supabase.from('events').select('*').eq('slug', eventIdentifier).maybeSingle()
    : null
  const event = normalizeEventRecord(idLookup.data || slugLookup?.data || null)

  if (!event) return NextResponse.json({ ok: false }, { status: 404 })

  const cookieStore = await cookies()
  const grants = parseEventAccessCookie(cookieStore.get(EVENT_ACCESS_COOKIE_NAME)?.value)
  const email = grants.find((grant) => grant.eventId === event.id)?.email || null
  const { error } = await supabase.from('download_logs').insert([{
    event_id: event.id,
    email,
    download_type: activity,
    item_count: Math.max(0, Math.floor(Number(body?.itemCount || 0))),
  }])

  if (error) return NextResponse.json({ ok: false }, { status: 500 })
  return NextResponse.json({ ok: true })
}
