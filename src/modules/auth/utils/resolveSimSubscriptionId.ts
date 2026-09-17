import { normalizeMsisdn } from '../../../utils/phoneFormat'
import type { Subscription } from '../../../types/payment'

type SubscriptionLookup = Pick<Subscription, 'id' | 'msisdn' | 'isActive' | 'status' | 'productId' | 'hasDynamicServices'>

/** SIM package products are not a chosen monthly plan — prepaid SIMs keep Choose Plan. */
const SIM_PACKAGE_PRODUCT_IDS = new Set([
  '7029225P',
  '7025225P',
  '7027225P',
  '7023225P',
  '7024225P',
])

const PREPAID_MONTHLY_PRODUCT_IDS = new Set(['40021', '40022'])

function safeNormalizeMsisdn(value: string | null | undefined): string {
  if (!value) return ''
  return normalizeMsisdn(value)
}

function isAllocatedMonthlyPlan(subscription: SubscriptionLookup): boolean {
  if (!subscription.isActive) return false
  if (subscription.status !== 'active' && subscription.status !== 'past_due') return false
  if (subscription.productId && SIM_PACKAGE_PRODUCT_IDS.has(subscription.productId)) return false

  if (subscription.hasDynamicServices || subscription.productId === 'DYNAMIC_SERVICES') return true
  if (subscription.productId && PREPAID_MONTHLY_PRODUCT_IDS.has(subscription.productId)) return true
  // Combo and other recurring catalog plans use non-SIM product IDs
  return Boolean(subscription.productId)
}

/**
 * Resolve the subscription id that should hide Choose Plan for a SIM.
 * Source of truth is GET /payment/paystack/subscriptions: only an allocated
 * monthly plan (dynamic, combo, or prepaid monthly) hides the button.
 * GET /user.subscriptionId is not used — it is not a reliable "has chosen a
 * plan" signal for prepaid SIMs.
 */
export function resolveSimSubscriptionId(
  msisdn: string,
  _userSubscriptionId: string | null | undefined,
  subscriptions: readonly SubscriptionLookup[]
): string | null {
  const normalizedMsisdn = safeNormalizeMsisdn(msisdn)
  if (!normalizedMsisdn) return null

  const match = subscriptions.find((subscription) => {
    const subscriptionMsisdn = safeNormalizeMsisdn(subscription.msisdn)
    return (
      Boolean(subscriptionMsisdn) &&
      isAllocatedMonthlyPlan(subscription) &&
      subscriptionMsisdn === normalizedMsisdn
    )
  })

  return match?.id ?? null
}
