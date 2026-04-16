import { NextResponse } from 'next/server'
import {
  createAdminSession,
  getAdminAuthStatus,
  hasAdminSession,
  updateAdminPassword,
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

export async function PATCH(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Geen toegang.',
      },
      { status: 401 }
    )
  }

  const body = (await request.json().catch(() => null)) as
    | {
        currentUsername?: string
        currentPassword?: string
        nextPassword?: string
        confirmPassword?: string
      }
    | null

  const currentUsername = body?.currentUsername?.trim() || ''
  const currentPassword = body?.currentPassword || ''
  const nextPassword = body?.nextPassword || ''
  const confirmPassword = body?.confirmPassword || ''

  if (!currentUsername || !currentPassword || !nextPassword || !confirmPassword) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'MISSING_FIELDS',
        error: 'Vul alle wachtwoordvelden in.',
      },
      { status: 400 }
    )
  }

  if (nextPassword !== confirmPassword) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'PASSWORD_MISMATCH',
        error: 'De nieuwe wachtwoorden komen niet overeen.',
      },
      { status: 400 }
    )
  }

  if (nextPassword.length < 8) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: 'PASSWORD_TOO_SHORT',
        error: 'Het nieuwe wachtwoord moet minimaal 8 tekens hebben.',
      },
      { status: 400 }
    )
  }

  try {
    const result = await updateAdminPassword({
      currentUsername,
      currentPassword,
      nextPassword,
    })

    await createAdminSession()

    return NextResponse.json({
      ok: true,
      username: result.username,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Het wachtwoord kon niet worden bijgewerkt.'

    const statusCode =
      message.includes('require') || message.includes('table')
        ? 501
        : message.includes('incorrect')
          ? 401
          : 400

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: statusCode }
    )
  }
}
