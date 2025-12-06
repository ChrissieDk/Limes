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

// Balance Types
export interface BalanceFormattedParts {
  value: string
  initialValue: string
  formatted: string
  remainingPercent?: number
  progressPercent: number
  remaining?: string
  append?: string
  prepend: string
  used: number
  symbol: string
}

export interface Balance {
  balanceDefinitionId: string
  balanceName: string
  initialValue: string
  value: string
  formatted: string
  grouping: string
  rewards: string
  definitionName: string
  definitionCode: string
  progress: number
  displayOrder: number
  formattedParts: BalanceFormattedParts
  isVisible?: boolean
}

export interface GetBalancesResponse {
  balances: Balance[]
}
