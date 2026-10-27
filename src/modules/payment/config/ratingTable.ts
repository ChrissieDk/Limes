/**
 * Rating Table Configuration
 * 
 * Build-your-own slider rates. Rates include VAT.
 * Data, voice, and SMS are flat out-of-bundle sell rates.
 * WhatsApp stays on its own per-MB curve. Airtime is a flat rate per Rand.
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
 * Data rate for the build-your-own slider (out-of-bundle, incl VAT).
 * R0.10 per MB. R10 buys 100MB.
 */
export const dataBrackets: PricingBracket[] = [
  { fromUnits: 0, toUnits: null, pricePerUnit: 0.10, displayName: 'All usage' },
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
 * Voice rate for the build-your-own slider (off-net out-of-bundle, incl VAT).
 * One rate covers any network because the slider cannot tell on-net from off-net.
 * R0.59 per minute. R1 buys about 1.7 minutes. Converted to seconds in the pricing utility.
 */
export const voiceBrackets: PricingBracket[] = [
  { fromUnits: 0, toUnits: null, pricePerUnit: 0.59, displayName: 'All usage' },
]

/**
 * SMS rate for the build-your-own slider (out-of-bundle, incl VAT).
 * R0.25 per message.
 */
export const smsBrackets: PricingBracket[] = [
  { fromUnits: 0, toUnits: null, pricePerUnit: 0.25, displayName: 'All usage' },
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
