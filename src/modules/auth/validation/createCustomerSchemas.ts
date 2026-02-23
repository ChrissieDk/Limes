import { z } from 'zod'
import { isValidSouthAfricanId } from './idValidation'

// Shared validators - short, descriptive error messages
const nameSchema = z
  .string()
  .min(1, 'Required')
  .max(100, 'Max 100 characters')
  .regex(/^[\p{L}\p{M}\s\-']+$/u, 'Letters only')

const emailSchema = z
  .string()
  .min(1, 'Required')
  .email('Invalid email')

const idNumberBaseSchema = z.string().min(1, 'Required')

const phoneSchema = z
  .string()
  .min(1, 'Required')
  .min(9, 'Invalid mobile number')
  .max(15, 'Invalid mobile number')
  .regex(/^[\d\s\-+()]+$/, 'Digits only')

const streetNoSchema = z
  .string()
  .min(1, 'Required')
  .max(20, 'Max 20 characters')

const streetNameSchema = z
  .string()
  .min(1, 'Required')
  .max(100, 'Max 100 characters')

const suburbSchema = z.string().max(100, 'Max 100 characters')

const citySchema = z
  .string()
  .min(1, 'Required')
  .max(100, 'Max 100 characters')

const stateOrProvinceSchema = z
  .string()
  .min(1, 'Required')
  .max(100, 'Max 100 characters')

const postCodeSchema = z
  .string()
  .min(1, 'Required')
  .max(20, 'Max 20 characters')

const countrySchema = z
  .string()
  .min(1, 'Required')
  .max(100, 'Max 100 characters')

// Step 1: Account detail
export const createCustomerStep1Schema = z.object({
  title: z.enum(['Mr', 'Ms', 'Mrs', 'Dr']),
  firstname: nameSchema,
  lastname: nameSchema,
  idType: z.enum(['ID', 'PASSPORT']),
  idNumber: idNumberBaseSchema,
  billEmail: emailSchema,
  billLanguage: z.enum(['en-gb']),
})

// Step 2: Billing address
export const createCustomerStep2Schema = z.object({
  streetNo: streetNoSchema,
  streetName: streetNameSchema,
  suburb: suburbSchema,
  city: citySchema,
  stateOrProvince: stateOrProvinceSchema,
  postCode: postCodeSchema,
  country: countrySchema,
})

// Step 3: Phone
export const createCustomerStep3Schema = z.object({
  phoneNumber: phoneSchema,
})

// Step 4: Customer + postal address
export const createCustomerStep4Schema = z.object({
  custFirstname: nameSchema,
  custLastname: nameSchema,
  custStreetNo: streetNoSchema,
  custStreetName: streetNameSchema,
  custSuburb: suburbSchema,
  custCity: citySchema,
  custStateOrProvince: stateOrProvinceSchema,
  custPostCode: postCodeSchema,
  custCountry: countrySchema,
})

// Combined schema for the full form (steps 1-4)
export const createCustomerFormSchema = createCustomerStep1Schema
  .merge(createCustomerStep2Schema)
  .merge(createCustomerStep3Schema)
  .merge(createCustomerStep4Schema)
  .superRefine((data, ctx) => {
    if (data.idType === 'ID' && !isValidSouthAfricanId(data.idNumber)) {
      ctx.addIssue({ code: 'custom', message: 'Invalid ID format', path: ['idNumber'] })
    }
    if (data.idType === 'PASSPORT' && !/^[A-Za-z0-9]{9,12}$/.test(data.idNumber)) {
      ctx.addIssue({ code: 'custom', message: 'Invalid passport number', path: ['idNumber'] })
    }
  })

export type CreateCustomerFormValues = z.infer<typeof createCustomerFormSchema>
