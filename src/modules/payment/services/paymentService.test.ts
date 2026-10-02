import { describe, it, expect, vi, beforeEach } from 'vitest'
import { paymentService } from './paymentService'

vi.mock('../../../config/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '../../../config/api'

const mockGet = vi.mocked(apiClient.get)
const mockPost = vi.mocked(apiClient.post)
const mockPut = vi.mocked(apiClient.put)
const mockDelete = vi.mocked(apiClient.delete)

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initializeTransaction', () => {
    it('posts to /payment/paystack/initialize and returns response data', async () => {
      const payload = { productId: '123', amount: 10000, msisdn: '123' }
      const response = { success: true, data: { access_code: 'abc', reference: 'ref-1' } }
      mockPost.mockResolvedValue({ data: response })

      const result = await paymentService.initializeTransaction(payload)

      expect(mockPost).toHaveBeenCalledWith('/payment/paystack/initialize', payload)
      expect(result).toEqual(response)
    })
  })

  describe('initializeDynamicServicesPayment', () => {
    it('posts to /payment/dynamic-services/initialize and returns response data', async () => {
      const payload = { msisdn: '123', services: [] as never[] }
      const response = { success: true, data: { access_code: 'abc', reference: 'ref-1' } }
      mockPost.mockResolvedValue({ data: response })

      const result = await paymentService.initializeDynamicServicesPayment(payload)

      expect(mockPost).toHaveBeenCalledWith('/payment/dynamic-services/initialize', payload)
      expect(result).toEqual(response)
    })
  })

  describe('verifyPayment', () => {
    it('posts to /payment/paystack/verify with saveCard flag', async () => {
      const payload = { reference: 'ref-1', saveCard: true }
      const response = { success: true, message: 'Verified', cardSaved: true, paymentMethodId: 'pm-1' }
      mockPost.mockResolvedValue({ data: response })

      const result = await paymentService.verifyPayment(payload)

      expect(mockPost).toHaveBeenCalledWith('/payment/paystack/verify', payload)
      expect(result).toEqual(response)
    })
  })

  describe('getSavedCards', () => {
    it('fetches saved cards from /payment/paystack/cards', async () => {
      const cards = [
        { id: 1, last4: '4242', expMonth: '12', expYear: '2025', cardType: 'visa', bank: 'Test Bank', isDefault: true },
      ]
      mockGet.mockResolvedValue({ data: cards })

      const result = await paymentService.getSavedCards()

      expect(mockGet).toHaveBeenCalledWith('/payment/paystack/cards')
      expect(result).toEqual(cards)
    })
  })

  describe('chargeSavedCard', () => {
    it('posts charge request to /payment/paystack/charge', async () => {
      const payload = { paymentMethodId: 'pm-1', amount: 10000 }
      const response = { success: true, data: { reference: 'ref-1', status: 'success' } }
      mockPost.mockResolvedValue({ data: response })

      const result = await paymentService.chargeSavedCard(payload)

      expect(mockPost).toHaveBeenCalledWith('/payment/paystack/charge', payload)
      expect(result).toEqual(response)
    })
  })

  describe('deleteSavedCard', () => {
    it('deletes card by id', async () => {
      const response = { success: true, message: 'Deleted' }
      mockDelete.mockResolvedValue({ data: response })

      const result = await paymentService.deleteSavedCard('1')

      expect(mockDelete).toHaveBeenCalledWith('/payment/paystack/cards/1')
      expect(result).toEqual(response)
    })
  })

  describe('setDefaultCard', () => {
    it('puts to set default endpoint', async () => {
      const response = { success: true, message: 'Updated' }
      mockPut.mockResolvedValue({ data: response })

      const result = await paymentService.setDefaultCard('1')

      expect(mockPut).toHaveBeenCalledWith('/payment/paystack/cards/1/default')
      expect(result).toEqual(response)
    })
  })

  describe('createDynamicServicesRecurring', () => {
    it('posts recurring subscription to /payment/dynamic-services/recurring', async () => {
      const payload = { msisdn: '123', paymentMethodId: 'pm-1', services: [] as never[] }
      const response = { success: true, subscription: { id: 'sub-1', status: 'active' } }
      mockPost.mockResolvedValue({ data: response })

      const result = await paymentService.createDynamicServicesRecurring(payload)

      expect(mockPost).toHaveBeenCalledWith('/payment/dynamic-services/recurring', payload)
      expect(result).toEqual(response)
    })
  })

  describe('subscribeToComboBundle', () => {
    it('posts to /payment/combo-bundle/recurring', async () => {
      const payload = { productId: '123', msisdn: '123', paymentMethodId: 'pm-1', amount: 10000 }
      const response = { success: true, subscription: { id: 'sub-1', status: 'active' } }
      mockPost.mockResolvedValue({ data: response })

      const result = await paymentService.subscribeToComboBundle(payload)

      expect(mockPost).toHaveBeenCalledWith('/payment/combo-bundle/recurring', payload)
      expect(result).toEqual(response)
    })
  })

  describe('cancelSubscription', () => {
    it('posts to /payment/paystack/cancel-subscription', async () => {
      const payload = { subscriptionCode: 'sub-1', msisdn: '27612345678', productId: 'product-1' }
      const response = { success: true, message: 'Cancelled' }
      mockPost.mockResolvedValue({ data: response })

      const result = await paymentService.cancelSubscription(payload)

      expect(mockPost).toHaveBeenCalledWith('/payment/paystack/cancel-subscription', payload)
      expect(result).toEqual(response)
    })
  })

  describe('getAllSubscriptions', () => {
    it('fetches from /payment/paystack/subscriptions', async () => {
      const response = { subscriptions: [] }
      mockGet.mockResolvedValue({ data: response })

      const result = await paymentService.getAllSubscriptions()

      expect(mockGet).toHaveBeenCalledWith('/payment/paystack/subscriptions')
      expect(result).toEqual(response)
    })
  })

  describe('getSubscription', () => {
    it('fetches subscription by id', async () => {
      const response = { id: 'sub-1', status: 'active' }
      mockGet.mockResolvedValue({ data: response })

      const result = await paymentService.getSubscription('sub-1')

      expect(mockGet).toHaveBeenCalledWith('/payment/paystack/subscription/sub-1')
      expect(result).toEqual(response)
    })
  })

  describe('getTransactionHistory', () => {
    it('fetches transactions with pagination defaults', async () => {
      const response = { transactions: [], page: 1, total: 0 }
      mockGet.mockResolvedValue({ data: response })

      const result = await paymentService.getTransactionHistory()

      expect(mockGet).toHaveBeenCalledWith('/payment/transactions', { params: { page: 1, limit: 50 } })
      expect(result).toEqual(response)
    })

    it('accepts custom page and limit', async () => {
      const response = { transactions: [], page: 2, total: 100 }
      mockGet.mockResolvedValue({ data: response })

      const result = await paymentService.getTransactionHistory(2, 25)

      expect(mockGet).toHaveBeenCalledWith('/payment/transactions', { params: { page: 2, limit: 25 } })
      expect(result).toEqual(response)
    })
  })

  describe('getTransaction', () => {
    it('fetches single transaction by reference', async () => {
      const response = { reference: 'ref-1', status: 'success' }
      mockGet.mockResolvedValue({ data: response })

      const result = await paymentService.getTransaction('ref-1')

      expect(mockGet).toHaveBeenCalledWith('/payment/transactions/ref-1')
      expect(result).toEqual(response)
    })
  })

  describe('linkTransactionToOrder', () => {
    it('posts to /payment/paystack/link-transaction', async () => {
      const payload = { transactionReference: 'ref-1', orderId: 'ord-1' }
      const response = { success: true, message: 'Linked' }
      mockPost.mockResolvedValue({ data: response })

      const result = await paymentService.linkTransactionToOrder(payload)

      expect(mockPost).toHaveBeenCalledWith('/payment/paystack/link-transaction', payload)
      expect(result).toEqual(response)
    })
  })

  describe('linkTransactionToServices', () => {
    it('posts to /payment/paystack/link-transaction-to-services', async () => {
      const payload = { transactionReference: 'ref-1', serviceIds: ['svc-1'] }
      const response = { success: true, message: 'Linked' }
      mockPost.mockResolvedValue({ data: response })

      const result = await paymentService.linkTransactionToServices(payload)

      expect(mockPost).toHaveBeenCalledWith('/payment/paystack/link-transaction-to-services', payload)
      expect(result).toEqual(response)
    })
  })

  describe('requestRefund', () => {
    it('posts to /payment/refund', async () => {
      const payload = { transactionReference: 'ref-1', amountInCents: 10000, reason: 'Test' }
      const response = { success: true, message: 'Refunded' }
      mockPost.mockResolvedValue({ data: response })

      const result = await paymentService.requestRefund(payload)

      expect(mockPost).toHaveBeenCalledWith('/payment/refund', payload)
      expect(result).toEqual(response)
    })
  })
})
