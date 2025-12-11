import { apiClient } from '../../../config/api'
import type {
  InitializeTransactionRequest,
  InitializeTransactionResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  SavedCard,
  ChargeCardRequest,
  ChargeCardResponse,
  SubscribeRequest,
  SubscribeResponse,
  SubscriptionDetails,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
} from '../../../types/payment'

export const paymentService = {
  // ============================================
  // ONCE-OFF PAYMENTS
  // ============================================

  /**
   * Initialize a transaction (Step 1)
   * Backend controls amount and returns access_code
   */
  async initializeTransaction(payload: InitializeTransactionRequest): Promise<InitializeTransactionResponse> {
    const response = await apiClient.post('/payment/paystack/initialize', payload)
    return response.data
  },

  /**
   * Verify payment after Paystack callback (Step 3)
   * Automatically creates order from metadata
   * Optionally saves card if saveCard=true
   */
  async verifyPayment(payload: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const response = await apiClient.post('/payment/paystack/verify', payload)
    return response.data
  },

  // ============================================
  // SAVED CARDS (TOKENIZATION)
  // ============================================

  /**
   * Get all saved cards for current user
   */
  async getSavedCards(): Promise<SavedCard[]> {
    const response = await apiClient.get('/payment/paystack/cards')
    return response.data
  },

  /**
   * Charge a saved card
   * Use for one-click payments without re-entering card details
   */
  async chargeSavedCard(payload: ChargeCardRequest): Promise<ChargeCardResponse> {
    const response = await apiClient.post('/payment/paystack/charge', payload)
    return response.data
  },

  /**
   * Delete a saved card
   */
  async deleteSavedCard(cardId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/payment/paystack/cards/${cardId}`)
    return response.data
  },

  /**
   * Set a card as default payment method
   */
  async setDefaultCard(cardId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put(`/payment/paystack/cards/${cardId}/default`)
    return response.data
  },

  // ============================================
  // RECURRING SUBSCRIPTIONS
  // ============================================

  /**
   * Subscribe user to a recurring plan
   * Requires a saved card
   */
  async subscribe(payload: SubscribeRequest): Promise<SubscribeResponse> {
    const response = await apiClient.post('/payment/paystack/subscribe', payload)
    return response.data
  },

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<SubscriptionDetails> {
    const response = await apiClient.get(`/payment/paystack/subscription/${subscriptionId}`)
    return response.data
  },

  /**
   * Cancel a subscription
   */
  async cancelSubscription(payload: CancelSubscriptionRequest): Promise<CancelSubscriptionResponse> {
    const response = await apiClient.post('/payment/paystack/cancel-subscription', payload)
    return response.data
  },

  // ============================================
  // TRANSACTION HISTORY (Optional)
  // ============================================

  /**
   * Get payment/transaction history for the current user
   */
  async getTransactionHistory(page = 1, limit = 50) {
    const response = await apiClient.get('/payment/transactions', {
      params: { page, limit }
    })
    return response.data
  },

  /**
   * Get specific transaction details
   */
  async getTransaction(reference: string) {
    const response = await apiClient.get(`/payment/transactions/${reference}`)
    return response.data
  },
}
