/**
 * MOCK PRICING CONFIGURATION
 * 
 * TODO: Replace these mock values with real pricing logic
 * Options for replacement:
 * 1. API endpoint that returns pricing rates
 * 2. Database-driven pricing configuration
 * 3. Dynamic pricing based on business rules
 */

export type ServiceType = 'AIRTIME' | 'VOICE' | 'DATA' | 'SMS' | 'WHATSAPP'

interface PricingRate {
  ratePerRand: number
  unit: string
  displayUnit: string
  minRands: number
  maxRands: number
}

/**
 * MOCK CONVERSION RATES
 * Currently using fixed rates - REPLACE WITH ACTUAL PRICING LOGIC
 */
const MOCK_PRICING_RATES: Record<ServiceType, PricingRate> = {
  AIRTIME: {
    ratePerRand: 1 / 0.90,        // 90 cents per unit → R1 = 1.11 units
    unit: 'rands',
    displayUnit: 'airtime',
    minRands: 1,
    maxRands: 1000,
  },
  VOICE: {
    ratePerRand: 5,           // R1 = 5 minutes (MOCK VALUE)
    unit: 'minutes',
    displayUnit: 'min',
    minRands: 1,
    maxRands: 1000,
  },
  DATA: {
    ratePerRand: 104857600,   // R1 = 100MB in bytes (MOCK VALUE)
    unit: 'bytes',
    displayUnit: 'MB',
    minRands: 1,
    maxRands: 1000,
  },
  SMS: {
    ratePerRand: 10,          // R1 = 10 SMS (MOCK VALUE)
    unit: 'messages',
    displayUnit: 'SMS',
    minRands: 1,
    maxRands: 1000,
  },
  WHATSAPP: {
    ratePerRand: 52428800,    // R1 = 50MB in bytes (MOCK VALUE)
    unit: 'bytes',
    displayUnit: 'MB',
    minRands: 1,
    maxRands: 1000,
  },
}

/**
 * Convert Rands to service units
 * @param serviceType - Type of service (VOICE, DATA, SMS, WHATSAPP)
 * @param rands - Amount in Rands
 * @returns Service value in appropriate units (minutes, bytes, messages)
 */
export function convertRandsToServiceValue(serviceType: ServiceType, rands: number): number {
  const rate = MOCK_PRICING_RATES[serviceType]
  if (!rate) {
    throw new Error(`Unknown service type: ${serviceType}`)
  }
  
  return Math.floor(rands * rate.ratePerRand)
}

/**
 * Convert service value to human-readable display
 * @param serviceType - Type of service
 * @param rands - Amount in Rands
 * @returns Human-readable string (e.g., "500 MB", "25 min", "50 SMS", "R25 airtime")
 */
export function getServiceDisplayValue(serviceType: ServiceType, rands: number): string {
  const rate = MOCK_PRICING_RATES[serviceType]
  if (!rate) {
    return 'Unknown'
  }

  const rawValue = rands * rate.ratePerRand

  // Special handling for AIRTIME (1:1 conversion)
  if (serviceType === 'AIRTIME') {
    return `R${rawValue.toFixed(2)} airtime`
  }

  // Special formatting for DATA and WHATSAPP (convert bytes to MB/GB)
  if (serviceType === 'DATA' || serviceType === 'WHATSAPP') {
    const bytes = rawValue
    const mb = bytes / 1048576
    const gb = mb / 1024

    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`
    }
    return `${Math.floor(mb)} MB`
  }

  // For VOICE and SMS, just return the count with unit
  return `${Math.floor(rawValue)} ${rate.displayUnit}`
}

/**
 * Get the expiry date for dynamic services (default: 30 days from now)
 * TODO: Make this configurable per service type if needed
 */
export function getDefaultExpiryDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 30) // 30 days from now
  return date.toISOString().split('T')[0] // yyyy-MM-dd format
}

/**
 * Validate service value against MVNX limits
 * @param serviceType - Type of service
 * @param value - Service value in units
 * @returns true if valid, throws error if invalid
 */
export function validateServiceValue(serviceType: ServiceType, value: number): boolean {
  const limits: Record<ServiceType, { min: number; max: number; unit: string }> = {
    AIRTIME: { min: 1, max: 100000, unit: 'cents' },  // R1 to R1000
    VOICE: { min: 0.0001, max: 20000, unit: 'minutes' },
    SMS: { min: 0.0001, max: 2000, unit: 'messages' },
    DATA: { min: 0.0001, max: 214748364800, unit: 'bytes' },
    WHATSAPP: { min: 0.0001, max: 214748364800, unit: 'bytes' },
  }

  const limit = limits[serviceType]
  if (value < limit.min || value > limit.max) {
    throw new Error(
      `${serviceType} value must be between ${limit.min} and ${limit.max} ${limit.unit}`
    )
  }

  return true
}

/**
 * Get pricing information for a service
 * @param serviceType - Type of service
 * @returns Pricing rate information
 */
export function getPricingRate(serviceType: ServiceType): PricingRate {
  return MOCK_PRICING_RATES[serviceType]
}
