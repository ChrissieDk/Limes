/**
 * Extract a human-readable error message from an Axios-like error object.
 * Falls back through response.data.message → response.data.error → error.message → defaultMessage.
 */
export function getAxiosErrorMessage(
  error: unknown,
  defaultMessage = 'Something went wrong'
): string {
  if (error && typeof error === 'object') {
    const anyErr = error as {
      response?: { data?: { message?: string; error?: string } }
      message?: string
    }
    return (
      anyErr.response?.data?.message ||
      anyErr.response?.data?.error ||
      anyErr.message ||
      defaultMessage
    )
  }
  return defaultMessage
}
