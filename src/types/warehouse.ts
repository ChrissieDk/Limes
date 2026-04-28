
export interface DeliveryLocationDTO {
  latitude: number
  longitude: number
  address: string
}

export interface ProofOfDeliveryDTO {
  orderId: string
  deliveryDate: string
  recipientName: string
  recipientSignature?: string | null
  deliveryPhoto?: string | null
  deliveryLocation?: DeliveryLocationDTO | null
  driverName?: string | null
  driverContactNumber?: string | null
  notes?: string | null
  idVerified: boolean
  idNumber?: string | null
}

export interface TrackingEventDTO {
  eventId: string
  timestamp: string
  status: string
  description: string
  location: string
  locationCode?: string | null
  eventType: string
  courierName?: string | null
  trackingUrl?: string | null
  estimatedDeliveryWindow?: string | null
  recipientName?: string | null
  signatureRequired?: boolean | null
  signatureObtained?: boolean | null
}

export interface TrackingResponseDTO {
  orderId: string
  trackingNumber?: string | null
  msisdn?: string | null
  currentStatus: string
  estimatedDeliveryDate?: string | null
  events: TrackingEventDTO[]
}
