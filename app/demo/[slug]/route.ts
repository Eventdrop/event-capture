import { NextResponse } from 'next/server'

import { slugifyEventName } from '@/lib/events'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const demoSlug = slugifyEventName(slug || '')

  if (!demoSlug) {
    return new NextResponse('Demo niet gevonden.', { status: 404 })
  }

  const supabase = createAdminSupabaseClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('id')
    .eq('demo_slug', demoSlug)
    .maybeSingle()

  if (error) {
    console.error('Demo link lookup failed', error)
    return new NextResponse('Demo kon niet worden geladen.', { status: 500 })
  }

  if (!event?.id) {
    return new NextResponse('Demo niet gevonden.', { status: 404 })
  }

  return NextResponse.redirect(new URL(`/event/${event.id}`, request.url))
}
