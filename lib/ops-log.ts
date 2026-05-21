type LogLevel = 'info' | 'warn' | 'error'

function formatValue(value: unknown) {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function logOperation(
  level: LogLevel,
  scope: string,
  message: string,
  details?: Record<string, unknown>
) {
  const payload = details
    ? Object.entries(details)
        .map(([key, value]) => `${key}=${formatValue(value)}`)
        .filter(Boolean)
        .join(' ')
    : ''

  const line = payload ? `[${scope}] ${message} ${payload}` : `[${scope}] ${message}`

  if (level === 'error') {
    console.error(line)
    return
  }

  if (level === 'warn') {
    console.warn(line)
    return
  }

  console.log(line)
}
