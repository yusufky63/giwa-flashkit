import { FlashRateLimitError } from '../errors/errors'

export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffFactor?: number
  signal?: AbortSignal
}

export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3
  const initialDelay = options.initialDelayMs ?? 150
  const maxDelay = options.maxDelayMs ?? 2000
  const backoffFactor = options.backoffFactor ?? 2
  const signal = options.signal

  let attempt = 0

  while (true) {
    if (signal?.aborted) {
      throw new Error('Operation aborted')
    }

    try {
      return await fn()
    } catch (error) {
      attempt++
      const errorMessage = error instanceof Error ? error.message : String(error)
      const is429 = errorMessage.includes('429') || errorMessage.includes('rate limit')

      if (attempt > maxRetries) {
        if (is429) {
          throw new FlashRateLimitError(`Exceeded maximum retries (${maxRetries}) due to rate limiting.`, { cause: error })
        }
        throw error
      }

      // Calculate exponential backoff with jitter
      const exponentialDelay = initialDelay * Math.pow(backoffFactor, attempt - 1)
      const jitter = Math.random() * (initialDelay * 0.5)
      const delay = Math.min(exponentialDelay + jitter, maxDelay)

      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => resolve(), delay)
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new Error('Operation aborted'))
          }, { once: true })
        }
      })
    }
  }
}
