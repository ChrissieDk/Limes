import { describe, it, expect } from 'vitest'
import { formatDate } from './dateFormat'

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2024-03-15T10:30:00Z')
    expect(result).toMatch(/15 Mar 2024/)
  })

  it('returns em-dash for null/undefined/empty', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('returns em-dash for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('—')
  })
})
