// Paystack Payment Types

export interface PaystackReference {
  message: string
  redirecturl: string
  reference: string
  status: string
  trans: string
  transaction: string
  trxref: string
}

export interface PaystackAuthorization {
  authorization_code: string
  bin: string
  last4: string
  exp_month: string
  exp_year: string
  channel: string
  card_type: string
  bank: string
  country_code: string
  brand: string
  reusable: boolean
  signature: string
  account_name: string | null
}

export interface PaystackCustomer {
  id: number
  first_name: string | null
  last_name: string | null
  email: string
  customer_code: string
  phone: string | null
  metadata: any
  risk_action: string
}

export interface PaystackTransactionData {
  id: number
  domain: string
  status: string
  reference: string
  amount: number
  message: string | null
  gateway_response: string
  paid_at: string
  created_at: string
  channel: string
  currency: string
  ip_address: string
  metadata: {
    custom_fields?: Array<{
      display_name: string
      variable_name: string
      value: string
    }>
    [key: string]: any
  }
  fees: number
  authorization: PaystackAuthorization
  customer: PaystackCustomer
  plan?: string | null
  plan_object?: any
  subaccount?: any
  split?: any
  order_id?: any
  paidAt: string
  createdAt: string
  requested_amount: number
  transaction_date: string
}

export interface VerifyTransactionResponse {
  status: boolean
  message: string
  data: PaystackTransactionData
}

// Webhook Event Types
export type PaystackEventType = 
  | 'charge.success'
  | 'charge.dispute.create'
  | 'charge.dispute.remind'
  | 'charge.dispute.resolve'
  | 'customeridentification.failed'
  | 'customeridentification.success'
  | 'dedicatedaccount.assign.failed'
  | 'dedicatedaccount.assign.success'
  | 'invoice.create'
  | 'invoice.payment_failed'
  | 'invoice.update'
  | 'paymentrequest.pending'
  | 'paymentrequest.success'
  | 'refund.failed'
  | 'refund.pending'
  | 'refund.processed'
  | 'refund.processing'
  | 'subscription.create'
  | 'subscription.disable'
  | 'subscription.expiring_cards'
  | 'subscription.not_renew'
  | 'transfer.failed'
  | 'transfer.success'
  | 'transfer.reversed'

export interface PaystackWebhookEvent<T = any> {
  event: PaystackEventType
  data: T
}

// Subscription Types
export interface PaystackPlan {
  id: number
  name: string
  plan_code: string
  description: string
  amount: number
  interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually'
  send_invoices: boolean
  send_sms: boolean
  currency: string
}

export interface PaystackSubscription {
  customer: number
  plan: number
  integration: number
  domain: string
  start: number
  status: string
  quantity: number
  amount: number
  subscription_code: string
  email_token: string
  authorization: PaystackAuthorization
  easy_cron_id: string | null
  cron_expression: string
  next_payment_date: string
  open_invoice: string | null
  id: number
  createdAt: string
  updatedAt: string
}

// Transaction initialization request/response (SECURE - Backend controls amount)
// Backend fetches price from MVNX, frontend only provides productId and msisdn
export interface InitializeTransactionRequest {
  productId: string        // REQUIRED - Product ID to purchase (backend gets price from MVNX)
  msisdn: string | null    // OPTIONAL - Can be null for payment-first flow (MSISDN allocated after payment)
}

export interface InitializeTransactionResponse {
  success: boolean
  message: string
  data?: {
    authorization_url: string
    access_code: string
    reference: string
  }
  error?: string
}

// Dynamic Services Payment Initialization (for contract plans)
export interface DynamicServicePaymentItem {
  value: number           // The value/amount of the service (e.g., 1073741824 for bytes, 20 for minutes)
  definitionCode: string  // Service type: "DATA", "VOICE", "SMS", "WHATSAPP", "AIRTIME_ADVANCE"
  expiryDate: string      // ISO format date: "2026-07-30"
  priceInCents: number    // Price in cents (e.g., 5000 = R50)
}

export interface InitializeDynamicServicesPaymentRequest {
  msisdn: string
  services: DynamicServicePaymentItem[]
}

export interface InitializeDynamicServicesPaymentResponse {
  success: boolean
  message: string
  data?: {
    authorization_url: string
    access_code: string
    reference: string
  }
  error?: string
}

// Dynamic Services Recurring Subscription (for contract monthly plans)
export interface CreateDynamicServicesRecurringRequest {
  msisdn: string
  paymentMethodId: string  // UUID of saved card
  services: DynamicServicePaymentItem[]
}

export interface CreateDynamicServicesRecurringResponse {
  success: boolean
  message: string
  subscription?: {
    subscriptionId: string
    status: string
    nextPaymentDate: string
  }
  error?: string
}

// Payment verification request/response
export interface VerifyPaymentRequest {
  reference: string
  saveCard?: boolean  // Required TRUE for subscriptions, optional for once-off
}

export interface VerifyPaymentResponse {
  success: boolean
  message: string
  cardSaved?: boolean
  paymentMethodId?: string  // Returned when saveCard=true, needed for subscriptions
  transaction?: {
    id: number
    status: string
    reference: string
    amount: number
    currency: string
    paid_at: string
    channel: string
    authorization?: {
      authorization_code: string
      card_type: string
      last4: string
      bank: string
      reusable: boolean
    }
    customer?: {
      email: string
      customer_code: string
    }
  }
  error?: string
}

// Saved Card Types
export interface SavedCard {
  id: string
  cardType: string
  last4: string
  expMonth: string
  expYear: string
  bank: string
  brand: string
  isDefault: boolean
}

// Charge Saved Card
export interface ChargeCardRequest {
  paymentMethodId: string
  amount: number
  metadata?: {
    productId: string           // REQUIRED - SIM package product ID
    msisdn: string              // REQUIRED - ACTUAL SIM number
    planProductId?: string      // Optional - actual plan/bundle product ID
    productName?: string
    packageType?: 'contract' | 'prepaid'
    simStatus?: 'has-sim' | 'needs-sim'
  }
}

export interface ChargeCardResponse {
  success: boolean
  message: string
  transaction?: {
    id: number
    status: string
    reference: string
    amount: number
    currency: string
    paid_at: string
    channel: string
    authorization: {
      authorization_code: string
      card_type: string
      last4: string
    }
  }
  error?: string
}

// Subscription Types
export interface SubscribeRequest {
  productId: string         // Product ID (backend maps to Paystack plan code)
  paymentMethodId: string   // Saved payment method from verify response
  msisdn: string            // ACTUAL SIM phone number (NOT signup contact number)
}

export interface SubscribeResponse {
  success: boolean
  message: string
  subscription?: {
    id: string
    paystackSubscriptionCode: string
    paystackPlanCode: string
    status: string
    nextPaymentDate: string
    amountInRands: number
    currency: string
  }
  error?: string
}

export interface SubscriptionDetails {
  id: string
  paystackSubscriptionCode: string
  paystackPlanCode: string
  status: string
  nextPaymentDate: string
  amountInRands: number
  currency: string
  createdAt: string
  cancelledAt: string | null
}

export interface CancelSubscriptionRequest {
  subscriptionCode: string
  msisdn: string
  productId: string
}

export interface CancelSubscriptionResponse {
  success: boolean
  message: string
}

// Link Transaction to Order
export interface LinkTransactionToOrderRequest {
  transactionReference: string
  orderId: string
}

export interface LinkTransactionToOrderResponse {
  success: boolean
  message: string
}

// Link Transaction to Services
export interface LinkTransactionToServicesRequest {
  transactionReference: string
  serviceIds: string[]
}

export interface LinkTransactionToServicesResponse {
  success: boolean
  message: string
}
