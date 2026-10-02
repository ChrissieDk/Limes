import { describe, expect, it } from 'vitest'
import { resolveSimSubscriptionId } from './resolveSimSubscriptionId'
import type { Subscription } from '../../../types/payment'

const baseSubscription = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: 'sub-1',
  paystackSubscriptionCode: 'PSC_1',
  paystackPlanCode: 'PLN_1',
  status: 'active',
  nextPaymentDate: '2026-10-01',
  amountInRands: 199,
  amountInCents: 19900,
  currency: 'ZAR',
  createdAt: '2026-09-01',
  cancelledAt: null,
  productId: 'DYNAMIC_SERVICES',
  msisdn: '27612345678',
  hasDynamicServices: true,
  isActive: true,
  ...overrides,
})

describe('resolveSimSubscriptionId', () => {
  it('sets the id from an active monthly subscription when GET /user has none', () => {
    const subscriptions = [baseSubscription({ id: 'sub-from-api' })]

    expect(resolveSimSubscriptionId('27612345678', null, subscriptions)).toBe('sub-from-api')
  })

  it('keeps a cancelled-only subscription from hiding Choose Plan', () => {
    const subscriptions = [
      baseSubscription({
        id: 'sub-cancelled',
        status: 'cancelled',
        isActive: false,
        cancelledAt: '2026-09-15',
      }),
    ]

    expect(resolveSimSubscriptionId('27612345678', null, subscriptions)).toBeNull()
  })

  it('does not hide Choose Plan based on GET /user.subscriptionId alone', () => {
    const subscriptions = [
      baseSubscription({
        id: 'sub-sim-package',
        productId: '7029225P',
        hasDynamicServices: false,
      }),
    ]

    expect(resolveSimSubscriptionId('27612345678', 'sub-from-user', subscriptions)).toBeNull()
  })

  it('matches MSISDNs after normalizing formatting differences', () => {
    const subscriptions = [baseSubscription({ id: 'sub-formatted', msisdn: '+27 61 234 5678' })]

    expect(resolveSimSubscriptionId('27612345678', undefined, subscriptions)).toBe('sub-formatted')
  })

  it('treats a past_due active subscription as allocated', () => {
    const subscriptions = [baseSubscription({ id: 'sub-past-due', status: 'past_due' })]

    expect(resolveSimSubscriptionId('27612345678', null, subscriptions)).toBe('sub-past-due')
  })

  it('does not treat a prepaid SIM package subscription as a chosen plan', () => {
    const subscriptions = [
      baseSubscription({
        id: 'sub-sim-package',
        productId: '7029225P',
        hasDynamicServices: false,
      }),
    ]

    expect(resolveSimSubscriptionId('27612345678', null, subscriptions)).toBeNull()
  })

  it('treats a combo or catalog recurring plan as allocated', () => {
    const subscriptions = [
      baseSubscription({
        id: 'sub-combo',
        productId: 'combo-199',
        hasDynamicServices: false,
      }),
    ]

    expect(resolveSimSubscriptionId('27612345678', null, subscriptions)).toBe('sub-combo')
  })

  it('ignores subscriptions with a missing MSISDN instead of matching every SIM', () => {
    const subscriptions = [
      baseSubscription({
        id: 'sub-no-msisdn',
        msisdn: '',
      }),
    ]

    expect(resolveSimSubscriptionId('27612345678', null, subscriptions)).toBeNull()
  })
})
