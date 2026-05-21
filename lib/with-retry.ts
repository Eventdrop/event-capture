type RetryOptions = {
  attempts?: number
  delayMs?: number
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withRetry<T>(
  operation: () => PromiseLike<T> | T,
  options: RetryOptions = {}
) {
  const attempts = Math.max(1, options.attempts || 1)
  const delayMs = Math.max(0, options.delayMs || 0)
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (attempt < attempts && delayMs > 0) {
        await sleep(delayMs * attempt)
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Operation failed.')
}
