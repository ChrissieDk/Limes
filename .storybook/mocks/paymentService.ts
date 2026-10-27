// Storybook mock for src/modules/payment/services/paymentService.
// Behavior is driven by window.__PAYMENT_MOCK__ (set per-story via parameters).

type MockBehavior = {
  savedCards?: unknown[] | 'error'
  delayMs?: number
}

declare global {
  interface Window {
    __PAYMENT_MOCK__?: MockBehavior
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function getSavedCards() {
  const behavior = window.__PAYMENT_MOCK__ ?? {}
  if (behavior.savedCards === 'error') throw new Error('Failed to load saved cards')
  await delay(behavior.delayMs ?? 300)
  return (behavior.savedCards ?? defaultCards) as never[]
}

const defaultCards = [
  { id: 'card-1', brand: 'visa', last4: '4242', expMonth: "12", expYear: "2028", bank: 'Test Bank', isDefault: true },
  { id: 'card-2', brand: 'mastercard', last4: '1234', expMonth: "06", expYear: "2027", bank: 'Capitec', isDefault: false },
]

function notImplemented(name: string) {
  return async () => {
    throw new Error(`paymentService.${name} is not implemented in the Storybook mock`)
  }
}

export const paymentService = {
  getSavedCards,
  deleteSavedCard: notImplemented('deleteSavedCard'),
  setDefaultCard: notImplemented('setDefaultCard'),
  chargeSavedCard: notImplemented('chargeSavedCard'),
  initializeTransaction: notImplemented('initializeTransaction'),
  verifyPayment: notImplemented('verifyPayment'),
  getSubscription: notImplemented('getSubscription'),
  cancelSubscription: notImplemented('cancelSubscription'),
  createDynamicServicesRecurring: notImplemented('createDynamicServicesRecurring'),
  linkTransactionToOrder: notImplemented('linkTransactionToOrder'),
  linkTransactionToServices: notImplemented('linkTransactionToServices'),
}
