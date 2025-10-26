import { useEffect, useMemo, useState } from 'react'
import TextField from './TextField'
import Checkbox from './Checkbox'

type Step = 1 | 2 | 3 | 4

interface ChoosePackageModalProps {
  open: boolean
  onClose: () => void
}

export default function ChoosePackageModal({ open, onClose }: ChoosePackageModalProps) {
  const [step, setStep] = useState<Step>(1)
  const [isResidential, setIsResidential] = useState(true)

  // Detail
  const [title, setTitle] = useState('Mr')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [creditLimit, setCreditLimit] = useState<number>(0)
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

  // Misc
  const [taxSchemeId, setTaxSchemeId] = useState('')
  const [collectionPlanId, setCollectionPlanId] = useState('')
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

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const canNext = useMemo(() => {
    if (step === 1) return firstname.trim() !== '' && lastname.trim() !== '' && idNumber.trim() !== '' && billEmail.trim() !== ''
    if (step === 2) return streetNo && streetName && city && stateOrProvince && postCode
    if (step === 3) return phoneNumber.trim() !== ''
    return true
  }, [step, firstname, lastname, idNumber, billEmail, streetNo, streetName, city, stateOrProvince, postCode, phoneNumber])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-3xl mx-0 sm:mx-4 rounded-2xl bg-white text-neutral-900 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[82vh] sm:max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center size-8 rounded-lg bg-neutral-900 text-white">▣</div>
            <div>
              <div className="font-extrabold text-lg">Choose a package</div>
              <div className="text-sm text-neutral-500">Provide details to create your account</div>
            </div>
          </div>
          <button aria-label="Close" className="size-10 grid place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 text-2xl" onClick={onClose}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-4 pb-5">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-5">
            {[1,2,3,4].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
            ))}
          </div>

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
              <div>
                <label className="grid gap-2">
                  <span className="text-sm text-neutral-700">Credit limit</span>
                  <input type="number" className="h-12 rounded-xl bg-white ring-1 ring-neutral-300 text-black px-3 text-sm w-full" value={creditLimit} onChange={(e) => setCreditLimit(Number(e.target.value))} />
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
              <TextField label="Tax scheme ID" value={taxSchemeId} onChange={(e) => setTaxSchemeId(e.target.value)} />
              <TextField label="Collection plan ID" value={collectionPlanId} onChange={(e) => setCollectionPlanId(e.target.value)} />
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

          {/* Actions */}
          <div className="flex items-center justify-between mt-6">
            <button className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 text-neutral-900 font-semibold px-5 py-2.5 hover:bg-neutral-200 active:scale-[0.99] transition" onClick={step === 1 ? onClose : () => setStep((s) => (Math.max(1, (s - 1) as Step)) as Step)}>
              <span>{step === 1 ? 'Cancel' : 'Back'}</span>
            </button>
            <div className="flex items-center gap-2">
              {step < 4 ? (
                <button disabled={!canNext} className="inline-flex items-center gap-2 rounded-xl bg-lime-400 text-neutral-900 font-semibold px-5 py-2.5 hover:bg-lime-300 disabled:opacity-60 active:scale-[0.99] transition" onClick={() => setStep((s) => (Math.min(4, (s + 1) as Step)) as Step)}>
                  Next →
                </button>
              ) : (
                <button className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 text-white font-semibold px-5 py-2.5 hover:bg-neutral-800 active:scale-[0.99] transition" onClick={onClose}>
                  Submit
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}


