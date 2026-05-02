import type { ProofOfDeliveryDTO, TrackingResponseDTO, TrackingEventDTO } from '../../../types/warehouse'

const MOCK_ORDER_ID = '4422'
const MOCK_TRACKING_NUMBER = 'TRK-2026-001234'

export function createMockTrackingEvents(msisdn: string): TrackingResponseDTO {
  const now = new Date()
  const day1 = new Date(now)
  day1.setDate(day1.getDate() - 2)
  const day2 = new Date(now)
  day2.setDate(day2.getDate() - 1)

  const events: TrackingEventDTO[] = [
    {
      eventId: 'evt_001',
      timestamp: day1.toISOString(),
      status: 'ORDER_CREATED',
      description: 'Order created and pending warehouse processing',
      location: 'Online',
      locationCode: 'WEB',
      eventType: 'INFO',
    },
    {
      eventId: 'evt_002',
      timestamp: new Date(day1.getTime() + 3.5 * 60 * 60 * 1000).toISOString(),
      status: 'WAREHOUSE_PROCESSING',
      description: 'Order received by warehouse for picking',
      location: 'Cape Town Warehouse',
      locationCode: 'CPT_WH01',
      eventType: 'INFO',
    },
    {
      eventId: 'evt_003',
      timestamp: new Date(day1.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      status: 'PICKED_UP',
      description: 'Package picked up by courier',
      location: 'Cape Town Warehouse',
      locationCode: 'CPT_WH01',
      eventType: 'INFO',
      courierName: 'FastShip Couriers',
      trackingUrl: 'https://fastship.co.za/track/TRK-2026-001234',
    },
    {
      eventId: 'evt_004',
      timestamp: new Date(day2.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      status: 'IN_TRANSIT',
      description: 'Package in transit to distribution center',
      location: 'Cape Town Distribution Center',
      locationCode: 'CPT_DC',
      eventType: 'INFO',
    },
    {
      eventId: 'evt_005',
      timestamp: new Date(day2.getTime() + 14 * 60 * 60 * 1000).toISOString(),
      status: 'OUT_FOR_DELIVERY',
      description: 'Package out for delivery',
      location: 'Durbanville',
      locationCode: 'DBV',
      eventType: 'INFO',
      estimatedDeliveryWindow: '14:00 - 18:00',
    },
    {
      eventId: 'evt_006',
      timestamp: new Date(day2.getTime() + 16 * 60 * 60 * 1000).toISOString(),
      status: 'DELIVERED',
      description: 'Package delivered successfully',
      location: '9 Daalder Street, Durbanville',
      locationCode: 'DEST',
      eventType: 'SUCCESS',
      recipientName: 'Ryan Fouche',
      signatureRequired: true,
      signatureObtained: true,
    },
  ]

  return {
    orderId: MOCK_ORDER_ID,
    trackingNumber: MOCK_TRACKING_NUMBER,
    msisdn,
    currentStatus: 'DELIVERED',
    estimatedDeliveryDate: undefined,
    events,
  }
}

export function createMockInTransitTracking(msisdn: string): TrackingResponseDTO {
  const now = new Date()
  const day1 = new Date(now)
  day1.setDate(day1.getDate() - 1)

  const events: TrackingEventDTO[] = [
    {
      eventId: 'evt_001',
      timestamp: day1.toISOString(),
      status: 'ORDER_CREATED',
      description: 'Order created and pending warehouse processing',
      location: 'Online',
      locationCode: 'WEB',
      eventType: 'INFO',
    },
    {
      eventId: 'evt_002',
      timestamp: new Date(day1.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      status: 'WAREHOUSE_PROCESSING',
      description: 'Order received by warehouse for picking',
      location: 'Cape Town Warehouse',
      locationCode: 'CPT_WH01',
      eventType: 'INFO',
    },
    {
      eventId: 'evt_003',
      timestamp: now.toISOString(),
      status: 'IN_TRANSIT',
      description: 'Package in transit to distribution center',
      location: 'Johannesburg Distribution Center',
      locationCode: 'JHB_DC',
      eventType: 'INFO',
      courierName: 'Speedy Couriers',
      trackingUrl: 'https://speedy.co.za/track/SPD-12345',
    },
  ]

  const estimated = new Date(now)
  estimated.setDate(estimated.getDate() + 2)

  return {
    orderId: '4453',
    trackingNumber: 'SPD-12345',
    msisdn,
    currentStatus: 'IN_TRANSIT',
    estimatedDeliveryDate: estimated.toISOString(),
    events,
  }
}

export function createMockPod(): ProofOfDeliveryDTO {
  return {
    orderId: MOCK_ORDER_ID,
    deliveryDate: new Date().toISOString(),
    recipientName: 'Ryan Fouche',
    recipientSignature: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiPjxwYXRoIGQ9Ik0xMCwzMCBRNTAsMTAgMTAwLDMwIFQxOTAsMzAiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+',
    deliveryPhoto: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    deliveryLocation: {
      latitude: -33.8688,
      longitude: 18.4241,
      address: '9 Daalder Street, Durbanville, Cape Town, 7550',
    },
    driverName: 'John Smith',
    driverContactNumber: '0821234567',
    notes: 'Package delivered to recipient at front door',
    idVerified: true,
    idNumber: '9601065055085',
  }
}
