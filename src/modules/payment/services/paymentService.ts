import { apiClient } from '../../../config/api'
import type {
  InitializeTransactionRequest,
  InitializeTransactionResponse,
  InitializeDynamicServicesPaymentRequest,
  InitializeDynamicServicesPaymentResponse,
  InitializeComboPaymentRequest,
  InitializeComboPaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  SavedCard,
  ChargeCardRequest,
  ChargeCardResponse,
  SubscriptionDetails,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  CreateDynamicServicesRecurringRequest,
  CreateDynamicServicesRecurringResponse,
  LinkTransactionToOrderRequest,
  LinkTransactionToOrderResponse,
  LinkTransactionToServicesRequest,
  LinkTransactionToServicesResponse,
  GetSubscriptionsResponse,
  ComboSubscriptionRequest,
  ComboSubscriptionResponse,
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
   * Initialize dynamic services payment (Step 1 for contract plans)
   * Used for contract plans where user selects service allocations
   */
  async initializeDynamicServicesPayment(payload: InitializeDynamicServicesPaymentRequest): Promise<InitializeDynamicServicesPaymentResponse> {
    if (import.meta.env.DEV) {
      console.log('[Payment] initializeDynamicServicesPayment payload:', payload)
    }
    const response = await apiClient.post('/payment/dynamic-services/initialize', payload)
    return response.data
  },

  /**
   * Initialize combo bundle payment (Step 1 for m2m_combo packages)
   * Used for combo bundles where MVNX catalog shows price: 0 but frontend knows actual price
   * Amount is sent in CENTS (e.g., 15000 = R150.00)
   */
  async initializeComboPayment(payload: InitializeComboPaymentRequest): Promise<InitializeComboPaymentResponse> {
    const response = await apiClient.post('/payment/paystack/initialize-combo', payload)
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
   * Create recurring dynamic services subscription (for ALL monthly plans)
   * Replaces the old /payment/paystack/subscribe endpoint
   * Requires a saved card
   */
  async createDynamicServicesRecurring(payload: CreateDynamicServicesRecurringRequest): Promise<CreateDynamicServicesRecurringResponse> {
    if (import.meta.env.DEV) {
      console.log('[Payment] createDynamicServicesRecurring payload:', payload)
    }
    const response = await apiClient.post('/payment/dynamic-services/recurring', payload)
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

  /**
   * Get all subscriptions for authenticated user
   * NEW: Replaces parsing subscriptions from GetUser
   */
  async getAllSubscriptions(): Promise<GetSubscriptionsResponse> {
    const response = await apiClient.get('/payment/paystack/subscriptions')
    return response.data
  },

  /**
   * Subscribe to combo bundle (recurring)
   * NEW: For recurring combo bundle subscriptions
   */
  async subscribeToComboBundle(payload: ComboSubscriptionRequest): Promise<ComboSubscriptionResponse> {
    const response = await apiClient.post('/payment/combo-bundle/recurring', payload)
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

  // ============================================
  // TRANSACTION LINKING (New Backend Flow)
  // ============================================

  /**
   * Link transaction to order
   * Must be called after order creation to link payment to order
   */
  async linkTransactionToOrder(payload: LinkTransactionToOrderRequest): Promise<LinkTransactionToOrderResponse> {
    const response = await apiClient.post('/payment/paystack/link-transaction', payload)
    return response.data
  },

  /**
   * Link transaction to dynamic services
   * Must be called after dynamic service creation to link payment to services
   */
  async linkTransactionToServices(payload: LinkTransactionToServicesRequest): Promise<LinkTransactionToServicesResponse> {
    const response = await apiClient.post('/payment/paystack/link-transaction-to-services', payload)
    return response.data
  },
}
