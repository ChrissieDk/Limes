import * as Sentry from "@sentry/react";

const isDev = import.meta.env.DEV;

/**
 * Reusable Sentry logger for Limes.
 *
 * Use this for all structured logging so we keep naming consistent.
 * Convention: snake_case for custom attributes.
 *
 * In development mode, all methods are no-ops to avoid
 * consuming Sentry quota from localhost.
 */

const noop = () => {};
const noopLog = {
  trace: noop,
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
  fatal: noop,
  fmt: noop,
} as const;

export const log = isDev
  ? noopLog
  : ({
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
    } as const);

/**
 * Capture an exception in Sentry.
 * No-op in development.
 */
export function captureException(
  error: Error,
  contexts?: Record<string, unknown>,
) {
  if (isDev) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Sentry.captureException(error, { contexts } as any);
}

/**
 * Set user context globally so every log, error, and trace includes it.
 * Call this after auth state is known.
 * No-op in development.
 */
export function setSentryUser(userId: string, email?: string, name?: string) {
  if (isDev) return;
  Sentry.setUser({ id: userId, email, username: name });
}

/**
 * Clear user context on logout.
 * No-op in development.
 */
export function clearSentryUser() {
  if (isDev) return;
  Sentry.setUser(null);
}
