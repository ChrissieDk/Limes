export interface MoneyAmount {
  unit: string
  value: number
}

export type BalanceKind = 'CURRENT' | 'OVERDUE' | 'UNBILLED'

export interface AccountBalance {
  amount: MoneyAmount
  type: BalanceKind
}

export interface RelatedParty {
  id: string
  name: string
  referredType: string
}

export interface Identification {
  idType: string
  idNumber: string
}

export interface BillMedia {
  generationLevel: string
  language: string
}

export interface Consent {
  allowMarketing: boolean
  communicationChannels: string[]
  forceSecurityQuestions: boolean
  allowArchiving: boolean
  allowanceSharing: string
}

export interface AccountDetail {
  faultPriority: number
  title: string
  firstname: string
  lastname: string
  isSeniorCitizen: boolean
  creditRating: string
  hasDeposit: boolean
  identification: Identification
  billMedia: BillMedia
  consent: Consent
}

export interface AccountAddress {
  addressId: number
  country: string
  oneLineAddress: string
  addressType: string
  streetNo: string
  streetName: string
  suburb: string
  city: string
  stateOrProvince: string
  postCode: string
}

export interface NamedEntity {
  id: string
  name: string
}

export interface DefaultPaymentMethod {
  id: string
}

export interface CrmAccount {
  billingStatus: string
  balance: AccountBalance[]
  relatedParty: RelatedParty[]
  isPaidByAnotherAccount: boolean
  state: string
  isResidential: boolean
  detail: AccountDetail
  address: AccountAddress[]
  currency: NamedEntity
  taxScheme: NamedEntity
  collectionPlan: NamedEntity
  defaultPaymentMethod: DefaultPaymentMethod
  billCycle: string
  class: string
  id: string
  name: string
}

export interface SearchAccountsResponse {
  data: CrmAccount[]
  page: number
  limit: number
  items: number
  totalPages: number
  totalItems: number
  isLastPage: boolean
  isFirstPage: boolean
}

export interface SearchAccountsQuery {
  idnum?: string
  idtype?: string
  name?: string
  fname?: string
  lname?: string
  state?: string
  bcycle?: string
  relId?: string
  type?: string
  category?: string
  class?: string
  id?: string
  page?: number
  limit?: number
}


