import { describe, it, expect, vi, afterEach } from 'vitest'
import { toCents, toRands, getDefaultExpiryDate, isServiceAvailable, calculateTieredCost, convertRandsToServiceValue } from './dynamicPricing'
import { dataBrackets, smsBrackets, voiceBrackets } from '../config/ratingTable'

describe('toCents', () => {
  it('converts Rands to cents', () => {
    expect(toCents(150)).toBe(15000)
    expect(toCents(0)).toBe(0)
    expect(toCents(199.99)).toBe(19999)
  })
})

describe('toRands', () => {
  it('converts cents to Rands', () => {
    expect(toRands(15000)).toBe(150)
    expect(toRands(0)).toBe(0)
    expect(toRands(19999)).toBe(199.99)
  })
})

describe('getDefaultExpiryDate', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the calendar date 30 days from now', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00.000Z'))

    expect(getDefaultExpiryDate()).toBe('2026-02-14')
  })
})

describe('isServiceAvailable', () => {
  it('returns true for DATA on prepaid', () => {
    expect(isServiceAvailable('DATA', 'prepaid')).toBe(true)
  })

  it('returns true for AIRTIME on prepaid', () => {
    expect(isServiceAvailable('AIRTIME', 'prepaid')).toBe(true)
  })

  it('returns true when pricing brackets exist regardless of package type', () => {
    // DATA has pricing brackets for both prepaid and contract
    expect(isServiceAvailable('DATA', 'contract')).toBe(true)
    expect(isServiceAvailable('DATA', 'prepaid')).toBe(true)
  })

  it('returns false when no pricing brackets exist', () => {
    expect(isServiceAvailable('MMS', 'prepaid')).toBe(false)
    expect(isServiceAvailable('UNKNOWN' as 'DATA', 'prepaid')).toBe(false)
  })
})

describe('build-your-own slider rates', () => {
  it('prices data at R0.10 per MB', () => {
    expect(calculateTieredCost(100, dataBrackets)).toBeCloseTo(10)
    expect(convertRandsToServiceValue('DATA', 10)).toBe(100 * 1048576)
  })

  it('prices voice at R0.59 per minute', () => {
    expect(calculateTieredCost(1, voiceBrackets)).toBeCloseTo(0.59)
    expect(convertRandsToServiceValue('VOICE', 0.59)).toBe(60)
  })

  it('prices SMS at R0.25 per message', () => {
    expect(calculateTieredCost(4, smsBrackets)).toBeCloseTo(1)
    expect(convertRandsToServiceValue('SMS', 1)).toBe(4)
  })
})
