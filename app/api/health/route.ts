import { NextResponse } from 'next/server'
import { getAdminAuthStatus } from '@/lib/admin-auth'
import { logOperation } from '@/lib/ops-log'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function GET() {
  const checks: Record<
    string,
    { ok: boolean; details?: Record<string, unknown> }
  > = {}

  try {
    const adminStatus = await getAdminAuthStatus()
    checks.config = {
      ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
        Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
        Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
        Boolean(process.env.NEXT_PUBLIC_APP_URL) &&
        Boolean(process.env.CRON_SECRET) &&
        Boolean(process.env.ADMIN_USERNAME) &&
        Boolean(process.env.ADMIN_PASSWORD) &&
        Boolean(process.env.ADMIN_SESSION_SECRET),
      details: {
        adminConfigured: adminStatus.configured,
        canChangePassword: adminStatus.canChangePassword,
        source: adminStatus.source,
      },
    }
  } catch (error) {
    checks.config = {
      ok: false,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }

  try {
    const supabase = createAdminSupabaseClient()
    const { error } = await supabase.from('events').select('id').limit(1)

    checks.supabase = {
      ok: !error,
      details: error ? { error: error.message } : undefined,
    }
  } catch (error) {
    checks.supabase = {
      ok: false,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }

  const ok = Object.values(checks).every((check) => check.ok)

  if (!ok) {
    logOperation('warn', 'health', 'Operational health check failed', {
      checks,
    })
  }

  return NextResponse.json(
    {
      ok,
      checks,
    },
    { status: ok ? 200 : 503 }
  )
}
