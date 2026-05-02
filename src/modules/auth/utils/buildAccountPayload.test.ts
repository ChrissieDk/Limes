import { describe, it, expect } from 'vitest'
import { buildAccountPayload } from './buildAccountPayload'
import type { CreateCustomerFormValues } from '../validation/createCustomerSchemas'

describe('buildAccountPayload', () => {
  const baseValues: CreateCustomerFormValues = {
    title: 'Mr',
    firstname: 'John',
    lastname: 'Doe',
    idType: 'ID',
    idNumber: '1234567890123',
    billEmail: 'john@example.com',
    billLanguage: 'en-gb',
    streetNo: '1',
    streetName: 'Main St',
    suburb: ' suburb',
    city: 'Cape Town',
    stateOrProvince: 'Western Cape',
    postCode: '8000',
    country: 'South Africa',
    phoneNumber: '0821234567',
    custFirstname: 'Jane',
    custLastname: 'Doe',
    custStreetNo: '2',
    custStreetName: 'High St',
    custSuburb: 'Clifton',
    custCity: 'Cape Town',
    custStateOrProvince: 'Western Cape',
    custPostCode: '8001',
    custCountry: 'South Africa',
  }

  it('builds correct billing address', () => {
    const payload = buildAccountPayload(baseValues)
    expect(payload.address[0]).toEqual({
      addressType: 'BILLING',
      streetNo: '1',
      streetName: 'Main St',
      suburb: ' suburb',
      city: 'Cape Town',
      stateOrProvince: 'Western Cape',
      postCode: '8000',
      country: 'South Africa',
    })
  })

  it('builds correct customer postal address', () => {
    const payload = buildAccountPayload(baseValues)
    expect(payload.customer.address[0]).toEqual({
      addressType: 'POSTAL',
      streetNo: '2',
      streetName: 'High St',
      suburb: 'Clifton',
      city: 'Cape Town',
      stateOrProvince: 'Western Cape',
      postCode: '8001',
      country: 'South Africa',
    })
  })

  it('sets identification correctly', () => {
    const payload = buildAccountPayload(baseValues)
    expect(payload.detail.identification).toEqual({ idType: 'ID', idNumber: '1234567890123' })
  })

  it('sets phone with MOBILE_NO contact type', () => {
    const payload = buildAccountPayload(baseValues)
    expect(payload.phone).toEqual({ phoneNumber: '0821234567', contactType: 'MOBILE_NO' })
  })

  it('sets fixed values for tax scheme and collection plan', () => {
    const payload = buildAccountPayload(baseValues)
    expect(payload.taxScheme).toEqual({ id: 'VB8' })
    expect(payload.collectionPlan).toEqual({ id: 'STD9' })
    expect(payload.isResidential).toBe(true)
    expect(payload.detail.hasDeposit).toBe(false)
    expect(payload.detail.creditLimit).toBe(0)
  })
})
