import { apiClient } from '../../../config/api'
import type { 
  CreateSubscriptionRequest, 
  CreateSubscriptionResponse,
  CreateOrderRequest,
  CreateOrderResponse
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
}
