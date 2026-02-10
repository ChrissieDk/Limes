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
 * Data pricing tiers (progressive/incremental pricing per MB)
 * Like tax brackets: each tier applies only to the units within that tier's range.
 * Progressive pricing ensures smooth, gradual price increases without cliff effects.
 * 
 * Target prices:
 * 100MB=R5, 300MB=R20, 500MB=R30, 1GB=R50, 2GB=R99, 3GB=R149, 5GB=R179, 10GB=R199, 20GB=R299
 */
export const dataBrackets: PricingBracket[] = [
  // Small data packages
  { fromUnits: 0, toUnits: 101, pricePerUnit: 0.050, displayName: '0-100MB' },        // R5 total
  { fromUnits: 101, toUnits: 301, pricePerUnit: 0.075, displayName: '100-300MB' },    // +R15 = R20 total
  { fromUnits: 301, toUnits: 501, pricePerUnit: 0.050, displayName: '300-500MB' },    // +R10 = R30 total
  
  // 1-3GB range
  { fromUnits: 501, toUnits: 1025, pricePerUnit: 0.0382, displayName: '500MB-1GB' },  // +R20 = R50 total
  { fromUnits: 1025, toUnits: 2049, pricePerUnit: 0.0478, displayName: '1-2GB' },     // +R49 = R99 total
  { fromUnits: 2049, toUnits: 3073, pricePerUnit: 0.0488, displayName: '2-3GB' },     // +R50 = R149 total
  
  // 3-5GB range with 4GB intermediate
  { fromUnits: 3073, toUnits: 4097, pricePerUnit: 0.0146, displayName: '3-4GB' },     // +R15 = R164 total
  { fromUnits: 4097, toUnits: 5121, pricePerUnit: 0.0146, displayName: '4-5GB' },     // +R15 = R179 total
  
  // 5-10GB range: R179 → R199 (R20 over 5GB, gradually decreasing for smoother transition)
  { fromUnits: 5121, toUnits: 6145, pricePerUnit: 0.00977, displayName: '5-6GB' },    // +R10 = R189 total
  { fromUnits: 6145, toUnits: 7169, pricePerUnit: 0.00488, displayName: '6-7GB' },    // +R5 = R194 total
  { fromUnits: 7169, toUnits: 8193, pricePerUnit: 0.00293, displayName: '7-8GB' },    // +R3 = R197 total
  { fromUnits: 8193, toUnits: 9217, pricePerUnit: 0.00098, displayName: '8-9GB' },    // +R1 = R198 total
  { fromUnits: 9217, toUnits: 10241, pricePerUnit: 0.00098, displayName: '9-10GB' },  // +R1 = R199 total
  
  // 10-20GB range: R199 → R299 (R100 over 10GB, gradually decreasing)
  { fromUnits: 10241, toUnits: 12289, pricePerUnit: 0.0117, displayName: '10-12GB' }, // +R24 = R223 total
  { fromUnits: 12289, toUnits: 14337, pricePerUnit: 0.0107, displayName: '12-14GB' }, // +R22 = R245 total
  { fromUnits: 14337, toUnits: 16385, pricePerUnit: 0.0098, displayName: '14-16GB' }, // +R20 = R265 total
  { fromUnits: 16385, toUnits: 18433, pricePerUnit: 0.0088, displayName: '16-18GB' }, // +R18 = R283 total
  { fromUnits: 18433, toUnits: 20481, pricePerUnit: 0.0078, displayName: '18-20GB' }, // +R16 = R299 total
  
  // 20GB+
  { fromUnits: 20481, toUnits: null, pricePerUnit: 0.0098, displayName: '20GB+' },
]

/**
 * WhatsApp pricing tiers (progressive/incremental pricing per MB)
 * Like tax brackets: each tier applies only to the units within that tier's range.
 * Progressive pricing ensures smooth, gradual price increases without cliff effects.
 * 
 * Target prices: 500MB=R30, 1GB=R39, 2GB=R79
 */
export const whatsappBrackets: PricingBracket[] = [
  { fromUnits: 0, toUnits: 501, pricePerUnit: 0.060, displayName: '0-500MB' },        // R30 total
  { fromUnits: 501, toUnits: 1025, pricePerUnit: 0.0172, displayName: '500MB-1GB' },  // +R9 = R39 total
  { fromUnits: 1025, toUnits: 2049, pricePerUnit: 0.0391, displayName: '1-2GB' },     // +R40 = R79 total
  { fromUnits: 2049, toUnits: null, pricePerUnit: 0.0391, displayName: '2GB+' },
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
