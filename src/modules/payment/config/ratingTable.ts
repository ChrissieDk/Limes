/**
 * Rating Table Configuration
 * 
 * This file contains tiered pricing for services.
 * Uses tiered pricing where reaching a tier applies that rate to ALL usage.
 * 
 * Rates include VAT and are per-unit basis:
 * - Airtime: Flat rate per Rand (prepaid only)
 * - Voice: Per minute (tiered, converted to seconds in pricing utility)
 * - Data: Per MB (tiered)
 * - SMS: Per message (tiered)
 * - WhatsApp: Per MB (tiered)
 */

export type ServiceType = 'AIRTIME' | 'VOICE' | 'DATA' | 'SMS' | 'WHATSAPP' | 'MMS'
export type PackageType = 'contract' | 'prepaid'
export type RatingType = 'local' | 'international'

/**
 * Tiered pricing bracket
 * When you reach a tier, ALL usage is priced at that tier's rate (not just the excess)
 */
export interface PricingBracket {
  fromUnits: number      // Starting unit (inclusive)
  toUnits: number | null // Ending unit (exclusive), null = unlimited
  pricePerUnit: number   // Rate per unit for ALL usage in this tier
  displayName: string    // Human-readable bracket name
}

/**
 * Data pricing tiers (tiered pricing per MB)
 * When you reach a tier, ALL your data is priced at that tier's rate.
 * Example: 20GB falls in the 10-20GB tier, so all 20GB costs 20480 × R0.015 = R307.20
 */
export const dataBrackets: PricingBracket[] = [
  { fromUnits: 0, toUnits: 100, pricePerUnit: 0.050, displayName: '0-100MB' },
  { fromUnits: 100, toUnits: 300, pricePerUnit: 0.067, displayName: '100-300MB' },
  { fromUnits: 300, toUnits: 500, pricePerUnit: 0.060, displayName: '300-500MB' },
  { fromUnits: 500, toUnits: 1024, pricePerUnit: 0.049, displayName: '500MB-1GB' },
  { fromUnits: 1024, toUnits: 2048, pricePerUnit: 0.048, displayName: '1-2GB' },
  { fromUnits: 2048, toUnits: 3072, pricePerUnit: 0.049, displayName: '2-3GB' },
  { fromUnits: 3072, toUnits: 5120, pricePerUnit: 0.035, displayName: '3-5GB' },
  { fromUnits: 5120, toUnits: 10240, pricePerUnit: 0.019, displayName: '5-10GB' },
  { fromUnits: 10240, toUnits: 20480, pricePerUnit: 0.015, displayName: '10-20GB' },
  { fromUnits: 20480, toUnits: null, pricePerUnit: 0.015, displayName: '20GB+' },
]

/**
 * WhatsApp pricing tiers (tiered pricing per MB)
 * When you reach a tier, ALL your data is priced at that tier's rate.
 * Example: 2GB falls in the 1-2GB tier, so all 2048MB costs 2048 × R0.039 = R79.87
 */
export const whatsappBrackets: PricingBracket[] = [
  { fromUnits: 0, toUnits: 500, pricePerUnit: 0.060, displayName: '0-500MB' },
  { fromUnits: 500, toUnits: 1024, pricePerUnit: 0.038, displayName: '500MB-1GB' },
  { fromUnits: 1024, toUnits: null, pricePerUnit: 0.039, displayName: '1GB+' },
]

/**
 * Voice pricing tiers (tiered pricing per minute)
 * When you reach a tier, ALL your minutes are priced at that tier's rate.
 * These will be converted to seconds in the pricing utility.
 * Example: 500 minutes falls in the 400-500 tier, so all 500 min costs 500 × R0.80 = R400
 */
export const voiceBrackets: PricingBracket[] = [
  { fromUnits: 0, toUnits: 50, pricePerUnit: 1.00, displayName: '0-50 min' },
  { fromUnits: 50, toUnits: 100, pricePerUnit: 1.00, displayName: '50-100 min' },
  { fromUnits: 100, toUnits: 150, pricePerUnit: 1.00, displayName: '100-150 min' },
  { fromUnits: 150, toUnits: 200, pricePerUnit: 1.00, displayName: '150-200 min' },
  { fromUnits: 200, toUnits: 300, pricePerUnit: 1.00, displayName: '200-300 min' },
  { fromUnits: 300, toUnits: 400, pricePerUnit: 0.88, displayName: '300-400 min' },
  { fromUnits: 400, toUnits: 500, pricePerUnit: 0.80, displayName: '400-500 min' },
  { fromUnits: 500, toUnits: null, pricePerUnit: 0.75, displayName: '500+ min' },
]

/**
 * SMS pricing tiers (tiered pricing per message)
 * When you reach a tier, ALL your messages are priced at that tier's rate.
 * Example: 200 SMS falls in the 100-200 tier, so all 200 SMS costs 200 × R0.25 = R50
 */
export const smsBrackets: PricingBracket[] = [
  { fromUnits: 0, toUnits: 50, pricePerUnit: 0.20, displayName: '0-50 SMS' },
  { fromUnits: 50, toUnits: 100, pricePerUnit: 0.25, displayName: '50-100 SMS' },
  { fromUnits: 100, toUnits: 200, pricePerUnit: 0.25, displayName: '100-200 SMS' },
  { fromUnits: 200, toUnits: null, pricePerUnit: 0.25, displayName: '200+ SMS' },
]

/**
 * Airtime pricing (flat rate per Rand)
 * R0.90 cost per R1 airtime means R1 payment buys R1.11 airtime
 */
export const airtimeBrackets: PricingBracket[] = [
  { fromUnits: 0, toUnits: null, pricePerUnit: 0.90, displayName: 'All usage' },
]

/**
 * Get pricing brackets for a service type
 * 
 * @param serviceType - The service type
 * @returns Array of pricing brackets, or null if service doesn't use tiered pricing
 */
export function getPricingBrackets(serviceType: ServiceType): PricingBracket[] | null {
  switch (serviceType) {
    case 'DATA':
      return dataBrackets
    case 'WHATSAPP':
      return whatsappBrackets
    case 'VOICE':
      return voiceBrackets
    case 'SMS':
      return smsBrackets
    case 'AIRTIME':
      return airtimeBrackets
    case 'MMS':
      return null // Not available
    default:
      return null
  }
}
