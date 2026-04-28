
export const SHIPPING_STEP_LABELS = [
  'Order placed',
  'Warehouse',
  'Picked up',
  'In transit',
  'Out for delivery',
  'Delivered',
] as const

const STATUS_TO_STEP_INDEX: Record<string, number> = {
  ORDER_CREATED: 0,
  WAREHOUSE_PROCESSING: 1,
  PICKED_UP: 2,
  IN_TRANSIT: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERY_ATTEMPTED: 4,
  DELIVERED: 5,
}

export type ShippingExceptionKind = 'cancelled' | 'returned' | 'issue' | null

export function normalizeTrackingStatus(status: string): string {
  return status.trim().toUpperCase()
}

export function getShippingExceptionKind(status: string): ShippingExceptionKind {
  const s = normalizeTrackingStatus(status)
  if (s === 'CANCELLED') return 'cancelled'
  if (s === 'RETURNED_TO_SENDER') return 'returned'
  if (s === 'ON_HOLD' || s === 'EXCEPTION') return 'issue'
  return null
}

/**
 * Step index for the main delivery path, or null if unknown (fall back to first step + banner).
 */
export function getShippingStepIndex(status: string): number | null {
  const s = normalizeTrackingStatus(status)
  if (s in STATUS_TO_STEP_INDEX) return STATUS_TO_STEP_INDEX[s]
  return null
}

/** True when courier tried to deliver but could not complete (warning on step 4). */
export function isDeliveryAttemptedStatus(status: string): boolean {
  return normalizeTrackingStatus(status) === 'DELIVERY_ATTEMPTED'
}
