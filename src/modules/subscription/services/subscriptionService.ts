import { apiClient } from '../../../config/api'
import type { 
  CreateSubscriptionRequest, 
  CreateSubscriptionResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  GetBalancesResponse,
  CheckSimActiveResponse,
  ProcessPendingOrdersResponse
} from '../../../types'

export const subscriptionService = {
  // Create subscription (with extended timeout due to backend processing time)
  async createSubscription(payload: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    const response = await apiClient.post('/subscriber/create', payload, {
      timeout: 40000, // 40 seconds timeout for subscriber creation
    })
    return response.data
  },

  // Create order (with extended timeout for backend processing)
  async createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await apiClient.post('/order/create', payload, {
      timeout: 40000, // 40 seconds timeout for order creation
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
    const response = await apiClient.post(`/order/process/${msisdn}`, {}, {
      timeout: 40000, // 40 seconds timeout for order processing
    })
    return response.data
  },
}
