export interface MsisdnData {
  msisdn: string
  hasActiveSubscription: boolean
  isAutoRenewing: boolean
  subscriptionStatus: string
  nextPaymentDate: string
  productId: string
  amountInCents: number
}

export interface User {
  id: string
  externalId: string
  emailAddress: string
  displayName: string
  msisdns?: MsisdnData[]
  msisdn?: string  // Primary MSISDN
  productId?: string  // Active product/plan ID
  ricaComplete?: boolean
}

export interface CreateUserRequest {
  emailAddress: string
  firstName: string
  lastName: string
}

export interface CreateUserResponse {
  emailAddress: string
  firstName: string
  lastName: string
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface SignUpData {
  phone: string
  email: string
  password: string
  confirmPassword: string
  terms: boolean
}
