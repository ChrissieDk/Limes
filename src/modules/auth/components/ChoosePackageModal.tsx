import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextField from './TextField'
import FileUpload from './FileUpload'
import ShippingModal from './ShippingModal'
import { crmService } from '../../crm/services/crmService'
import { ricaService } from '../../rica/services/ricaService'
import { userService } from '../services/userService'
import {
  createCustomerFormSchema,
  type CreateCustomerFormValues,
} from '../validation/createCustomerSchemas'
import type { CreateAccountCustomerRequest, CatalogProduct } from '../../../types'

type Step = 1 | 2 | 3 | 4 | 5 | 6

const STEP_1_FIELDS = ['title', 'firstname', 'lastname', 'idType', 'idNumber', 'billEmail', 'billLanguage'] as const
const STEP_2_FIELDS = ['streetNo', 'streetName', 'suburb', 'city', 'stateOrProvince', 'postCode', 'country'] as const
const STEP_3_FIELDS = ['phoneNumber'] as const
const STEP_4_FIELDS = ['custFirstname', 'custLastname', 'custStreetNo', 'custStreetName', 'custSuburb', 'custCity', 'custStateOrProvince', 'custPostCode', 'custCountry'] as const

const defaultFormValues: CreateCustomerFormValues = {
  title: 'Mr',
  firstname: '',
  lastname: '',
  idType: 'ID',
  idNumber: '',
  billEmail: '',
  billLanguage: 'en-gb',
  streetNo: '',
  streetName: '',
  suburb: '',
  city: '',
  stateOrProvince: '',
  postCode: '',
  country: 'South Africa',
  phoneNumber: '',
  custFirstname: '',
  custLastname: '',
  custStreetNo: '',
  custStreetName: '',
  custSuburb: '',
  custCity: '',
  custStateOrProvince: '',
  custPostCode: '',
  custCountry: 'South Africa',
}

interface ChoosePackageModalProps {
  open: boolean
  onClose: () => void
  selectedPackage?: CatalogProduct | null
}

export default function ChoosePackageModal({ open, onClose, selectedPackage }: ChoosePackageModalProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const isResidential = true
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accountCreated, setAccountCreated] = useState(false)
  const [showShippingModal, setShowShippingModal] = useState(false)

  const form = useForm<CreateCustomerFormValues>({
    resolver: zodResolver(createCustomerFormSchema),
    defaultValues: defaultFormValues,
    mode: 'onBlur',
  })
  const { register, formState: { errors }, trigger, getValues, reset } = form

  // Document upload states
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idUploaded, setIdUploaded] = useState(false)
  const [idUploading, setIdUploading] = useState(false)
  const [, setIdSignedUrl] = useState<string | null>(null)

  const [poaFile, setPoaFile] = useState<File | null>(null)
  const [poaUploaded, setPoaUploaded] = useState(false)
  const [poaUploading, setPoaUploading] = useState(false)
  const [, setPoaSignedUrl] = useState<string | null>(null)

  const hasDeposit = false
  const creditLimit = 0
  const taxSchemeId = 'VB8'
  const collectionPlanId = 'STD9'
  const contactType = 'MOBILE_NO' as const
  const useParentAddressType = 'BILLING' as const
  const isAccountOwner = true
  const isServiceOwner = false
  const custIsResidential = true
  const requireSecurityQuestions = false

  // ESC key disabled - user must explicitly click X to close during RICA flow
  // useEffect(() => {
  //   if (!open) return
  //   const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
  //   document.addEventListener('keydown', onKey)
  //   return () => document.removeEventListener('keydown', onKey)
  // }, [open, onClose])

  // Reset modal state and check account when modal opens
  useEffect(() => {
    if (!open) return

    setStep(1)
    setAccountCreated(false)
    setError(null)
    setIdFile(null)
    setIdUploaded(false)
    setPoaFile(null)
    setPoaUploaded(false)
    reset(defaultFormValues)

    const checkHasAccount = async () => {
      try {
        const accountExists = await userService.hasAccount()

        if (accountExists) {
          try {
            const accountCustomer = await crmService.getAccountCustomer()
            const billingAddress = accountCustomer.address?.find((addr) => addr.addressType === 'BILLING')
            const postalAddress = accountCustomer.customer?.address?.find((addr) => addr.addressType === 'POSTAL')

            reset({
              ...defaultFormValues,
              title: (accountCustomer.detail.title as CreateCustomerFormValues['title']) || 'Mr',
              firstname: accountCustomer.detail.firstname || '',
              lastname: accountCustomer.detail.lastname || '',
              idType: (accountCustomer.detail.identification?.idType as 'ID' | 'PASSPORT') || 'ID',
              idNumber: accountCustomer.detail.identification?.idNumber || '',
              billEmail: accountCustomer.detail.billMedia?.emailAddress || '',
              streetNo: billingAddress?.streetNo || '',
              streetName: billingAddress?.streetName || '',
              suburb: billingAddress?.suburb || '',
              city: billingAddress?.city || '',
              stateOrProvince: billingAddress?.stateOrProvince || '',
              postCode: billingAddress?.postCode || '',
              country: billingAddress?.country || 'South Africa',
              phoneNumber: accountCustomer.phone?.phoneNumber || '',
              custFirstname: accountCustomer.customer?.detail?.firstname || '',
              custLastname: accountCustomer.customer?.detail?.lastname || '',
              custStreetNo: postalAddress?.streetNo || '',
              custStreetName: postalAddress?.streetName || '',
              custSuburb: postalAddress?.suburb || '',
              custCity: postalAddress?.city || '',
              custStateOrProvince: postalAddress?.stateOrProvince || '',
              custPostCode: postalAddress?.postCode || '',
              custCountry: postalAddress?.country || 'South Africa',
            })
          } catch (accountCustomerErr) {
            console.error('[RICA] Failed to prefill account customer details:', accountCustomerErr)
          }

          setAccountCreated(true)
          setStep(5)
        }
      } catch (err) {
        console.error('[RICA] Error checking hasAccount:', err)
      }
    }

    checkHasAccount()
  }, [open, reset])

  const handleNext = async () => {
    if (step === 1) {
      const valid = await trigger(STEP_1_FIELDS as unknown as (keyof CreateCustomerFormValues)[])
      if (valid) setStep(2)
    } else if (step === 2) {
      const valid = await trigger(STEP_2_FIELDS as unknown as (keyof CreateCustomerFormValues)[])
      if (valid) setStep(3)
    } else if (step === 3) {
      const valid = await trigger(STEP_3_FIELDS as unknown as (keyof CreateCustomerFormValues)[])
      if (valid) setStep(4)
    } else if (step === 5) {
      setStep(6)
    }
  }

  const handleCreateAccount = async () => {
    const valid = await trigger(STEP_4_FIELDS as unknown as (keyof CreateCustomerFormValues)[])
    if (!valid) return

    setIsSubmitting(true)
    setError(null)

    const v = getValues()

    try {
      const payload: CreateAccountCustomerRequest = {
        isResidential,
        detail: {
          title: v.title,
          firstname: v.firstname,
          lastname: v.lastname,
          creditLimit,
          hasDeposit,
          identification: {
            idType: v.idType,
            idNumber: v.idNumber,
          },
          billMedia: {
            mediaType: 'EMAIL',
            emailAddress: v.billEmail,
            generationLevel: 'ACCOUNT',
            language: v.billLanguage,
          },
        },
        address: [
          {
            addressType: 'BILLING',
            streetNo: v.streetNo,
            streetName: v.streetName,
            suburb: v.suburb,
            city: v.city,
            stateOrProvince: v.stateOrProvince,
            postCode: v.postCode,
            country: v.country,
          },
        ],
        taxScheme: { id: taxSchemeId },
        collectionPlan: { id: collectionPlanId },
        phone: {
          phoneNumber: v.phoneNumber,
          contactType,
        },
        contact: {
          useParentAddressType,
          primaryContactRole: 'CUSTOMER',
          isAccountOwner,
          isServiceOwner,
        },
        customer: {
          isResidential: custIsResidential,
          detail: {
            firstname: v.custFirstname,
            lastname: v.custLastname,
            requireSecurityQuestions,
          },
          address: [
            {
              addressType: 'POSTAL',
              streetNo: v.custStreetNo,
              streetName: v.custStreetName,
              suburb: v.custSuburb,
              city: v.custCity,
              stateOrProvince: v.custStateOrProvince,
              postCode: v.custPostCode,
              country: v.custCountry,
            },
          ],
        },
      }

      await crmService.createAccountCustomer(payload)

      // If we got a response without an error, consider it successful
      setAccountCreated(true)
      setStep(5) // Move to ID upload step
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || ''
      
      // If account already exists, treat it as success and allow user to continue to uploads
      if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('duplicate')) {
  
        setAccountCreated(true)
        setStep(5) // Move to ID upload step
      } else {
        setError(errorMessage || 'An error occurred while creating the account')
        console.error('Account creation error:', err)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleIdFileSelect = async (file: File) => {
    setIdFile(file)
    setIdUploading(true)
    setError(null)

    try {
      // Upload the file
      const uploadResponse = await ricaService.uploadId(file)
      
      // If upload succeeded (has path), fetch the signed URL
      if (uploadResponse.path) {
        const signedUrlResponse = await ricaService.getIdSignedUrl()
        
        setIdSignedUrl(signedUrlResponse.signedUrl)
        setIdUploaded(true)
      } else {
        setError('Upload completed but no path returned')
        setIdFile(null)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while uploading the ID document')
      console.error('ID upload error:', err)
      setIdFile(null)
    } finally {
      setIdUploading(false)
    }
  }

  const handlePoaFileSelect = async (file: File) => {
    setPoaFile(file)
    setPoaUploading(true)
    setError(null)

    try {
      // Upload the file
      const uploadResponse = await ricaService.uploadProofOfAddress(file)
      
      // If upload succeeded (has path), fetch the signed URL
      if (uploadResponse.path) {
        const signedUrlResponse = await ricaService.getPoaSignedUrl()
        
        setPoaSignedUrl(signedUrlResponse.signedUrl)
        setPoaUploaded(true)
      } else {
        setError('Upload completed but no path returned')
        setPoaFile(null)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while uploading the proof of address')
      setPoaFile(null)
    } finally {
      setPoaUploading(false)
    }
  }

  const handleFinalSubmit = () => {
    // RICA process completed successfully
    // NEW FLOW: Open payment modal directly
    // Subscriber will be created AFTER successful payment
    setShowShippingModal(true)
  }

  const handleShippingClose = () => {
    setShowShippingModal(false)
    onClose()
    navigate('/dashboard')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      {/* Backdrop click disabled - user must explicitly click X to close during RICA flow */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-xl mx-0 sm:mx-4 rounded-2xl bg-white text-neutral-900 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[82vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <div className="font-normal text-xl">Choose a package</div>
            <div className="text-sm text-neutral-500">Provide details to create your account</div>
          </div>
          <button aria-label="Close" className="size-10 grid place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 text-2xl" onClick={onClose}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-4 pb-5">
          {/* Progress */}
          <div className="flex items-center justify-center gap-5 mb-6">
            {[1, 2, 3, 4, 5, 6].map((s) => {
              const completed = step >= s
              return (
                <div
                  key={s}
                  aria-hidden="true"
                  className={`size-3.5 rounded-full ${completed ? 'bg-[#ABFF63]' : 'bg-neutral-300'}`}
                />
              )
            })}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step content */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="grid gap-2">
                  <span className="text-sm text-neutral-700">Title</span>
                  <select className="h-12 rounded-xl bg-white ring-1 ring-neutral-300 text-black px-3 text-sm" {...register('title')}>
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Dr">Dr</option>
                  </select>
                </label>
              </div>
              <TextField label="First name" {...register('firstname')} error={errors.firstname?.message} />
              <TextField label="Last name" {...register('lastname')} error={errors.lastname?.message} />
              <div>
                <label className="grid gap-2">
                  <span className="text-sm text-neutral-700">ID type</span>
                  <select className="h-12 rounded-xl bg-white ring-1 ring-neutral-300 text-black px-3 text-sm" {...register('idType')}>
                    <option value="ID">ID</option>
                    <option value="PASSPORT">Passport</option>
                  </select>
                </label>
              </div>
              <TextField label="ID number" {...register('idNumber')} error={errors.idNumber?.message} />
              <TextField label="Email for billing" type="email" {...register('billEmail')} error={errors.billEmail?.message} />
              <div>
                <label className="grid gap-2">
                  <span className="text-sm text-neutral-700">Bill language</span>
                  <select className="h-12 rounded-xl bg-white ring-1 ring-neutral-300 text-black px-3 text-sm" {...register('billLanguage')} disabled>
                    <option value="en-gb">English (GB)</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Street number" {...register('streetNo')} error={errors.streetNo?.message} />
              <TextField label="Street name" {...register('streetName')} error={errors.streetName?.message} />
              <TextField label="Suburb" {...register('suburb')} error={errors.suburb?.message} />
              <TextField label="City" {...register('city')} error={errors.city?.message} />
              <TextField label="State/Province" {...register('stateOrProvince')} error={errors.stateOrProvince?.message} />
              <TextField label="Post code" {...register('postCode')} error={errors.postCode?.message} />
              <TextField label="Country" {...register('country')} error={errors.country?.message} />
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Phone number" {...register('phoneNumber')} error={errors.phoneNumber?.message} />
              <div>
                <label className="grid gap-2">
                  <span className="text-sm text-neutral-700">Contact type</span>
                  <select className="h-12 rounded-xl bg-white ring-1 ring-neutral-300 text-black px-3 text-sm" disabled>
                    <option value="MOBILE_NO">Mobile</option>
                  </select>
                </label>
              </div>
              <div>
                <label className="grid gap-2">
                  <span className="text-sm text-neutral-700">Use parent address type</span>
                  <select className="h-12 rounded-xl bg-white ring-1 ring-neutral-300 text-black px-3 text-sm" disabled>
                    <option value="BILLING">Billing</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="First name" {...register('custFirstname')} error={errors.custFirstname?.message} />
              <TextField label="Last name" {...register('custLastname')} error={errors.custLastname?.message} />
              <TextField label="Postal street number" {...register('custStreetNo')} error={errors.custStreetNo?.message} />
              <TextField label="Postal street name" {...register('custStreetName')} error={errors.custStreetName?.message} />
              <TextField label="Postal suburb" {...register('custSuburb')} error={errors.custSuburb?.message} />
              <TextField label="Postal city" {...register('custCity')} error={errors.custCity?.message} />
              <TextField label="Postal state/province" {...register('custStateOrProvince')} error={errors.custStateOrProvince?.message} />
              <TextField label="Postal post code" {...register('custPostCode')} error={errors.custPostCode?.message} />
              <TextField label="Postal country" {...register('custCountry')} error={errors.custCountry?.message} />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Upload ID Document</h3>
                <p className="text-sm text-neutral-600">Please upload a clear copy of your ID or passport</p>
              </div>
              {idUploading ? (
                <div className="text-center py-12">
                  <div className="inline-block size-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
                  <p className="mt-4 text-neutral-600">Uploading document...</p>
                </div>
              ) : (
                <FileUpload
                  label="ID Document"
                  onFileSelect={handleIdFileSelect}
                  accept="image/*,application/pdf"
                  uploadedFileName={idFile?.name}
                />
              )}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Upload Proof of Address</h3>
                <p className="text-sm text-neutral-600">Please upload a recent utility bill or bank statement</p>
              </div>
              {poaUploading ? (
                <div className="text-center py-12">
                  <div className="inline-block size-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
                  <p className="mt-4 text-neutral-600">Uploading document...</p>
                </div>
              ) : (
                <FileUpload
                  label="Proof of Address"
                  onFileSelect={handlePoaFileSelect}
                  accept="image/*,application/pdf"
                  uploadedFileName={poaFile?.name}
                />
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-6">
            <button 
              disabled={isSubmitting || idUploading || poaUploading}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 text-neutral-900 font-semibold px-5 py-2.5 hover:bg-neutral-200 disabled:opacity-60 active:scale-[0.99] transition" 
              onClick={step === 1 ? onClose : () => setStep((s) => (Math.max(1, (s - 1) as Step)) as Step)}
            >
              <span>{step === 1 ? 'Cancel' : 'Back'}</span>
            </button>
            <div className="flex items-center gap-2">
              {step < 4 ? (
                <button 
                  type="button"
                  disabled={isSubmitting || idUploading || poaUploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-lime-400 text-neutral-900 font-semibold px-5 py-2.5 hover:bg-lime-300 disabled:opacity-60 active:scale-[0.99] transition" 
                  onClick={handleNext}
                >
                  Next →
                </button>
              ) : step === 4 ? (
                <button 
                  disabled={isSubmitting || accountCreated} 
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 text-white font-semibold px-5 py-2.5 hover:bg-neutral-800 disabled:opacity-60 active:scale-[0.99] transition" 
                  onClick={handleCreateAccount}
                >
                  {isSubmitting ? 'Creating account...' : accountCreated ? 'Account created ✓' : 'Create Account'}
                </button>
              ) : step === 5 ? (
                <button 
                  disabled={!idUploaded || idUploading} 
                  className="inline-flex items-center gap-2 rounded-xl bg-lime-400 text-neutral-900 font-semibold px-5 py-2.5 hover:bg-lime-300 disabled:opacity-60 active:scale-[0.99] transition" 
                  onClick={() => setStep(6)}
                >
                  Next →
                </button>
              ) : (
                <button 
                  disabled={!poaUploaded || poaUploading} 
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 text-white font-semibold px-5 py-2.5 hover:bg-neutral-800 disabled:opacity-60 active:scale-[0.99] transition" 
                  onClick={handleFinalSubmit}
                >
                  Complete RICA
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Shipping Modal - shown after RICA completion */}
      {showShippingModal && selectedPackage && (() => {
        const v = getValues()
        return (
          <ShippingModal
            open={showShippingModal}
            onClose={handleShippingClose}
            selectedPackage={{
              productId: selectedPackage.productId || selectedPackage.id,
              simPackageProductId: selectedPackage.simPackageProductId,
              name: selectedPackage.name,
              price: selectedPackage.price,
              packageType: selectedPackage.packageType,
              simStatus: selectedPackage.simStatus,
              planChargeType: selectedPackage.planChargeType,
              iccid: selectedPackage.iccid,
              features: {
                mobileData: selectedPackage.description || selectedPackage.features?.mobileData,
              }
            }}
            defaultAddress={{
              streetNo: v.streetNo,
              streetName: v.streetName,
              suburb: v.suburb,
              city: v.city,
              stateOrProvince: v.stateOrProvince,
              postCode: v.postCode,
              country: v.country,
            }}
            customerEmail={v.billEmail}
            customerName={`${v.firstname} ${v.lastname}`}
            customerPhone={v.phoneNumber}
            ricaData={{
              address: {
                streetNo: v.streetNo,
                streetName: v.streetName,
                suburb: v.suburb || '',
                city: v.city,
                stateOrProvince: v.stateOrProvince,
                postCode: v.postCode,
                country: v.country,
              },
              customerInfo: {
                firstname: v.firstname,
                lastname: v.lastname,
                billEmail: v.billEmail,
                phoneNumber: v.phoneNumber,
              }
            }}
          />
        )
      })()}
    </div>
  )
}


