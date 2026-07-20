export interface MsisdnData {
  msisdn: string
  simDescription?: string
  hasActiveSubscription: boolean
  isAutoRenewing: boolean
  subscriptionStatus: string
  nextPaymentDate: string
  productId: string
  amountInCents: number
  subscriptionId?: string | null
  // BACKEND TODO: Add explicit packageType so frontend can reliably distinguish
  // prepaid from contract users without guessing from productId.
  packageType?: 'prepaid' | 'contract'
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


