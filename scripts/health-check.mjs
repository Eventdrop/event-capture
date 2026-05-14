const baseUrl = normalizeBaseUrl(
  process.env.HEALTHCHECK_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://upload.photoboothholland.com'
)

const checks = [
  {
    name: 'Homepage',
    path: '/',
    expectedStatuses: [200],
  },
  {
    name: 'Admin login page',
    path: '/control-room-7x',
    expectedStatuses: [200],
  },
  {
    name: 'Cleanup endpoint is protected',
    path: '/api/cleanup',
    expectedStatuses: [401],
  },
]

const timeoutMs = Number(process.env.HEALTHCHECK_TIMEOUT_MS || 15000)
const startedAt = Date.now()
const results = []

for (const check of checks) {
  results.push(await runCheck(check))
}

const failed = results.filter((result) => !result.ok)

console.log(`EventDrop health check: ${baseUrl}`)
for (const result of results) {
  const mark = result.ok ? 'OK' : 'FAIL'
  const status = result.status ? `HTTP ${result.status}` : result.error
  console.log(`${mark} ${result.name} - ${status} (${result.durationMs}ms)`)
}
console.log(`Completed in ${Date.now() - startedAt}ms`)

if (failed.length > 0) {
  console.error('\nAction needed:')
  for (const result of failed) {
    console.error(`- ${result.name}: expected ${result.expected}, got ${result.actual}`)
  }
  process.exitCode = 1
}

async function runCheck(check) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const started = Date.now()
  const url = new URL(check.path, baseUrl)

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent': 'EventDrop-health-check/1.0',
      },
    })

    const ok = check.expectedStatuses.includes(response.status)

    return {
      name: check.name,
      ok,
      status: response.status,
      expected: check.expectedStatuses.join(' or '),
      actual: response.status,
      durationMs: Date.now() - started,
    }
  } catch (error) {
    return {
      name: check.name,
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      expected: check.expectedStatuses.join(' or '),
      actual: error instanceof Error ? error.message : 'Unknown error',
      durationMs: Date.now() - started,
    }
  } finally {
    clearTimeout(timeout)
  }
}

function normalizeBaseUrl(value) {
  return value.endsWith('/') ? value : `${value}/`
}
