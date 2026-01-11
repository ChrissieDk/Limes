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
  // Create subscription
  async createSubscription(payload: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    const response = await apiClient.post('/subscriber/create', payload)
    return response.data
  },

  // Create order
  async createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await apiClient.post('/order/create', payload)
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

  // Process pending orders (retry order creation)
  async processPendingOrders(msisdn: string): Promise<ProcessPendingOrdersResponse> {
    const response = await apiClient.post(`/order/process/${msisdn}`)
    return response.data
  },
}
