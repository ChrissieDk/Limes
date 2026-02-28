/**
 * Normalizes a phone number to digits-only for API requests.
 * Strips spaces, dashes, parentheses, and leading +.
 */
export function normalizeMsisdn(value: string): string {
  return value.replace(/\D/g, '')
}
