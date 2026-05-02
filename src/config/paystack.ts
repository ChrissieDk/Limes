/**
 * Paystack Configuration
 * 
 * Public key for frontend Paystack integration
 * Get from: https://dashboard.paystack.com/settings/developer
 */

const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY

if (!publicKey) {
  console.error('VITE_PAYSTACK_PUBLIC_KEY is not set in environment variables')
}

export const paystackConfig = {
  publicKey: publicKey || '',
}
