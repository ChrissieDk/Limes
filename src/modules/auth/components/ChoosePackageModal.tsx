import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TextField from './TextField'
import Checkbox from './Checkbox'
import FileUpload from './FileUpload'
import ShippingModal from './ShippingModal'
import { crmService } from '../../crm/services/crmService'
import { ricaService } from '../../rica/services/ricaService'
import type { CreateAccountCustomerRequest, CatalogProduct } from '../../../types'

type Step = 1 | 2 | 3 | 4 | 5 | 6

interface ChoosePackageModalProps {
  open: boolean
  onClose: () => void
  selectedPackage?: CatalogProduct | null
}

export default function ChoosePackageModal({ open, onClose, selectedPackage }: ChoosePackageModalProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [isResidential, setIsResidential] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accountCreated, setAccountCreated] = useState(false)
  const [showShippingModal, setShowShippingModal] = useState(false)

  // Document upload states
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idUploaded, setIdUploaded] = useState(false)
  const [idUploading, setIdUploading] = useState(false)
  const [idSignedUrl, setIdSignedUrl] = useState<string | null>(null)
  
  const [poaFile, setPoaFile] = useState<File | null>(null)
  const [poaUploaded, setPoaUploaded] = useState(false)
  const [poaUploading, setPoaUploading] = useState(false)
  const [poaSignedUrl, setPoaSignedUrl] = useState<string | null>(null)

  // Detail
  const [title, setTitle] = useState('Mr')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [hasDeposit, setHasDeposit] = useState(false)
  const [idType, setIdType] = useState<'ID' | 'PASSPORT'>('ID')
  const [idNumber, setIdNumber] = useState('')
  // Email is the only supported bill medium for now (implicit)
  const [billEmail, setBillEmail] = useState('')
  // Billing generation level fixed at ACCOUNT (implicit)
  const [billLanguage, setBillLanguage] = useState<'en-gb' | 'en-za' | 'af-za'>('en-gb')

  // Address (billing)
  const [streetNo, setStreetNo] = useState('')
  const [streetName, setStreetName] = useState('')
  const [suburb, setSuburb] = useState('')
  const [city, setCity] = useState('')
  const [stateOrProvince, setStateOrProvince] = useState('')
  const [postCode, setPostCode] = useState('')
  const [country, setCountry] = useState('South Africa')

  // Hardcoded values (never user-editable)
  const creditLimit = 0
  const taxSchemeId = 'VB8'
  const collectionPlanId = 'STD9'

  // Misc
  const [phoneNumber, setPhoneNumber] = useState('')
  const [contactType, setContactType] = useState<'MOBILE_NO'>('MOBILE_NO')
  const [useParentAddressType, setUseParentAddressType] = useState<'BILLING'>('BILLING')
  // Primary contact role fixed as CUSTOMER (implicit)
  const [isAccountOwner, setIsAccountOwner] = useState(true)
  const [isServiceOwner, setIsServiceOwner] = useState(false)

  // Customer
  const [custIsResidential, setCustIsResidential] = useState(true)
  const [custFirstname, setCustFirstname] = useState('')
  const [custLastname, setCustLastname] = useState('')
  const [requireSecurityQuestions, setRequireSecurityQuestions] = useState(false)
  const [custStreetNo, setCustStreetNo] = useState('')
  const [custStreetName, setCustStreetName] = useState('')
  const [custSuburb, setCustSuburb] = useState('')
  const [custCity, setCustCity] = useState('')
  const [custStateOrProvince, setCustStateOrProvince] = useState('')
  const [custPostCode, setCustPostCode] = useState('')
  const [custCountry, setCustCountry] = useState('South Africa')

  // ESC key disabled - user must explicitly click X to close during RICA flow
  // useEffect(() => {
  //   if (!open) return
  //   const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
  //   document.addEventListener('keydown', onKey)
  //   return () => document.removeEventListener('keydown', onKey)
  // }, [open, onClose])

  const canNext = useMemo(() => {
    if (step === 1) return firstname.trim() !== '' && lastname.trim() !== '' && idNumber.trim() !== '' && billEmail.trim() !== ''
    if (step === 2) return streetNo && streetName && city && stateOrProvince && postCode
    if (step === 3) return phoneNumber.trim() !== ''
    if (step === 4) return accountCreated // Can only proceed if account was created
    if (step === 5) return idUploaded // Can only proceed if ID was uploaded
    if (step === 6) return poaUploaded // Can only proceed if POA was uploaded
    return true
  }, [step, firstname, lastname, idNumber, billEmail, streetNo, streetName, city, stateOrProvince, postCode, phoneNumber, accountCreated, idUploaded, poaUploaded])

  const handleCreateAccount = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const payload: CreateAccountCustomerRequest = {
        isResidential,
        detail: {
          title,
          firstname,
          lastname,
          creditLimit,
          hasDeposit,
          identification: {
            idType,
            idNumber,
          },
          billMedia: {
            mediaType: 'EMAIL',
            emailAddress: billEmail,
            generationLevel: 'ACCOUNT',
            language: billLanguage,
          },
        },
        address: [
          {
            addressType: 'BILLING',
            streetNo,
            streetName,
            suburb,
            city,
            stateOrProvince,
            postCode,
            country,
          },
        ],
        taxScheme: {
          id: taxSchemeId,
        },
        collectionPlan: {
          id: collectionPlanId,
        },
        phone: {
          phoneNumber,
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
            firstname: custFirstname,
            lastname: custLastname,
            requireSecurityQuestions,
          },
          address: [
            {
              addressType: 'POSTAL',
              streetNo: custStreetNo,
              streetName: custStreetName,
              suburb: custSuburb,
              city: custCity,
              stateOrProvince: custStateOrProvince,
              postCode: custPostCode,
              country: custCountry,
            },
          ],
        },
      }

      const response = await crmService.createAccountCustomer(payload)
      
      
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
      console.error('POA upload error:', err)
      setPoaFile(null)
    } finally {
      setPoaUploading(false)
    }
  }

  const handleFinalSubmit = () => {
    // RICA process completed successfully
    // NEW FLOW: Open payment modal directly
    // Subscriber will be created AFTER successful payment
    console.log('[RICA] Opening payment modal - subscriber will be created after payment')
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
              <div className="md:col-span-2">
                <Checkbox label={<span className="text-neutral-900">Residential account</span>} checked={isResidential} onChange={(e) => setIsResidential(e.target.checked)} />
              </div>
              <div>
                <label className="grid gap-2">
                  <span className="text-sm text-neutral-700">Title</span>
                  <select className="h-12 rounded-xl bg-white ring-1 ring-neutral-300 text-black px-3 text-sm" value={title} onChange={(e) => setTitle(e.target.value)}>
                    <option>Mr</option>
                    <option>Ms</option>
                    <option>Mrs</option>
                    <option>Dr</option>
                  </select>
                </label>
              </div>
              <TextField label="First name" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
              <TextField label="Last name" value={lastname} onChange={(e) => setLastname(e.target.value)} />
              <div>
                <label className="grid gap-2">
                  <span className="text-sm text-neutral-700">ID type</span>
                  <select className="h-12 rounded-xl bg-white ring-1 ring-neutral-300 text-black px-3 text-sm" value={idType} onChange={(e) => setIdType(e.target.value as any)}>
                    <option value="ID">ID</option>
                    <option value="PASSPORT">Passport</option>
                  </select>
                </label>
              </div>
              <TextField label="ID number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
              <TextField label="Email for billing" type="email" value={billEmail} onChange={(e) => setBillEmail(e.target.value)} />
              <div>
                <label className="grid gap-2">
                  <span className="text-sm text-neutral-700">Bill language</span>
                  <select className="h-12 rounded-xl bg-white ring-1 ring-neutral-300 text-black px-3 text-sm" value={billLanguage} onChange={(e) => setBillLanguage(e.target.value as any)}>
                    <option value="en-gb">English (GB)</option>
                    <option value="en-za">English (ZA)</option>
                    <option value="af-za">Afrikaans</option>
                  </select>
                </label>
              </div>
              <div className="md:col-span-2">
                <Checkbox label={<span className="text-neutral-900">Deposit paid</span>} checked={hasDeposit} onChange={(e) => setHasDeposit(e.target.checked)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Street number" value={streetNo} onChange={(e) => setStreetNo(e.target.value)} />
              <TextField label="Street name" value={streetName} onChange={(e) => setStreetName(e.target.value)} />
              <TextField label="Suburb" value={suburb} onChange={(e) => setSuburb(e.target.value)} />
              <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <TextField label="State/Province" value={stateOrProvince} onChange={(e) => setStateOrProvince(e.target.value)} />
              <TextField label="Post code" value={postCode} onChange={(e) => setPostCode(e.target.value)} />
              <TextField label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label="Phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              <div>
                <label className="grid gap-2">
                  <span className="text-sm text-neutral-700">Contact type</span>
                  <select className="h-12 rounded-xl bg-white ring-1 ring-neutral-300 text-black px-3 text-sm" value={contactType} onChange={(e) => setContactType(e.target.value as any)}>
                    <option value="MOBILE_NO">Mobile</option>
                  </select>
                </label>
              </div>
              <div>
                <label className="grid gap-2">
                  <span className="text-sm text-neutral-700">Use parent address type</span>
                  <select className="h-12 rounded-xl bg-white ring-1 ring-neutral-300 text-black px-3 text-sm" value={useParentAddressType} onChange={(e) => setUseParentAddressType(e.target.value as any)}>
                    <option value="BILLING">Billing</option>
                  </select>
                </label>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Checkbox label={<span className="text-neutral-900">Primary role: Customer</span>} checked readOnly />
                <Checkbox label={<span className="text-neutral-900">Account owner</span>} checked={isAccountOwner} onChange={(e) => setIsAccountOwner(e.target.checked)} />
                <Checkbox label={<span className="text-neutral-900">Service owner</span>} checked={isServiceOwner} onChange={(e) => setIsServiceOwner(e.target.checked)} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox label={<span className="text-neutral-900">Residential customer</span>} checked={custIsResidential} onChange={(e) => setCustIsResidential(e.target.checked)} />
              <div />
              <TextField label="First name" value={custFirstname} onChange={(e) => setCustFirstname(e.target.value)} />
              <TextField label="Last name" value={custLastname} onChange={(e) => setCustLastname(e.target.value)} />
              <div className="md:col-span-2">
                <Checkbox label={<span className="text-neutral-900">Require security questions</span>} checked={requireSecurityQuestions} onChange={(e) => setRequireSecurityQuestions(e.target.checked)} />
              </div>
              <TextField label="Postal street number" value={custStreetNo} onChange={(e) => setCustStreetNo(e.target.value)} />
              <TextField label="Postal street name" value={custStreetName} onChange={(e) => setCustStreetName(e.target.value)} />
              <TextField label="Postal suburb" value={custSuburb} onChange={(e) => setCustSuburb(e.target.value)} />
              <TextField label="Postal city" value={custCity} onChange={(e) => setCustCity(e.target.value)} />
              <TextField label="Postal state/province" value={custStateOrProvince} onChange={(e) => setCustStateOrProvince(e.target.value)} />
              <TextField label="Postal post code" value={custPostCode} onChange={(e) => setCustPostCode(e.target.value)} />
              <TextField label="Postal country" value={custCountry} onChange={(e) => setCustCountry(e.target.value)} />
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
                  disabled={!canNext} 
                  className="inline-flex items-center gap-2 rounded-xl bg-lime-400 text-neutral-900 font-semibold px-5 py-2.5 hover:bg-lime-300 disabled:opacity-60 active:scale-[0.99] transition" 
                  onClick={() => setStep((s) => (Math.min(6, (s + 1) as Step)) as Step)}
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
                  disabled={!canNext || idUploading} 
                  className="inline-flex items-center gap-2 rounded-xl bg-lime-400 text-neutral-900 font-semibold px-5 py-2.5 hover:bg-lime-300 disabled:opacity-60 active:scale-[0.99] transition" 
                  onClick={() => setStep(6)}
                >
                  Next →
                </button>
              ) : (
                <button 
                  disabled={!canNext || poaUploading} 
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
      {showShippingModal && selectedPackage && (
        <ShippingModal
          open={showShippingModal}
          onClose={handleShippingClose}
          selectedPackage={{
            productId: selectedPackage.productId || selectedPackage.id, // Use productId from navigation, or id from API
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
            streetNo,
            streetName,
            suburb,
            city,
            stateOrProvince,
            postCode,
            country,
          }}
          customerEmail={billEmail}
          customerName={`${firstname} ${lastname}`}
          customerPhone={phoneNumber}
          ricaData={{
            address: {
              streetNo,
              streetName,
              suburb: suburb || '',
              city,
              stateOrProvince,
              postCode,
              country,
            },
            customerInfo: {
              firstname,
              lastname,
              billEmail,
              phoneNumber,
            }
          }}
        />
      )}
    </div>
  )
}


