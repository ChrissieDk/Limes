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
export interface InitializeTransactionRequest {
  email: string
  amount: number // In Rands (backend converts to cents)
  metadata: {
    productId: string      // REQUIRED for order creation
    msisdn: string          // REQUIRED for order creation
    productName?: string    // Optional
    customerName?: string   // Optional
  }
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

// Payment verification request/response
export interface VerifyPaymentRequest {
  reference: string
  saveCard?: boolean  // Optional: save card for future payments
}

export interface VerifyPaymentResponse {
  success: boolean
  message: string
  cardSaved?: boolean
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
    productId: string
    msisdn: string
    productName?: string
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
  planCode: string
  paymentMethodId: string
  userTopUpId?: string
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
}

export interface CancelSubscriptionResponse {
  success: boolean
  message: string
}
