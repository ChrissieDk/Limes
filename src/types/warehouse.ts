export interface DeliveryLocationDTO {
  latitude: number
  longitude: number
  address: string
}

export interface ProofOfDeliveryDTO {
  orderId: string
  deliveryDate: string
  recipientName: string
  recipientSignature?: string
  deliveryPhoto?: string
  deliveryLocation?: DeliveryLocationDTO
  driverName?: string
  driverContactNumber?: string
  notes?: string
  idVerified: boolean
  idNumber?: string
}

export interface TrackingEventDTO {
  eventId: string
  timestamp: string
  status: TrackingStatus
  description: string
  location: string
  locationCode?: string
  eventType: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  courierName?: string
  trackingUrl?: string
  estimatedDeliveryWindow?: string
  recipientName?: string
  signatureRequired?: boolean
  signatureObtained?: boolean
}

export type TrackingStatus =
  | 'ORDER_CREATED'
  | 'WAREHOUSE_PROCESSING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERY_ATTEMPTED'
  | 'DELIVERED'
  | 'RETURNED_TO_SENDER'
  | 'CANCELLED'
  | 'ON_HOLD'
  | 'EXCEPTION'

export interface TrackingResponseDTO {
  orderId: string
  trackingNumber?: string
  msisdn?: string
  currentStatus: TrackingStatus
  estimatedDeliveryDate?: string
  events: TrackingEventDTO[]
}
