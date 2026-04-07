import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

const ADMIN_COOKIE_NAME = 'eventdrop_admin_session'
const ADMIN_CREDENTIALS_ROW_ID = 'primary'

type AdminCredentialSource = 'env' | 'database'

type StoredAdminCredentials = {
  username: string
  passwordHash: string
  source: AdminCredentialSource
}

function getEnvAdminUsername() {
  return process.env.ADMIN_USERNAME || 'admin'
}

function getEnvAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'change-me'
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'eventdrop-admin-session'
}

function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const derivedKey = scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${derivedKey}`
}

function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split('$')

  if (algorithm !== 'scrypt' || !salt || !hash) {
    return false
  }

  const computed = scryptSync(password, salt, 64)
  const stored = Buffer.from(hash, 'hex')

  if (computed.length !== stored.length) {
    return false
  }

  return timingSafeEqual(computed, stored)
}

function isMissingTableError(error: unknown) {
  if (!(error instanceof Error)) return false

  const message = error.message.toLowerCase()
  return (
    message.includes('relation') ||
    message.includes('does not exist') ||
    message.includes('schema cache') ||
    message.includes('could not find') ||
    message.includes('column')
  )
}

function isMissingAdminDatabaseConfig(error: unknown) {
  if (!(error instanceof Error)) return false

  const message = error.message.toLowerCase()
  return (
    message.includes('missing next_public_supabase_url') ||
    message.includes('missing next_public_supabase_url or supabase_service_role_key')
  )
}

async function loadDatabaseAdminCredentials() {
  try {
    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from('admin_credentials')
      .select('username,password_hash')
      .eq('id', ADMIN_CREDENTIALS_ROW_ID)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data?.username || !data?.password_hash) {
      return null
    }

    return {
      username: String(data.username),
      passwordHash: String(data.password_hash),
      source: 'database' as const,
    }
  } catch (error) {
    if (isMissingTableError(error) || isMissingAdminDatabaseConfig(error)) {
      return null
    }

    throw error
  }
}

async function getStoredAdminCredentials(): Promise<StoredAdminCredentials | null> {
  const databaseCredentials = await loadDatabaseAdminCredentials()

  if (databaseCredentials) {
    return databaseCredentials
  }

  if (
    process.env.ADMIN_USERNAME &&
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_SESSION_SECRET
  ) {
    return {
      username: getEnvAdminUsername(),
      passwordHash: hashPassword(getEnvAdminPassword(), 'env-admin-credential'),
      source: 'env',
    }
  }

  return null
}

async function getAdminSessionValue() {
  const credentials = await getStoredAdminCredentials()

  if (!credentials) return null

  return createHash('sha256')
    .update(`${credentials.username}:${credentials.passwordHash}:${getAdminSessionSecret()}`)
    .digest('hex')
}

export async function getAdminAuthStatus() {
  const credentials = await getStoredAdminCredentials()

  return {
    configured: Boolean(credentials),
    username: credentials?.username || '',
    source: credentials?.source || null,
    canChangePassword: credentials?.source === 'database',
  }
}

export async function isAdminAuthConfigured() {
  const status = await getAdminAuthStatus()
  return status.configured
}

export async function validateAdminCredentials(username: string, password: string) {
  const credentials = await getStoredAdminCredentials()

  if (!credentials) {
    return false
  }

  if (username !== credentials.username) {
    return false
  }

  return verifyPassword(password, credentials.passwordHash)
}

export async function hasAdminSession() {
  const cookieStore = await cookies()
  const expectedValue = await getAdminSessionValue()

  if (!expectedValue) return false

  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === expectedValue
}

export async function createAdminSession() {
  const cookieStore = await cookies()
  const sessionValue = await getAdminSessionValue()

  if (!sessionValue) {
    throw new Error('Admin authentication is not configured on the server.')
  }

  cookieStore.set(ADMIN_COOKIE_NAME, sessionValue, {
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

export async function updateAdminPassword(input: {
  currentUsername: string
  currentPassword: string
  nextPassword: string
}) {
  const credentials = await getStoredAdminCredentials()

  if (!credentials) {
    throw new Error('Admin authentication is not configured on the server.')
  }

  if (credentials.source !== 'database') {
    throw new Error(
      'Password changes require the public.admin_credentials table in Supabase.'
    )
  }

  if (input.currentUsername !== credentials.username) {
    throw new Error('Current username is incorrect.')
  }

  if (!verifyPassword(input.currentPassword, credentials.passwordHash)) {
    throw new Error('Current password is incorrect.')
  }

  const nextPasswordHash = hashPassword(input.nextPassword)
  const supabase = createAdminSupabaseClient()
  const { error } = await supabase.from('admin_credentials').upsert(
    [
      {
        id: ADMIN_CREDENTIALS_ROW_ID,
        username: credentials.username,
        password_hash: nextPasswordHash,
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: 'id' }
  )

  if (error) {
    throw new Error(error.message)
  }

  return {
    username: credentials.username,
  }
}
