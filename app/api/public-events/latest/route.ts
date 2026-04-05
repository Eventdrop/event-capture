import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({
      ok: true,
      event: data || null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        event: null,
        error: error instanceof Error ? error.message : 'Failed to load latest event.',
      },
      { status: 500 }
    )
  }
}
