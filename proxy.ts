import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  EVENT_ACCESS_COOKIE_NAME,
  hasEventAccess,
} from '@/lib/event-access'

const ADMIN_COOKIE_NAME = 'eventdrop_admin_session'

function getAdminSessionValue() {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const secret = process.env.ADMIN_SESSION_SECRET || 'eventdrop-admin-session'
  return `${username}:${secret}`
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const segments = pathname.split('/').filter(Boolean)
  const identifier = segments[1]

  if (!identifier) {
    return NextResponse.next()
  }

  const adminSession = request.cookies.get(ADMIN_COOKIE_NAME)?.value

  if (adminSession === getAdminSessionValue()) {
    return NextResponse.next()
  }

  const accessCookie = request.cookies.get(EVENT_ACCESS_COOKIE_NAME)?.value

  if (hasEventAccess(accessCookie, identifier)) {
    return NextResponse.next()
  }

  const redirectUrl = new URL(`/join/${identifier}`, request.url)
  redirectUrl.searchParams.set('returnTo', pathname)

  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: ['/event/:path*'],
}
