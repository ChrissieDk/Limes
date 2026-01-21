/**
 * Dynamic Pricing Utilities
 * 
 * Handles pricing calculations for both contract and prepaid packages.
 * All pricing uses the rating tables from config/ratingTable.ts
 */

import { getRateForService, type ServiceType as RatingServiceType, type PackageType } from '../config/ratingTable'

export type ServiceType = 'AIRTIME' | 'VOICE' | 'DATA' | 'SMS' | 'WHATSAPP' | 'MMS'

/**
 * Get pricing rate per Rand for a service
 * Uses the rating table which has per-unit prices (e.g., R0.89/min)
 * Converts to rate per Rand (e.g., 1/0.89 minutes per Rand)
 */
function getRatePerRand(serviceType: ServiceType, packageType: PackageType): number | null {
  const pricePerUnit = getRateForService(serviceType as RatingServiceType, packageType, 'local')
  
  if (pricePerUnit === null) {
    return null
  }

  // For AIRTIME: price is the cost per Rand of airtime
  // e.g., R0.90 cost means R1 payment buys 1/0.90 = R1.11 airtime (customer wins!)
  if (serviceType === 'AIRTIME') {
    return 1 / pricePerUnit // Invert to give customer MORE airtime
  }

  // For DATA and WHATSAPP: price is per MB, we need to convert to bytes per Rand
  if (serviceType === 'DATA' || serviceType === 'WHATSAPP') {
    const mbPerRand = 1 / pricePerUnit
    return mbPerRand * 1048576 // Convert MB to bytes
  }

  // For VOICE, SMS, MMS: price is per unit, so we need units per Rand
  return 1 / pricePerUnit
}

/**
 * Convert Rands to service units
 * @param serviceType - Type of service (VOICE, DATA, SMS, WHATSAPP, MMS, AIRTIME)
 * @param rands - Amount in Rands
 * @param packageType - Package type (contract or prepaid)
 * @returns Service value in appropriate units (minutes, bytes, messages, rands for airtime), or null if not available
 */
export function convertRandsToServiceValue(
  serviceType: ServiceType, 
  rands: number, 
  packageType: PackageType = 'prepaid'
): number | null {
  // Use rating table for both contract and prepaid
  const ratePerRand = getRatePerRand(serviceType, packageType)
  if (ratePerRand === null) {
    // Service not available for this package type
    return null
  }
  
  return Math.floor(rands * ratePerRand)
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
  packageType: PackageType = 'prepaid'
): string | null {
  // Use rating table for both contract and prepaid
  const ratePerRand = getRatePerRand(serviceType, packageType)
  if (ratePerRand === null) {
    // Service not available for this package type
    return null
  }

  const rawValue = rands * ratePerRand

  // Special handling for AIRTIME (rands to rands conversion)
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

  // For VOICE, SMS, MMS, return the count with unit
  const displayUnits: Record<string, string> = {
    VOICE: 'min',
    SMS: 'SMS',
    MMS: 'MMS',
  }

  const unit = displayUnits[serviceType]
  if (unit) {
    return `${Math.floor(rawValue)} ${unit}`
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
    AIRTIME: { min: 1, max: 100000, unit: 'cents' },  // R1 to R1000
    VOICE: { min: 0.0001, max: 20000, unit: 'minutes' },
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
export function isServiceAvailable(serviceType: ServiceType, packageType: PackageType): boolean {
  return getRatePerRand(serviceType, packageType) !== null
}
