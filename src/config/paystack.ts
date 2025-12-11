/**
 * Paystack Configuration
 * 
 * Public key for frontend Paystack integration
 * Get from: https://dashboard.paystack.com/settings/developer
 */

export const paystackConfig = {
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_a64167b519a4785577c679768f9b2927a835d714',
}

// Validate config on load
if (!paystackConfig.publicKey) {
  console.error('VITE_PAYSTACK_PUBLIC_KEY is not set in environment variables')
}
