import { apiClient } from '../../../config/api'

export interface DynamicService {
  value: number
  definitionCode: 'DATA' | 'VOICE' | 'SMS' | 'WHATSAPP' | 'AIRTIME_ADVANCE'
  expiryDate: string
  priceInCents: number
}

export interface InitializeDynamicServicesPaymentRequest {
  msisdn: string
  services: DynamicService[]
}

export interface InitializeDynamicServicesPaymentResponse {
  success: boolean
  data?: {
    access_code: string
    reference: string
    authorization_url: string
  }
  error?: string
}

export interface VerifyDynamicServicesPaymentRequest {
  reference: string
  saveCard?: boolean
}

export interface VerifyDynamicServicesPaymentResponse {
  success: boolean
  data?: {
    reference: string
    amount: number
    status: string
  }
  error?: string
}

export interface ProvisionDynamicServicesRequest {
  msisdn: string
  services: DynamicService[]
}

export interface ProvisionDynamicServicesResponse {
  success: boolean
  data?: any
  error?: string
}

export interface SubscribeDynamicServicesRequest {
  msisdn: string
  paymentMethodId: string
  services: DynamicService[]
}

export interface SubscribeDynamicServicesResponse {
  success: boolean
  subscription?: {
    id: string
    status: string
  }
  error?: string
}

export const dynamicServicesPaymentService = {
  async initializePayment(
    payload: InitializeDynamicServicesPaymentRequest
  ): Promise<InitializeDynamicServicesPaymentResponse> {
    try {
      const response = await apiClient.post<InitializeDynamicServicesPaymentResponse>(
        '/payment/dynamic-services/initialize',
        payload
      )
      return response.data
    } catch (error: any) {
      console.error('[DynamicServicesPayment] Initialize error:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to initialize payment',
      }
    }
  },

  async verifyPayment(
    payload: VerifyDynamicServicesPaymentRequest
  ): Promise<VerifyDynamicServicesPaymentResponse> {
    try {
      const response = await apiClient.post<VerifyDynamicServicesPaymentResponse>(
        '/payment/paystack/verify',
        payload
      )
      return response.data
    } catch (error: any) {
      console.error('[DynamicServicesPayment] Verify error:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to verify payment',
      }
    }
  },

  async provisionServices(
    payload: ProvisionDynamicServicesRequest
  ): Promise<ProvisionDynamicServicesResponse> {
    try {
      const { msisdn, services } = payload
      const response = await apiClient.post<ProvisionDynamicServicesResponse>(
        `/Subscriber/${msisdn}/service/dynamic`,
        { msisdn, services }
      )
      return response.data
    } catch (error: any) {
      console.error('[DynamicServicesPayment] Provision error:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to provision services',
      }
    }
  },

  async subscribe(
    payload: SubscribeDynamicServicesRequest
  ): Promise<SubscribeDynamicServicesResponse> {
    try {
      const response = await apiClient.post<SubscribeDynamicServicesResponse>(
        '/payment/dynamic-services/subscribe',
        payload
      )
      return response.data
    } catch (error: any) {
      console.error('[DynamicServicesPayment] Subscribe error:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create subscription',
      }
    }
  },
}
