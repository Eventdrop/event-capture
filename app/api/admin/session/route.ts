import { NextResponse } from 'next/server'
import {
  clearAdminSession,
  createAdminSession,
  getAdminAuthStatus,
  hasAdminSession,
  validateAdminCredentials,
} from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function GET() {
  const authenticated = await hasAdminSession()
  const status = await getAdminAuthStatus()

  return NextResponse.json({
    authenticated,
    configured: status.configured,
    username: status.username,
    canChangePassword: status.canChangePassword,
    source: status.source,
  })
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null

  const username = body?.username?.trim() || ''
  const password = body?.password || ''

  const status = await getAdminAuthStatus()

  if (!status.configured) {
    return NextResponse.json(
      {
        authenticated: false,
        error: 'Admin authentication is not configured on the server.',
      },
      { status: 500 }
    )
  }

  if (!(await validateAdminCredentials(username, password))) {
    return NextResponse.json(
      {
        authenticated: false,
        error: 'Invalid username or password.',
      },
      { status: 401 }
    )
  }

  await createAdminSession()

  return NextResponse.json({
    authenticated: true,
  })
}

export async function DELETE() {
  await clearAdminSession()
  return NextResponse.json({ authenticated: false })
}
