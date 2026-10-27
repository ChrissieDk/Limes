// Storybook stub for analytics — events are logged to the console instead of sent.

export function trackPurchase(...args: unknown[]) {
  console.log('[storybook analytics] trackPurchase', args);
}

export function trackBeginCheckout(...args: unknown[]) {
  console.log('[storybook analytics] trackBeginCheckout', args);
}

export function trackEvent(name: string, ...args: unknown[]) {
  console.log('[storybook analytics] trackEvent', name, args);
}
