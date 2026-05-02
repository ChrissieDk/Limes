import { describe, it, expect } from 'vitest'
import { toCents, toRands, getDefaultExpiryDate, isServiceAvailable } from './dynamicPricing'

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
  it('returns a date string 30 days from now', () => {
    const result = getDefaultExpiryDate()
    const today = new Date()
    const expiry = new Date(result)
    const diffDays = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    expect(diffDays).toBe(30)
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
