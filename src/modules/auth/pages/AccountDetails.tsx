import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../../config/firebase'
import { crmService } from '../../crm/services/crmService'
import type { GetAccountCustomerResponse, RicaAddress } from '../../../types'
import DashboardNavbar, { clearDashboardDisplayNameCache } from '../components/DashboardNavbar'
import Footer from '../components/Footer'
import TextField from '../components/TextField'
import Button from '../components/Button'

const schema = z.object({
  firstname: z.string().min(1, 'First name is required').max(120),
  lastname: z.string().min(1, 'Last name is required').max(120),
  streetNo: z.string().min(1, 'Street number is required'),
  streetName: z.string().min(1, 'Street name is required'),
  suburb: z.string(),
  city: z.string().min(1, 'City is required'),
  stateOrProvince: z.string().min(1, 'Province / state is required'),
  postCode: z.string().min(1, 'Postal code is required'),
})

type FormValues = z.infer<typeof schema>

function ricaAddressTypeToNumber(t: RicaAddress['addressType'] | number | undefined): number {
  if (typeof t === 'number' && !Number.isNaN(t)) return t
  if (t === 'POSTAL') return 2
  return 1
}

function pickPrimaryAddress(data: GetAccountCustomerResponse): RicaAddress | null {
  const list =
    data.customer?.address && data.customer.address.length > 0
      ? data.customer.address
      : data.address
  if (!list?.length) return null
  const billing = list.find((a) => a.addressType === 'BILLING')
  return billing ?? list[0]
}

function mapResponseToFormDefaults(data: GetAccountCustomerResponse): FormValues {
  const addr = pickPrimaryAddress(data)
  return {
    firstname: data.detail?.firstname?.trim() ?? '',
    lastname: data.detail?.lastname?.trim() ?? '',
    streetNo: addr?.streetNo?.trim() ?? '',
    streetName: addr?.streetName?.trim() ?? '',
    suburb: addr?.suburb?.trim() ?? '',
    city: addr?.city?.trim() ?? '',
    stateOrProvince: addr?.stateOrProvince?.trim() ?? '',
    postCode: addr?.postCode?.trim() ?? '',
  }
}

export default function AccountDetails() {
  const navigate = useNavigate()
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [addressType, setAddressType] = useState<number>(1)
  const countryRef = useRef<string>('ZA')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstname: '',
      lastname: '',
      streetNo: '',
      streetName: '',
      suburb: '',
      city: '',
      stateOrProvince: '',
      postCode: '',
    },
  })

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoadError(null)
      setLoading(true)
      try {
        const data = await crmService.getAccountCustomer()
        if (cancelled) return
        const addr = pickPrimaryAddress(data)
        setAddressType(ricaAddressTypeToNumber(addr?.addressType))
        countryRef.current = addr?.country?.trim() || 'ZA'
        reset(mapResponseToFormDefaults(data))
      } catch (e: unknown) {
        if (!cancelled) {
          const msg =
            e && typeof e === 'object' && 'response' in e
              ? String((e as { response?: { data?: { message?: string } } }).response?.data?.message)
              : e instanceof Error
                ? e.message
                : 'Could not load your details'
          setLoadError(msg || 'Could not load your details')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [reset])

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    setSuccess(false)
    setSubmitting(true)
    try {
      await crmService.updateCustomer({
        isResidential: true,
        detail: {
          firstname: values.firstname.trim(),
          lastname: values.lastname.trim(),
          requireSecurityQuestions: false,
        },
        address: [
          {
            addressType: addressType,
            streetNo: values.streetNo.trim(),
            streetName: values.streetName.trim(),
            suburb: values.suburb.trim(),
            city: values.city.trim(),
            stateOrProvince: values.stateOrProvince.trim(),
            postCode: values.postCode.trim(),
            country: countryRef.current,
          },
        ],
      })
      const uid = auth.currentUser?.uid
      if (uid) clearDashboardDisplayNameCache(uid)
      setSuccess(true)
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? String((e as { response?: { data?: { message?: string } } }).response?.data?.message)
          : e instanceof Error
            ? e.message
            : 'Save failed'
      setSubmitError(msg || 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <DashboardNavbar />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="mb-10">
          <h1 className="text-center font-grotesque font-semibold text-white text-5xl sm:text-6xl md:text-7xl leading-[1.02] tracking-tight">
            Edit your details
          </h1>
          <p className="mt-3 text-center text-neutral-400 text-sm">
            Update your name and address on file
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 ring-1 ring-white/10 text-white px-5 h-11 text-sm font-semibold hover:bg-white/15 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        <div className="max-w-4xl mx-auto mt-5 rounded-[28px] bg-white/5 ring-1 ring-white/10 p-8 sm:p-10">
          {loading && (
            <p className="text-neutral-400 text-sm text-center py-8">Loading your details…</p>
          )}
          {!loading && loadError && (
            <p className="text-red-400 text-sm text-center py-4">{loadError}</p>
          )}
          {!loading && !loadError && (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
              <div>
                <h2 className="text-white font-grotesque font-semibold text-xl sm:text-2xl mb-1">
                  Personal
                </h2>
                <p className="text-neutral-400 text-sm mb-4">Name as it should appear on your account</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <TextField
                    label="First name"
                    variant="dark"
                    error={errors.firstname?.message}
                    {...register('firstname')}
                  />
                  <TextField
                    label="Last name"
                    variant="dark"
                    error={errors.lastname?.message}
                    {...register('lastname')}
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h2 className="text-white font-grotesque font-semibold text-xl sm:text-2xl mb-1">
                  Address
                </h2>
                <p className="text-neutral-400 text-sm mb-4">Primary billing / service address</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <TextField
                    label="Street number"
                    variant="dark"
                    error={errors.streetNo?.message}
                    {...register('streetNo')}
                  />
                  <TextField
                    label="Street name"
                    variant="dark"
                    error={errors.streetName?.message}
                    {...register('streetName')}
                  />
                  <TextField label="Suburb" variant="dark" error={errors.suburb?.message} {...register('suburb')} />
                  <TextField label="City" variant="dark" error={errors.city?.message} {...register('city')} />
                  <TextField
                    label="Province / state"
                    variant="dark"
                    error={errors.stateOrProvince?.message}
                    {...register('stateOrProvince')}
                  />
                  <TextField
                    label="Postal code"
                    variant="dark"
                    error={errors.postCode?.message}
                    {...register('postCode')}
                  />
                </div>
              </div>

              {submitError && <p className="text-sm text-red-400">{submitError}</p>}
              {success && <p className="text-sm text-[#ABFF63]">Your details were saved.</p>}

              <div className="max-w-xs">
                <Button type="submit" disabled={submitting} fullWidth className="h-11 text-sm">
                  {submitting ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
