import { apiClient } from '../../../config/api'
import type { 
  CreateSubscriptionRequest, 
  CreateSubscriptionResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  GetBalancesResponse,
  CheckSimActiveResponse,
  ProcessPendingOrdersResponse,
  CreateDynamicServicesRequest,
  CreateDynamicServicesResponse
} from '../../../types'

export const subscriptionService = {
  // Create subscription (with extended timeout due to backend processing time)
  async createSubscription(payload: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    const response = await apiClient.post('/subscriber/create', payload, {
      timeout: 120000, // 2 minutes timeout for subscriber creation
    })
    return response.data
  },

  // Create order (with extended timeout for backend processing)
  async createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await apiClient.post('/order/create', payload, {
      timeout: 120000, // 2 minutes timeout for order creation
    })
    return response.data
  },

  // Get subscriber balances
  async getBalances(msisdn: string): Promise<GetBalancesResponse> {
    const response = await apiClient.get(`/subscriber/${msisdn}/balance`)
    return response.data
  },

  // Check if SIM is active
  async checkSimActive(msisdn: string): Promise<CheckSimActiveResponse> {
    const response = await apiClient.get(`/subscriber/${msisdn}/is-active`)
    return response.data
  },

  // Process pending orders (retry order creation) - extended timeout for backend processing
  async processPendingOrders(msisdn: string): Promise<ProcessPendingOrdersResponse> {
    const response = await apiClient.post(`/order/pending/${msisdn}/process`, {}, {
      timeout: 120000, // 2 minutes timeout for order processing
    })
    return response.data
  },

  // Process pending dynamic services - extended timeout for backend processing
  async processPendingDynamicServices(msisdn: string): Promise<ProcessPendingOrdersResponse> {
    const response = await apiClient.post(`/subscriber/${msisdn}/service/dynamic/pending/process`, {}, {
      timeout: 120000, // 2 minutes timeout for dynamic service processing
    })
    return response.data
  },

  // Create dynamic services for a subscriber (with extended timeout)
  async createDynamicServices(msisdn: string, payload: CreateDynamicServicesRequest): Promise<CreateDynamicServicesResponse> {
    if (import.meta.env.DEV) {
      console.log('[Subscription] createDynamicServices request:', { msisdn, payload })
    }
    const response = await apiClient.post(`/subscriber/${msisdn}/service/dynamic`, payload, {
      timeout: 120000, // 2 minutes timeout for dynamic service creation
    })
    return response.data
  },

  // Store pending order (when SIM is not yet active)
  async storePendingOrder(payload: {
    msisdn: string
    productId: string
    productAmount: number
    paymentReference: string
  }): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/order/pending', payload, {
      timeout: 120000, // 2 minutes timeout for storing pending order
    })
    return response.data
  },

  // Store pending dynamic service (when SIM is not yet active)
  async storePendingDynamicService(msisdn: string, payload: {
    definitionCode: 'DATA' | 'VOICE' | 'SMS' | 'WHATSAPP' | 'GPA_CREDIT'
    value: number
    priceInCents: number
    expiryDate: string
    paymentReference: string
  }): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/subscriber/${msisdn}/service/dynamic/pending`, payload, {
      timeout: 120000, // 2 minutes timeout for storing pending dynamic service
    })
    return response.data
  },
}
