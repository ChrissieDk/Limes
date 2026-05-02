import { describe, it, expect } from 'vitest'
import { userHasProvisionedSim } from './userProvisioning'
import type { User, MsisdnData } from '../../../types'

const baseUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  externalId: 'ext-1',
  emailAddress: 'test@example.com',
  displayName: 'Test User',
  ...overrides,
})

const mockMsisdn = (msisdn: string): MsisdnData => ({
  msisdn,
  hasActiveSubscription: true,
  isAutoRenewing: false,
  subscriptionStatus: 'active',
})

describe('userHasProvisionedSim', () => {
  it('returns true when user has MSISDNs', () => {
    const user = baseUser({ msisdns: [mockMsisdn('27612345678')] })
    expect(userHasProvisionedSim(user)).toBe(true)
  })

  it('returns false when msisdns is empty', () => {
    const user = baseUser({ msisdns: [] })
    expect(userHasProvisionedSim(user)).toBe(false)
  })

  it('returns false when msisdns is undefined', () => {
    const user = baseUser()
    expect(userHasProvisionedSim(user)).toBe(false)
  })

  it('returns true for multiple MSISDNs', () => {
    const user = baseUser({
      msisdns: [mockMsisdn('27612345678'), mockMsisdn('27687654321')],
    })
    expect(userHasProvisionedSim(user)).toBe(true)
  })
})
