/**
 * Format an ISO date string into a human-readable format.
 * Example: "2024-03-15T10:30:00Z" → "15 Mar 2024"
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
