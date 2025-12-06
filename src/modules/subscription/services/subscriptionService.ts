import { apiClient } from '../../../config/api'
import type { 
  CreateSubscriptionRequest, 
  CreateSubscriptionResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  GetBalancesResponse
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
}
