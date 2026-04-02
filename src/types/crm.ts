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

// RICA Flow - Account Creation Types
export interface RicaIdentification {
  idType: 'ID' | 'PASSPORT'
  idNumber: string
}

export interface RicaBillMedia {
  mediaType: 'EMAIL'
  emailAddress: string
  generationLevel: 'ACCOUNT'
  language: 'en-gb' | 'en-za' | 'af-za'
}

export interface RicaAccountDetail {
  title: string
  firstname: string
  lastname: string
  creditLimit: number
  hasDeposit: boolean
  identification: RicaIdentification
  billMedia: RicaBillMedia
}

export interface RicaAddress {
  addressType: 'BILLING' | 'POSTAL'
  streetNo: string
  streetName: string
  suburb?: string
  city: string
  stateOrProvince: string
  postCode: string
  country: string
}

export interface RicaTaxScheme {
  id: string
}

export interface RicaCollectionPlan {
  id: string
}

export interface RicaPhone {
  phoneNumber: string
  contactType: 'MOBILE_NO'
}

export interface RicaContact {
  useParentAddressType: 'BILLING'
  primaryContactRole: 'CUSTOMER'
  isAccountOwner: boolean
  isServiceOwner: boolean
}

export interface RicaCustomerDetail {
  firstname: string
  lastname: string
  requireSecurityQuestions: boolean
}

export interface RicaCustomer {
  isResidential: boolean
  detail: RicaCustomerDetail
  address: RicaAddress[]
}

export interface CreateAccountCustomerRequest {
  isResidential: boolean
  detail: RicaAccountDetail
  address: RicaAddress[]
  taxScheme: RicaTaxScheme
  collectionPlan: RicaCollectionPlan
  phone: RicaPhone
  contact: RicaContact
  customer: RicaCustomer
}

export interface CreateAccountCustomerResponse {
  // API returns the account/customer object directly
  // Can include any fields - we just check if request succeeded
  [key: string]: any
}

// Get Account Customer Response (same structure as create request)
export interface GetAccountCustomerResponse {
  isResidential: boolean
  detail: RicaAccountDetail
  address: RicaAddress[]
  taxScheme: RicaTaxScheme
  collectionPlan: RicaCollectionPlan
  phone: RicaPhone
  contact: RicaContact
  customer: RicaCustomer
}

/** PATCH /crm/update/customer */
export interface UpdateCustomerDetailPayload {
  firstname: string
  lastname: string
  requireSecurityQuestions: boolean
}

export interface UpdateCustomerAddressPayload {
  addressType: number
  streetNo: string
  streetName: string
  suburb: string
  city: string
  stateOrProvince: string
  postCode: string
  country: string
}

export interface UpdateCustomerRequest {
  isResidential: boolean
  detail: UpdateCustomerDetailPayload
  address: UpdateCustomerAddressPayload[]
}


