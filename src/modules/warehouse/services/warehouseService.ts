import { apiClient } from '../../../config/api'
import type { ProofOfDeliveryDTO, TrackingResponseDTO } from '../../../types/warehouse'
import { createMockTrackingEvents, createMockInTransitTracking, createMockPod } from './warehouseMock'

function isMockEnabled(): boolean {
  try {
    if (localStorage.getItem('limes:mock-warehouse') === 'true') return true
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    if (params.get('mock') === 'warehouse') return true
  }
  return false
}

function shouldFallbackToMock(error: unknown): boolean {
  const message = String(error)
  return (
    message.includes('circuit is now open') ||
    message.includes('Circuit breaker') ||
    message.includes('500') ||
    message.includes('not found')
  )
}

export const warehouseService = {
  /**
   * Get proof of delivery (POD) for a specific order.
   */
  async getProofOfDelivery(orderId: string): Promise<ProofOfDeliveryDTO> {
    if (isMockEnabled()) {
      return createMockPod()
    }
    try {
      const response = await apiClient.get(`/warehouse/tracking/${orderId}/pod`)
      return response.data
    } catch (err) {
      if (import.meta.env.DEV && shouldFallbackToMock(err)) {
        console.warn('[Warehouse] API failed, falling back to mock POD')
        return createMockPod()
      }
      throw err
    }
  },

  /**
   * Get tracking events for a specific order.
   */
  async getOrderTrackingEvents(orderId: string): Promise<TrackingResponseDTO> {
    if (isMockEnabled()) {
      return createMockTrackingEvents('27644038838')
    }
    try {
      const response = await apiClient.get(`/warehouse/tracking/${orderId}/events`)
      return response.data
    } catch (err) {
      if (import.meta.env.DEV && shouldFallbackToMock(err)) {
        console.warn('[Warehouse] API failed, falling back to mock tracking')
        return createMockTrackingEvents('27644038838')
      }
      throw err
    }
  },

  /**
   * Get tracking events by MSISDN.
   * Looks up the subscription by MSISDN and returns tracking for the associated order.
   */
  async getTrackingEventsByMsisdn(msisdn: string): Promise<TrackingResponseDTO> {
    if (isMockEnabled()) {
      // Return delivered for first SIM, in-transit for second
      return msisdn.endsWith('1') || msisdn.endsWith('3') || msisdn.endsWith('5') || msisdn.endsWith('7') || msisdn.endsWith('9')
        ? createMockTrackingEvents(msisdn)
        : createMockInTransitTracking(msisdn)
    }
    try {
      const response = await apiClient.get(`/warehouse/tracking/msisdn/${msisdn}/events`)
      return response.data
    } catch (err) {
      if (import.meta.env.DEV && shouldFallbackToMock(err)) {
        console.warn('[Warehouse] API failed, falling back to mock tracking for MSISDN:', msisdn)
        return msisdn.endsWith('1') || msisdn.endsWith('3') || msisdn.endsWith('5') || msisdn.endsWith('7') || msisdn.endsWith('9')
          ? createMockTrackingEvents(msisdn)
          : createMockInTransitTracking(msisdn)
      }
      throw err
    }
  },
}
