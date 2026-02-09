// Subscription Types
export interface SubscriptionAddress {
  referredType: string
  addressType: string
  streetNo: string
  streetName: string
  suburb?: string
  city: string
  stateOrProvince: string
  postCode: string
  country: string
  oneLineAddress: string
}

export interface CreateSubscriptionRequest {
  productId: string
  iccid?: string  // Optional - assigned by backend when SIM is delivered
  eSim: boolean
  address: SubscriptionAddress[]
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

export interface ProcessPendingOrdersResponse {
  success: boolean
  message: string
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

// Check SIM Active Types
export interface CheckSimActiveResponse {
  msisdn: string
  isActive: boolean
  hasPendingOrders: boolean
  hasPendingDynamicServices?: boolean  // Optional for backwards compatibility
  message: string
}

// Dynamic Services Types
export interface CreateDynamicServicesRequest {
  services: Array<{
    value: number
    definitionCode: 'DATA' | 'VOICE' | 'SMS' | 'WHATSAPP' | 'GPA_CREDIT'
    expiryDate: string
  }>
}

export interface CreateDynamicServicesResponse {
  totalRequested: number
  successCount: number
  failedCount: number
  results: Array<{
    success: boolean
    id?: string
    transactionId?: string
    definitionCode: string
    value: number
    message: string
  }>
}
