/**
 * Unified logger.
 * - In development: logs to console
 * - In production: silently drops debug/info logs. Error logs should go to Sentry/etc.
 */
const isDev = () => import.meta.env.DEV

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev()) console.debug('[Limes]', ...args)
  },

  info: (...args: unknown[]) => {
    if (isDev()) console.info('[Limes]', ...args)
  },

  warn: (...args: unknown[]) => {
    if (isDev()) console.warn('[Limes]', ...args)
  },

  error: (message: string, error?: unknown) => {
    if (isDev()) {
      console.error('[Limes]', message, error)
    }
    // TODO: Send to Sentry/LogRocket in production
    // Example: Sentry.captureException(error, { extra: { message } })
  },
}
