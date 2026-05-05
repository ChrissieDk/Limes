import { logEvent } from 'firebase/analytics'
import { analytics } from '../../../config/firebase'

interface PurchaseItem {
  item_id: string
  item_name: string
  price: number
  quantity?: number
  item_category?: string
}

interface TrackPurchaseParams {
  transactionId: string
  value: number
  currency?: string
  items: PurchaseItem[]
  shipping?: number
  tax?: number
  coupon?: string
  paymentType?: string
  /** Additional custom parameters */
  [key: string]: unknown
}

interface TrackBeginCheckoutParams {
  value: number
  currency?: string
  items: PurchaseItem[]
  coupon?: string
}

function buildItems(items: PurchaseItem[]) {
  return items.map((item) => ({
    item_id: item.item_id,
    item_name: item.item_name,
    price: item.price,
    quantity: item.quantity ?? 1,
    ...(item.item_category ? { item_category: item.item_category } : {}),
  }))
}

function safeLogEvent(eventName: string, params: Record<string, unknown>): void {
  if (!analytics) {
    return
  }
  logEvent(analytics, eventName, params)
}

/**
 * Track a purchase event in Firebase / Google Analytics 4.
 *
 * This fires the standard GA4 `purchase` event which will show up in:
 * - Firebase Console → Analytics → Events → purchase
 * - Google Analytics 4 → Monetization → Ecommerce purchases
 *
 * @param params - Purchase details. `value` should be in the currency's major unit (e.g. Rands, not cents).
 */
export function trackPurchase(params: TrackPurchaseParams): void {
  const eventParams = {
    transaction_id: params.transactionId,
    value: params.value,
    currency: params.currency ?? 'ZAR',
    items: buildItems(params.items),
    ...(params.shipping !== undefined ? { shipping: params.shipping } : {}),
    ...(params.tax !== undefined ? { tax: params.tax } : {}),
    ...(params.coupon ? { coupon: params.coupon } : {}),
    ...(params.paymentType ? { payment_type: params.paymentType } : {}),
  }

  safeLogEvent('purchase', eventParams)
}

/**
 * Track the beginning of a checkout in Firebase / Google Analytics 4.
 *
 * This fires the standard GA4 `begin_checkout` event. Pair it with
 * `trackPurchase` to measure checkout-to-purchase conversion funnels.
 */
export function trackBeginCheckout(params: TrackBeginCheckoutParams): void {
  const eventParams = {
    value: params.value,
    currency: params.currency ?? 'ZAR',
    items: buildItems(params.items),
    ...(params.coupon ? { coupon: params.coupon } : {}),
  }

  safeLogEvent('begin_checkout', eventParams)
}
