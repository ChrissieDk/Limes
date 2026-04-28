import { apiClient } from '../../../config/api'
import type { ProofOfDeliveryDTO, TrackingResponseDTO } from '../../../types/warehouse'

function encodePathSegment(value: string): string {
  return encodeURIComponent(value)
}

export const warehouseService = {
  async getProofOfDelivery(orderId: string): Promise<ProofOfDeliveryDTO> {
    const response = await apiClient.get<ProofOfDeliveryDTO>(
      `/warehouse/tracking/${encodePathSegment(orderId)}/pod`
    )
    return response.data
  },

  async getTrackingEventsByOrderId(orderId: string): Promise<TrackingResponseDTO> {
    const response = await apiClient.get<TrackingResponseDTO>(
      `/warehouse/tracking/${encodePathSegment(orderId)}/events`
    )
    return response.data
  },

  async getTrackingEventsByMsisdn(msisdn: string): Promise<TrackingResponseDTO> {
    const digits = msisdn.replace(/\D/g, '')
    const response = await apiClient.get<TrackingResponseDTO>(
      `/warehouse/tracking/msisdn/${encodePathSegment(digits)}/events`
    )
    return response.data
  },
}
