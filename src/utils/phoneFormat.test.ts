import { describe, it, expect } from 'vitest'
import { normalizeMsisdn } from './phoneFormat'

describe('normalizeMsisdn', () => {
  it('strips non-digit characters', () => {
    expect(normalizeMsisdn('+27 82 123 4567')).toBe('27821234567')
    expect(normalizeMsisdn('082-123-4567')).toBe('0821234567')
    expect(normalizeMsisdn('(082) 123 4567')).toBe('0821234567')
  })

  it('returns digits as-is when no extra chars', () => {
    expect(normalizeMsisdn('0821234567')).toBe('0821234567')
  })

  it('handles empty string', () => {
    expect(normalizeMsisdn('')).toBe('')
  })
})
