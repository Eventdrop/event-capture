import { NextResponse } from 'next/server'
import { logOperation } from '@/lib/ops-log'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    logOperation('error', 'cleanup', 'CRON_SECRET missing')
    return NextResponse.json(
      {
        ok: false,
        error: 'CRON_SECRET is not configured.',
      },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${cronSecret}`) {
    logOperation('warn', 'cleanup', 'Unauthorized cleanup request')
    return NextResponse.json(
      {
        ok: false,
        error: 'Unauthorized.',
      },
      { status: 401 }
    )
  }

  logOperation('info', 'cleanup', 'Automatic media cleanup is disabled')

  return NextResponse.json({
    ok: true,
    disabled: true,
    deletedRecords: 0,
    deletedFiles: 0,
  })
}

export const POST = GET
