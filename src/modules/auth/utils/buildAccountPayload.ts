import type { CreateAccountCustomerRequest } from '../../../types'
import type { CreateCustomerFormValues } from '../validation/createCustomerSchemas'

export function buildAccountPayload(values: CreateCustomerFormValues): CreateAccountCustomerRequest {
  return {
    isResidential: true,
    detail: {
      title: values.title,
      firstname: values.firstname,
      lastname: values.lastname,
      creditLimit: 0,
      hasDeposit: false,
      identification: {
        idType: values.idType,
        idNumber: values.idNumber,
      },
      billMedia: {
        mediaType: 'EMAIL',
        emailAddress: values.billEmail,
        generationLevel: 'ACCOUNT',
        language: values.billLanguage,
      },
    },
    address: [
      {
        addressType: 'BILLING',
        streetNo: values.streetNo,
        streetName: values.streetName,
        suburb: values.suburb,
        city: values.city,
        stateOrProvince: values.stateOrProvince,
        postCode: values.postCode,
        country: values.country,
      },
    ],
    taxScheme: { id: 'VB8' },
    collectionPlan: { id: 'STD9' },
    phone: {
      phoneNumber: values.phoneNumber,
      contactType: 'MOBILE_NO',
    },
    contact: {
      useParentAddressType: 'BILLING',
      primaryContactRole: 'CUSTOMER',
      isAccountOwner: true,
      isServiceOwner: false,
    },
    customer: {
      isResidential: true,
      detail: {
        firstname: values.custFirstname,
        lastname: values.custLastname,
        requireSecurityQuestions: false,
      },
      address: [
        {
          addressType: 'POSTAL',
          streetNo: values.custStreetNo,
          streetName: values.custStreetName,
          suburb: values.custSuburb,
          city: values.custCity,
          stateOrProvince: values.custStateOrProvince,
          postCode: values.custPostCode,
          country: values.custCountry,
        },
      ],
    },
  }
}
