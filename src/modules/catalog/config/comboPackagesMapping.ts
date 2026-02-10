/**
 * Combo Package Mapping Configuration
 * 
 * Maps product IDs from the API to their actual benefits and pricing.
 * This ensures users see accurate package details while maintaining correct product IDs for backend processing.
 */

export interface PackageBenefit {
  type: 'data' | 'voice' | 'sms' | 'whatsapp' | 'gpa_credit' | 'zero_rated_data' | 'promo_data'
  label: string
  value: number // Raw value (bytes for data, seconds for voice, cents for credits)
  formattedValue: string // Human-readable value (e.g., "1GB", "75 min", "R35")
  validity: string
  description?: string
}

export interface ComboPackageDetails {
  productId: string
  name: string
  monthlyCostCents: number
  monthlyCostRands: number
  validity: string
  benefits: PackageBenefit[]
  displayDescription: string // For card display
  shortSummary: string // Quick overview
}

// Default rates that apply to all packages
export const DEFAULT_RATES = {
  voiceCentsPerMin: 149,
  smsCents: 29,
  internationalSmsCents: 40,
  mmsCents: 250,
  internationalMmsCents: 50,
  cugCents: 450,
} as const

/**
 * Complete mapping of all combo packages
 */
export const COMBO_PACKAGES_MAP: Record<string, ComboPackageDetails> = {
  '40890': {
    productId: '40890',
    name: 'Limes29',
    monthlyCostCents: 2900,
    monthlyCostRands: 29,
    validity: '30 Days',
    shortSummary: '1GB Zero-Rated Data + R35 Airtime',
    displayDescription: '1GB zero-rated data valid for 90 days, plus R35 general purpose airtime for calls, SMS, and data',
    benefits: [
      {
        type: 'zero_rated_data',
        label: 'Zero Rated Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '90 days',
        description: 'Data that doesn\'t count toward regular usage'
      },
      {
        type: 'gpa_credit',
        label: 'General Purpose Airtime',
        value: 3500,
        formattedValue: 'R35',
        validity: '30 days',
        description: 'Use for calls, SMS, or data at standard rates'
      }
    ]
  },
  '40891': {
    productId: '40891',
    name: 'Limes69',
    monthlyCostCents: 6900,
    monthlyCostRands: 69,
    validity: '30 Days',
    shortSummary: '1GB Zero-Rated + R90 Airtime + 200MB WhatsApp',
    displayDescription: '1GB zero-rated data (90 days), R90 airtime, and 200MB WhatsApp data',
    benefits: [
      {
        type: 'zero_rated_data',
        label: 'Zero Rated Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '90 days'
      },
      {
        type: 'gpa_credit',
        label: 'General Purpose Airtime',
        value: 9000,
        formattedValue: 'R90',
        validity: '30 days'
      },
      {
        type: 'whatsapp',
        label: 'WhatsApp Data',
        value: 209715200,
        formattedValue: '200MB',
        validity: '30 days',
        description: 'FUP applies'
      }
    ]
  },
  '40892': {
    productId: '40892',
    name: 'Limes75',
    monthlyCostCents: 7500,
    monthlyCostRands: 75,
    validity: '30 Days',
    shortSummary: '1GB Zero-Rated Data + 75 Minutes Voice',
    displayDescription: '1GB zero-rated data (90 days) plus 75 minutes of voice calls',
    benefits: [
      {
        type: 'zero_rated_data',
        label: 'Zero Rated Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '90 days'
      },
      {
        type: 'voice',
        label: 'Voice Minutes',
        value: 4500,
        formattedValue: '75 minutes',
        validity: '30 days'
      }
    ]
  },
  '40893': {
    productId: '40893',
    name: 'Limes99',
    monthlyCostCents: 9900,
    monthlyCostRands: 99,
    validity: '30 Days',
    shortSummary: '1GB Zero-Rated + R130 Airtime + 200MB WhatsApp',
    displayDescription: '1GB zero-rated data (90 days), R130 airtime, and 200MB WhatsApp data',
    benefits: [
      {
        type: 'zero_rated_data',
        label: 'Zero Rated Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '90 days'
      },
      {
        type: 'gpa_credit',
        label: 'General Purpose Airtime',
        value: 13000,
        formattedValue: 'R130',
        validity: '30 days'
      },
      {
        type: 'whatsapp',
        label: 'WhatsApp Data',
        value: 209715200,
        formattedValue: '200MB',
        validity: '30 days',
        description: 'FUP applies'
      }
    ]
  },
  '40894': {
    productId: '40894',
    name: 'Limes149',
    monthlyCostCents: 14900,
    monthlyCostRands: 149,
    validity: '30 Days',
    shortSummary: '1GB Zero-Rated Data + R150 Airtime',
    displayDescription: '1GB zero-rated data (90 days) plus R150 general purpose airtime',
    benefits: [
      {
        type: 'zero_rated_data',
        label: 'Zero Rated Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '90 days'
      },
      {
        type: 'gpa_credit',
        label: 'General Purpose Airtime',
        value: 15000,
        formattedValue: 'R150',
        validity: '30 days'
      }
    ]
  },
  '40895': {
    productId: '40895',
    name: 'Limes169',
    monthlyCostCents: 16900,
    monthlyCostRands: 169,
    validity: '30 Days',
    shortSummary: '1GB Zero-Rated + R200 Airtime + 200MB WhatsApp',
    displayDescription: '1GB zero-rated data (90 days), R200 airtime, and 200MB WhatsApp data',
    benefits: [
      {
        type: 'zero_rated_data',
        label: 'Zero Rated Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '90 days'
      },
      {
        type: 'gpa_credit',
        label: 'General Purpose Airtime',
        value: 20000,
        formattedValue: 'R200',
        validity: '30 days'
      },
      {
        type: 'whatsapp',
        label: 'WhatsApp Data',
        value: 209715200,
        formattedValue: '200MB',
        validity: '30 days',
        description: 'FUP applies'
      }
    ]
  },
  '40896': {
    productId: '40896',
    name: 'Limes199',
    monthlyCostCents: 19900,
    monthlyCostRands: 199,
    validity: '30 Days',
    shortSummary: '1GB Zero-Rated + R230 Airtime + 200MB WhatsApp',
    displayDescription: '1GB zero-rated data (90 days), R230 airtime, and 200MB WhatsApp data',
    benefits: [
      {
        type: 'zero_rated_data',
        label: 'Zero Rated Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '90 days'
      },
      {
        type: 'gpa_credit',
        label: 'General Purpose Airtime',
        value: 23000,
        formattedValue: 'R230',
        validity: '30 days'
      },
      {
        type: 'whatsapp',
        label: 'WhatsApp Data',
        value: 209715200,
        formattedValue: '200MB',
        validity: '30 days',
        description: 'FUP applies'
      }
    ]
  },
  '40897': {
    productId: '40897',
    name: 'Limes200',
    monthlyCostCents: 20000,
    monthlyCostRands: 200,
    validity: '30 Days',
    shortSummary: '1GB Zero-Rated Data + R200 Airtime',
    displayDescription: '1GB zero-rated data (90 days) plus R200 general purpose airtime',
    benefits: [
      {
        type: 'zero_rated_data',
        label: 'Zero Rated Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '90 days'
      },
      {
        type: 'gpa_credit',
        label: 'General Purpose Airtime',
        value: 20000,
        formattedValue: 'R200',
        validity: '30 days'
      }
    ]
  },
  '40898': {
    productId: '40898',
    name: 'Limes229',
    monthlyCostCents: 22900,
    monthlyCostRands: 229,
    validity: '30 Days',
    shortSummary: '1GB Zero-Rated + R230 Airtime + 200MB WhatsApp',
    displayDescription: '1GB zero-rated data (90 days), R230 airtime, and 200MB WhatsApp data',
    benefits: [
      {
        type: 'zero_rated_data',
        label: 'Zero Rated Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '90 days'
      },
      {
        type: 'gpa_credit',
        label: 'General Purpose Airtime',
        value: 23000,
        formattedValue: 'R230',
        validity: '30 days'
      },
      {
        type: 'whatsapp',
        label: 'WhatsApp Data',
        value: 209715200,
        formattedValue: '200MB',
        validity: '30 days',
        description: 'FUP applies'
      }
    ]
  },
  '40899': {
    productId: '40899',
    name: 'Limes279',
    monthlyCostCents: 27900,
    monthlyCostRands: 279,
    validity: '30 Days',
    shortSummary: '1GB Zero-Rated + R280 Airtime + 200MB WhatsApp',
    displayDescription: '1GB zero-rated data (90 days), R280 airtime, and 200MB WhatsApp data',
    benefits: [
      {
        type: 'zero_rated_data',
        label: 'Zero Rated Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '90 days'
      },
      {
        type: 'gpa_credit',
        label: 'General Purpose Airtime',
        value: 28000,
        formattedValue: 'R280',
        validity: '30 days'
      },
      {
        type: 'whatsapp',
        label: 'WhatsApp Data',
        value: 209715200,
        formattedValue: '200MB',
        validity: '30 days',
        description: 'FUP applies'
      }
    ]
  },
  '40900': {
    productId: '40900',
    name: 'Limes319',
    monthlyCostCents: 31900,
    monthlyCostRands: 319,
    validity: '30 Days',
    shortSummary: '1GB Zero-Rated + R320 Airtime + 200MB WhatsApp',
    displayDescription: '1GB zero-rated data (90 days), R320 airtime, and 200MB WhatsApp data',
    benefits: [
      {
        type: 'zero_rated_data',
        label: 'Zero Rated Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '90 days'
      },
      {
        type: 'gpa_credit',
        label: 'General Purpose Airtime',
        value: 32000,
        formattedValue: 'R320',
        validity: '30 days'
      },
      {
        type: 'whatsapp',
        label: 'WhatsApp Data',
        value: 209715200,
        formattedValue: '200MB',
        validity: '30 days',
        description: 'FUP applies'
      }
    ]
  },
  '40901': {
    productId: '40901',
    name: 'Limes399',
    monthlyCostCents: 39900,
    monthlyCostRands: 399,
    validity: '30 Days',
    shortSummary: '1GB Zero-Rated + 10GB Data + 750 Minutes Voice',
    displayDescription: '1GB zero-rated data (90 days), 10GB promotional data, and 750 minutes voice calls',
    benefits: [
      {
        type: 'zero_rated_data',
        label: 'Zero Rated Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '90 days'
      },
      {
        type: 'voice',
        label: 'Voice Minutes',
        value: 45000,
        formattedValue: '750 minutes',
        validity: '30 days'
      },
      {
        type: 'promo_data',
        label: 'Promotional Data',
        value: 10737418240,
        formattedValue: '10GB',
        validity: '30 days'
      }
    ]
  },
  '40902': {
    productId: '40902',
    name: 'Limes159',
    monthlyCostCents: 15900,
    monthlyCostRands: 159,
    validity: '30 Days',
    shortSummary: '1GB Zero-Rated + 1GB Data + 1GB WhatsApp + R100 Airtime',
    displayDescription: '1GB zero-rated data (90 days), 1GB standard data, 1GB WhatsApp data, and R100 airtime',
    benefits: [
      {
        type: 'zero_rated_data',
        label: 'Zero Rated Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '90 days'
      },
      {
        type: 'gpa_credit',
        label: 'General Purpose Airtime',
        value: 10000,
        formattedValue: 'R100',
        validity: '30 days'
      },
      {
        type: 'whatsapp',
        label: 'WhatsApp Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '30 days',
        description: 'FUP applies'
      },
      {
        type: 'data',
        label: 'Standard Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '30 days'
      }
    ]
  },
  '40020': {
    productId: '40020',
    name: 'Unlimited Voice + 10GB Data',
    monthlyCostCents: 39900,
    monthlyCostRands: 399,
    validity: '30 Days',
    shortSummary: 'Unlimited Voice Calls + 10GB Data',
    displayDescription: 'Unlimited voice calls to all networks plus 10GB of high-speed data',
    benefits: [
      {
        type: 'voice',
        label: 'Voice Minutes',
        value: -1, // -1 indicates unlimited
        formattedValue: 'Unlimited',
        validity: '30 days',
        description: 'Unlimited calls to all networks'
      },
      {
        type: 'data',
        label: 'Data',
        value: 10737418240,
        formattedValue: '10GB',
        validity: '30 days'
      }
    ]
  }
}

/**
 * Get enriched package details by product ID
 */
export function getComboPackageDetails(productId: string): ComboPackageDetails | null {
  return COMBO_PACKAGES_MAP[productId] || null
}

/**
 * Check if a product ID is a combo package
 */
export function isComboPackage(productId: string): boolean {
  return productId in COMBO_PACKAGES_MAP
}
