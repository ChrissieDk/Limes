import * as Sentry from '@sentry/react'

/**
 * Reusable Sentry logger for Limes.
 *
 * Use this for all structured logging so we keep naming consistent.
 * Convention: snake_case for custom attributes.
 *
 * Examples:
 *   log.info('checkout_completed', { order_id, user_id, cart_value })
 *   log.error('payment_failed', { reason: 'card_declined', order_id })
 */

export const log = {
  trace: (msg: string, attrs?: Record<string, string | number | boolean>) =>
    Sentry.logger.trace(msg, attrs),

  debug: (msg: string, attrs?: Record<string, string | number | boolean>) =>
    Sentry.logger.debug(msg, attrs),

  info: (msg: string, attrs?: Record<string, string | number | boolean>) =>
    Sentry.logger.info(msg, attrs),

  warn: (msg: string, attrs?: Record<string, string | number | boolean>) =>
    Sentry.logger.warn(msg, attrs),

  error: (msg: string, attrs?: Record<string, string | number | boolean>) =>
    Sentry.logger.error(msg, attrs),

  fatal: (msg: string, attrs?: Record<string, string | number | boolean>) =>
    Sentry.logger.fatal(msg, attrs),

  /** Parameterized log — values become searchable attributes automatically */
  fmt: Sentry.logger.fmt,
} as const

/**
 * Set user context globally so every log, error, and trace includes it.
 * Call this after auth state is known.
 */
export function setSentryUser(userId: string, email?: string, name?: string) {
  Sentry.setUser({ id: userId, email, username: name })
}

/**
 * Clear user context on logout.
 */
export function clearSentryUser() {
  Sentry.setUser(null)
}
