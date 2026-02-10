/**
 * Dynamic Pricing Utilities
 * 
 * Handles pricing calculations for both contract and prepaid packages.
 * Uses progressive/incremental pricing where applicable (DATA, VOICE, SMS, WHATSAPP).
 * Like tax brackets: each tier applies only to the units within that tier's range.
 */

import { 
  getPricingBrackets,
  type ServiceType as RatingServiceType, 
  type PackageType,
  type PricingBracket 
} from '../config/ratingTable'

export type ServiceType = 'AIRTIME' | 'VOICE' | 'DATA' | 'SMS' | 'WHATSAPP' | 'MMS'

/**
 * Calculate cost using progressive/incremental pricing
 * Like tax brackets: each tier applies only to the units within that tier's range
 * @param totalUnits - Total units to calculate cost for
 * @param tiers - Pricing tiers to use
 * @returns Total cost in Rands
 */
export function calculateTieredCost(totalUnits: number, tiers: PricingBracket[]): number {
  let remainingUnits = totalUnits
  let totalCost = 0
  
  for (const tier of tiers) {
    if (remainingUnits <= 0) break
    
    const tierEnd = tier.toUnits ?? Infinity
    const tierSize = tierEnd - tier.fromUnits
    const unitsInThisTier = Math.min(remainingUnits, tierSize)
    
    totalCost += unitsInThisTier * tier.pricePerUnit
    remainingUnits -= unitsInThisTier
  }
  
  return totalCost
}

/**
 * Calculate units from Rands using progressive/incremental pricing
 * Like tax brackets: each tier applies only to the units within that tier's range
 * This is the inverse of calculateTieredCost
 * @param rands - Amount in Rands to spend
 * @param tiers - Pricing tiers to use
 * @returns Total units you can buy
 */
function calculateUnitsFromTiers(rands: number, tiers: PricingBracket[]): number {
  let remainingBudget = rands
  let totalUnits = 0
  
  for (const tier of tiers) {
    if (remainingBudget <= 0) break
    
    const tierEnd = tier.toUnits ?? Infinity
    const tierSize = tierEnd - tier.fromUnits
    
    // Cost to buy all units in this tier
    const costForFullTier = tierSize * tier.pricePerUnit
    
    if (remainingBudget >= costForFullTier && tierEnd !== Infinity) {
      // Can afford the entire tier, move to next
      totalUnits += tierSize
      remainingBudget -= costForFullTier
    } else {
      // Can only afford part of this tier
      const unitsInThisTier = remainingBudget / tier.pricePerUnit
      totalUnits += unitsInThisTier
      remainingBudget = 0
      break
    }
  }
  
  return totalUnits
}

/**
 * Convert Rands to service units (API units: bytes, seconds, cents, message count)
 * 
 * IMPORTANT: This function respects tiered pricing by calculating units for the FULL Rand amount.
 * You cannot multiply a per-Rand rate because tiers are non-linear (e.g., R100 uses a cheaper tier than R1).
 * 
 * @param serviceType - Type of service (VOICE, DATA, SMS, WHATSAPP, MMS, AIRTIME)
 * @param rands - Amount in Rands
 * @param packageType - Package type (contract or prepaid)
 * @returns Service value in API units (seconds for VOICE, bytes for DATA/WHATSAPP, messages for SMS/MMS, Rands for AIRTIME), or null if not available
 */
export function convertRandsToServiceValue(
  serviceType: ServiceType, 
  rands: number, 
  _packageType: PackageType = 'prepaid'
): number | null {
  const tiers = getPricingBrackets(serviceType as RatingServiceType)
  
  if (!tiers || tiers.length === 0) {
    return null // Service not available
  }
  
  // Calculate tier units for the FULL amount (respects non-linear tiered pricing)
  const tierUnits = calculateUnitsFromTiers(rands, tiers)
  
  // Convert tier units → API units (single conversion point)
  if (serviceType === 'DATA' || serviceType === 'WHATSAPP') {
    // Tier units: MB → API units: bytes
    return Math.floor(tierUnits * 1048576)
  } else if (serviceType === 'VOICE') {
    // Tier units: minutes → API units: seconds
    return Math.floor(tierUnits * 60)
  } else if (serviceType === 'AIRTIME') {
    // API expects value in Rands (decimal), not cents. priceInCents is sent separately.
    return Math.round(tierUnits * 100) / 100
  } else {
    // SMS: count (already in API units)
    return Math.floor(tierUnits)
  }
}

/**
 * Convert service value to human-readable display
 * @param serviceType - Type of service
 * @param rands - Amount in Rands
 * @param packageType - Package type (contract or prepaid)
 * @returns Human-readable string (e.g., "500 MB", "25 min", "50 SMS", "R25 airtime"), or null if not available
 */
export function getServiceDisplayValue(
  serviceType: ServiceType, 
  rands: number, 
  _packageType: PackageType = 'prepaid'
): string | null {
  // All services now use tiered pricing
  const tiers = getPricingBrackets(serviceType as RatingServiceType)
  
  if (!tiers || tiers.length === 0) {
    return null // Service not available
  }
  
  const units = calculateUnitsFromTiers(rands, tiers)
  
  // Format based on service type
  if (serviceType === 'DATA' || serviceType === 'WHATSAPP') {
    // Units are in MB, convert to GB if appropriate
    const mb = units
    const gb = mb / 1024

    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`
    }
    return `${Math.floor(mb)} MB`
  } else if (serviceType === 'VOICE') {
    // Units are in minutes
    return `${Math.floor(units)} min`
  } else if (serviceType === 'SMS') {
    return `${Math.floor(units)} SMS`
  } else if (serviceType === 'AIRTIME') {
    // Units are in Rands
    return `R${units.toFixed(2)} airtime`
  }

  return null
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
    AIRTIME: { min: 0.01, max: 1000, unit: 'rands' },  // R0.01 to R1000
    VOICE: { min: 0.0001, max: 1200000, unit: 'seconds' },  // Up to 20,000 minutes
    SMS: { min: 0.0001, max: 2000, unit: 'messages' },
    DATA: { min: 0.0001, max: 214748364800, unit: 'bytes' },
    WHATSAPP: { min: 0.0001, max: 214748364800, unit: 'bytes' },
    MMS: { min: 0.0001, max: 2000, unit: 'messages' },
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
 * Check if a service is available for a given package type
 * @param serviceType - Type of service
 * @param packageType - Package type (contract or prepaid)
 * @returns true if the service is available
 */
export function isServiceAvailable(serviceType: ServiceType, _packageType: PackageType): boolean {
  const tiers = getPricingBrackets(serviceType as RatingServiceType)
  return tiers !== null && tiers.length > 0
}

/**
 * Convert Rands to Cents
 * Used for API calls that require amounts in cents
 * @param rands - Amount in rands (e.g., 150.00)
 * @returns Amount in cents (e.g., 15000)
 */
export function toCents(rands: number): number {
  return Math.round(rands * 100)
}

/**
 * Convert Cents to Rands
 * Used for displaying amounts from API responses
 * @param cents - Amount in cents (e.g., 15000)
 * @returns Amount in rands (e.g., 150.00)
 */
export function toRands(cents: number): number {
  return cents / 100
}
