// Subscription Types
export interface CreateSubscriptionRequest {
  productId: string
  iccid: string
  eSim: boolean
}

export interface CreateSubscriptionResponse {
  success?: boolean
  subscriptionId?: string
  message?: string
  [key: string]: any
}

// Order Types
export interface OrderProduct {
  id: string
  amount: number
}

export interface CreateOrderRequest {
  products: OrderProduct[]
  msisdn: string
}

export interface CreateOrderResponse {
  success?: boolean
  orderId?: string
  message?: string
  [key: string]: any
}
