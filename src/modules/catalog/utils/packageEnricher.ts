/**
 * Package Enrichment Utilities
 * 
 * Enriches API product data with actual benefits and pricing from the combo packages mapping.
 */

import type { CatalogProduct } from '../../../types'
import { COMBO_PACKAGES_MAP, type ComboPackageDetails } from '../config/comboPackagesMapping'

export interface EnrichedComboPackage extends CatalogProduct {
  // Enriched fields from mapping
  isEnriched: boolean
  actualPrice: number // The real price in Rands
  actualPriceCents: number // The real price in cents
  comboDetails?: ComboPackageDetails
}

/**
 * Enriches a single package with combo package details
 */
export function enrichComboPackage(product: CatalogProduct): EnrichedComboPackage {
  const comboDetails = COMBO_PACKAGES_MAP[product.id]
  
  if (!comboDetails) {
    // Return original product if no mapping exists
    return {
      ...product,
      description: product.description || 'Mobile Subscription', // Ensure description is never undefined
      isEnriched: false,
      actualPrice: product.price,
      actualPriceCents: product.price * 100
    }
  }
  
  // Enrich with mapping data
  return {
    ...product,
    isEnriched: true,
    name: comboDetails.name,
    description: comboDetails.displayDescription,
    actualPrice: comboDetails.monthlyCostRands,
    actualPriceCents: comboDetails.monthlyCostCents,
    comboDetails
  }
}

/**
 * Enriches an array of packages
 */
export function enrichComboPackages(products: CatalogProduct[]): EnrichedComboPackage[] {
  return products.map(enrichComboPackage)
}

/**
 * Formats package benefits into a readable list for UI display
 */
export function formatPackageBenefits(comboDetails: ComboPackageDetails): string[] {
  return comboDetails.benefits.map(benefit => {
    const validityText = benefit.validity ? ` (${benefit.validity})` : ''
    const descText = benefit.description ? ` - ${benefit.description}` : ''
    return `${benefit.label}: ${benefit.formattedValue}${validityText}${descText}`
  })
}

/**
 * Gets a short summary for a package (used in cards)
 */
export function getPackageSummary(productId: string): string {
  const comboDetails = COMBO_PACKAGES_MAP[productId]
  return comboDetails?.shortSummary || 'Mobile Subscription'
}

/**
 * Gets the actual monthly cost for a package
 */
export function getActualPrice(productId: string): { rands: number; cents: number } {
  const comboDetails = COMBO_PACKAGES_MAP[productId]
  if (!comboDetails) {
    return { rands: 0, cents: 0 }
  }
  return {
    rands: comboDetails.monthlyCostRands,
    cents: comboDetails.monthlyCostCents
  }
}
