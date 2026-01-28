/**
 * Rating Table Configuration
 * 
 * This file contains pricing rates for both contract and prepaid packages.
 * Currently using local rates only.
 * 
 * Rates include VAT and are per-unit basis:
 * - Airtime: Per Rand (prepaid only)
 * - Voice: Per minute
 * - Data: Per MB
 * - SMS: Per message
 * - MMS: Per message
 * - WhatsApp: Per MB
 */

export type ServiceType = 'AIRTIME' | 'VOICE' | 'DATA' | 'SMS' | 'WHATSAPP' | 'MMS'
export type PackageType = 'contract' | 'prepaid'
export type RatingType = 'local' | 'international'

interface RatingEntry {
  price: number | null
  currency: string
  includesVAT: boolean
  serviceCode: string
}

interface RatingTableStructure {
  airtime?: {
    local: RatingEntry
  }
  voice: {
    local: RatingEntry
    international: RatingEntry
  }
  data: {
    local: RatingEntry
  }
  sms: {
    local: RatingEntry
    international: RatingEntry
  }
  mms: {
    local: RatingEntry
    international: RatingEntry
  }
  whatsapp: {
    local: RatingEntry
  }
}

/**
 * Contract pricing rating table
 * Used for contract package calculations
 * Note: AIRTIME is not applicable for contracts (use VOICE instead)
 */
export const contractRatingTable: RatingTableStructure = {
  voice: {
    local: {
      price: 0.93,
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-VOICE"
    },
    international: {
      price: null, // Default / variable
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-INT-VOICE"
    }
  },

  data: {
    local: {
      price: 0.044, // R0.0489 per MB
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-DATA"
    }
  },

  sms: {
    local: {
      price: 0.23,
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-SMS"
    },
    international: {
      price: 2.50,
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-INT-SMS"
    }
  },

  mms: {
    local: {
      price: 0.50,
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-MMS"
    },
    international: {
      price: 4.50,
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-INT-MMS"
    }
  },

  whatsapp: {
    local: {
      price: 0.046, // Not available yet - set a price to enable
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-WHATSAPP"
    }
  }
}

/**
 * Prepaid pricing rating table
 * Used for prepaid package calculations (top-ups, once-off purchases)
 * Currently only supports AIRTIME - other services use bundles instead
 */
export const prepaidRatingTable: RatingTableStructure = {
  airtime: {
    local: {
      price: 0.90, // R0.90 cost per R1 airtime → R1 payment buys R1.11 airtime (customer wins!)
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-AIRTIME"
    }
  },

  voice: {
    local: {
      price: null, // Not available - use bundles instead
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-PREPAID-VOICE"
    },
    international: {
      price: null,
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-PREPAID-INT-VOICE"
    }
  },

  data: {
    local: {
      price: null, // Not available - use bundles instead
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-PREPAID-DATA"
    }
  },

  sms: {
    local: {
      price: null, // Not available - use bundles instead
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-PREPAID-SMS"
    },
    international: {
      price: null,
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-PREPAID-INT-SMS"
    }
  },

  mms: {
    local: {
      price: null, // Not available - use bundles instead
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-PREPAID-MMS"
    },
    international: {
      price: null,
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-PREPAID-INT-MMS"
    }
  },

  whatsapp: {
    local: {
      price: null, // Not available - use bundles instead
      currency: "ZAR",
      includesVAT: true,
      serviceCode: "RATE-TARIFF-PREPAID-WHATSAPP"
    }
  }
}

/**
 * Get pricing rate for a service type
 * Currently always uses 'local' rating type
 * 
 * @param serviceType - The service type (VOICE, DATA, SMS, MMS)
 * @param packageType - The package type (contract or prepaid)
 * @param ratingType - The rating type (local or international) - defaults to local
 * @returns The price per unit in ZAR, or null if not available
 */
export function getRateForService(
  serviceType: ServiceType,
  packageType: PackageType,
  ratingType: RatingType = 'local'
): number | null {
  // Select the appropriate rating table
  const table = packageType === 'contract' ? contractRatingTable : prepaidRatingTable
  const serviceKey = serviceType.toLowerCase()

  switch (serviceKey) {
    case 'airtime':
      return ratingType === 'local' && table.airtime ? table.airtime.local.price : null
    case 'voice':
      return table.voice[ratingType]?.price ?? null
    case 'data':
      return ratingType === 'local' ? table.data.local.price : null
    case 'sms':
      return table.sms[ratingType]?.price ?? null
    case 'mms':
      return table.mms[ratingType]?.price ?? null
    case 'whatsapp':
      return ratingType === 'local' ? table.whatsapp.local.price : null
    default:
      return null
  }
}

/**
 * Get service code for billing/provisioning
 * 
 * @param serviceType - The service type
 * @param packageType - The package type (contract or prepaid)
 * @param ratingType - The rating type (local or international)
 * @returns The service code or null if not available
 */
export function getServiceCode(
  serviceType: ServiceType,
  packageType: PackageType,
  ratingType: RatingType = 'local'
): string | null {
  const table = packageType === 'contract' ? contractRatingTable : prepaidRatingTable
  const serviceKey = serviceType.toLowerCase()

  switch (serviceKey) {
    case 'airtime':
      return ratingType === 'local' && table.airtime ? table.airtime.local.serviceCode : null
    case 'voice':
      return table.voice[ratingType]?.serviceCode ?? null
    case 'data':
      return ratingType === 'local' ? table.data.local.serviceCode : null
    case 'sms':
      return table.sms[ratingType]?.serviceCode ?? null
    case 'mms':
      return table.mms[ratingType]?.serviceCode ?? null
    case 'whatsapp':
      return ratingType === 'local' ? table.whatsapp.local.serviceCode : null
    default:
      return null
  }
}

/**
 * Check if a service type is available for contract pricing
 * 
 * @param serviceType - The service type to check
 * @returns true if the service has contract pricing available
 */
export function isServiceAvailableForContract(serviceType: ServiceType): boolean {
  return getRateForService(serviceType, 'contract', 'local') !== null
}
