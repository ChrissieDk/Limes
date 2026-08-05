import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { warehouseService } from './warehouseService'

vi.mock('../../../config/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

import { apiClient } from '../../../config/api'

const mockGet = vi.mocked(apiClient.get)

describe('warehouseService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('getProofOfDelivery', () => {
    it('returns mock POD when mock is enabled via localStorage', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('true')

      const result = await warehouseService.getProofOfDelivery('order-1')

      expect(mockGet).not.toHaveBeenCalled()
      expect(result).toHaveProperty('orderId')
      expect(result).toHaveProperty('deliveryPhoto')
    })

    it('fetches real POD when mock is disabled', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)
      const response = { orderId: 'order-1', podImageUrl: 'https://example.com/pod.jpg', deliveredAt: '2024-01-01' }
      mockGet.mockResolvedValue({ data: response })

      const result = await warehouseService.getProofOfDelivery('order-1')

      expect(mockGet).toHaveBeenCalledWith('/warehouse/tracking/order-1/pod')
      expect(result).toEqual(response)
    })

    it('falls back to mock on circuit breaker error in dev', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)

      mockGet.mockRejectedValue(new Error('circuit is now open for warehouse/tracking/order-1/pod'))

      const result = await warehouseService.getProofOfDelivery('order-1')

      expect(result).toHaveProperty('orderId')
      expect(result).toHaveProperty('deliveryPhoto')

    })
  })

  describe('getOrderTrackingEvents', () => {
    it('returns mock tracking when mock is enabled', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('true')

      const result = await warehouseService.getOrderTrackingEvents('order-1')

      expect(mockGet).not.toHaveBeenCalled()
      expect(result.events).toBeInstanceOf(Array)
      expect(result.events.length).toBeGreaterThan(0)
    })

    it('fetches real tracking when mock is disabled', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)
      const response = { orderId: 'order-1', events: [{ status: 'ORDER_CREATED', timestamp: '2024-01-01' }] }
      mockGet.mockResolvedValue({ data: response })

      const result = await warehouseService.getOrderTrackingEvents('order-1')

      expect(mockGet).toHaveBeenCalledWith('/warehouse/tracking/order-1/events')
      expect(result).toEqual(response)
    })
  })

  describe('getTrackingEventsByMsisdn', () => {
    it('returns delivered mock for odd-ending MSISDN when mock enabled', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('true')

      const result = await warehouseService.getTrackingEventsByMsisdn('27612345671')

      expect(mockGet).not.toHaveBeenCalled()
      expect(result.events.some((event) => event.status === 'DELIVERED')).toBe(true)
    })

    it('returns in-transit mock for even-ending MSISDN when mock enabled', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('true')

      const result = await warehouseService.getTrackingEventsByMsisdn('27612345672')

      expect(mockGet).not.toHaveBeenCalled()
      expect(result.events.some((event) => event.status === 'IN_TRANSIT')).toBe(true)
    })

    it('fetches real tracking by MSISDN when mock is disabled', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)
      const response = { msisdn: '27612345678', events: [{ status: 'ORDER_CREATED', timestamp: '2024-01-01' }] }
      mockGet.mockResolvedValue({ data: response })

      const result = await warehouseService.getTrackingEventsByMsisdn('27612345678')

      expect(mockGet).toHaveBeenCalledWith('/warehouse/tracking/msisdn/27612345678/events')
      expect(result).toEqual(response)
    })

    it('throws on API error when not in dev', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)
      mockGet.mockRejectedValue(new Error('Network error'))

      await expect(warehouseService.getTrackingEventsByMsisdn('27612345678')).rejects.toThrow('Network error')
    })
  })
})
