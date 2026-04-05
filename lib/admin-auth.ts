import { cookies } from 'next/headers'

const ADMIN_COOKIE_NAME = 'eventdrop_admin_session'

function getAdminUsername() {
  return process.env.ADMIN_USERNAME || 'admin'
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'change-me'
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'eventdrop-admin-session'
}

export function isAdminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_SESSION_SECRET
  )
}

export function validateAdminCredentials(username: string, password: string) {
  return username === getAdminUsername() && password === getAdminPassword()
}

export function getAdminSessionValue() {
  return `${getAdminUsername()}:${getAdminSessionSecret()}`
}

export async function hasAdminSession() {
  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === getAdminSessionValue()
}

export async function createAdminSession() {
  const cookieStore = await cookies()

  cookieStore.set(ADMIN_COOKIE_NAME, getAdminSessionValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
}
