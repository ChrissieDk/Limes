import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FirebaseError } from 'firebase/app'
import { httpsCallable } from 'firebase/functions'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import Footer from '../components/Footer'
import { functions } from '../../../config/firebase'

const inputClassName =
  'w-full h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-white placeholder:text-neutral-500 outline-none focus:border-white/20'

const QUERY_TYPES = ['partnership', 'support', 'sales', 'other'] as const

const schema = z.object({
  fullName: z.string().min(1, 'Enter your full name').max(200, 'Name is too long'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().max(40, 'Contact number is too long').optional(),
  company: z.string().max(200, 'Company name is too long').optional(),
  queryType: z
    .string()
    .min(1, 'Select a query type')
    .pipe(z.enum(QUERY_TYPES, { message: 'Select a query type' })),
  message: z.string().min(1, 'Enter a message').max(5000, 'Message is too long'),
})

type FormValues = z.output<typeof schema>

function getCallableErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError && error.message) {
    return error.message
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Could not send your message. Please try again.'
}

export default function Contact() {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: '',
      company: '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form

  const onSubmit = async (values: FormValues): Promise<void> => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      const submitContact = httpsCallable(functions, 'submitContactInquiry')
      await submitContact({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone ?? '',
        company: values.company ?? '',
        queryType: values.queryType,
        message: values.message,
      })
      setSuccess(true)
      reset()
    } catch (err: unknown) {
      setSubmitError(getCallableErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const fieldHint = 'block text-sm text-neutral-400 mb-1'

  return (
    <div className="min-h-screen text-white bg-[#0E0E12] bg-[radial-gradient(1000px_600px_at_15%_10%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(900px_500px_at_85%_80%,rgba(255,255,255,0.04),transparent_60%)]">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-6">
        <div className="flex items-center justify-center text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-yellow-400 mr-2" /> Contact Us
        </div>
        <h1 className="mt-4 font-grotesque font-bold text-center leading-[1.05]" style={{fontWeight:700}}>
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">Ready to partner or</span>
          <span className="block text-[36px] sm:text-[48px] md:text-[64px]">learn more? Let&apos;s chat.</span>
        </h1>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-8 items-stretch">
          {success ? (
            <div className="lg:self-center grid gap-4 content-start">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-green-400 text-sm text-center">
                  Thanks — your message was sent. We&apos;ll get back to you soon.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setSuccess(false)
                  setSubmitError(null)
                }}
                className="h-9 w-fit rounded-lg border border-white/10 shadow-none text-xs"
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(async (values) => onSubmit(values as FormValues))} className="grid gap-4 content-start lg:self-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={fieldHint}>Full name</label>
                  <input
                    placeholder="Eg. Eric Brick"
                    autoComplete="name"
                    className={inputClassName}
                    aria-invalid={errors.fullName ? true : undefined}
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label className={fieldHint}>Email</label>
                  <input
                    placeholder="Eg. eric@mail.co.za"
                    type="email"
                    autoComplete="email"
                    className={inputClassName}
                    aria-invalid={errors.email ? true : undefined}
                    {...register('email')}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={fieldHint}>Contact Number</label>
                  <input
                    placeholder="Eg. 012 3456 7890"
                    autoComplete="tel"
                    className={inputClassName}
                    {...register('phone')}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className={fieldHint}>Company name</label>
                  <input
                    placeholder="Enter your company name"
                    autoComplete="organization"
                    className={inputClassName}
                    {...register('company')}
                  />
                  {errors.company && <p className="mt-1 text-xs text-red-400">{errors.company.message}</p>}
                </div>
              </div>

              <div>
                <label className={fieldHint}>Select query type</label>
                <div className="relative">
                  <select
                    defaultValue=""
                    className={`${inputClassName} pr-10 appearance-none`}
                    aria-invalid={errors.queryType ? true : undefined}
                    {...register('queryType')}
                  >
                    <option value="" disabled>
                      Select query type
                    </option>
                    <option value="partnership">Partnership</option>
                    <option value="support">Support</option>
                    <option value="sales">Sales</option>
                    <option value="other">Other</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0l-4.24-4.5a.75.75 0 0 1 .02-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                {errors.queryType && (
                  <p className="mt-1 text-xs text-red-400">{errors.queryType.message}</p>
                )}
              </div>

              <div>
                <label className={fieldHint}>Message</label>
                <textarea
                  placeholder="Enter your message"
                  rows={5}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-neutral-500 outline-none focus:border-white/20 resize-none"
                  aria-invalid={errors.message ? true : undefined}
                  {...register('message')}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>
                )}
              </div>

              <div className="w-full sm:w-auto">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="h-9 rounded-lg border border-white/10 shadow-none text-xs"
                >
                  {submitting ? 'Sending…' : 'Send message'}
                </Button>
              </div>

              {submitError && (
                <div className="text-sm text-red-400">{submitError}</div>
              )}
            </form>
          )}

          {/* Side visual */}
          <div className="w-full h-full rounded-3xl overflow-hidden flex items-center justify-center self-stretch min-h-[360px] lg:min-h-0">
            <img
              src={`${import.meta.env.BASE_URL}images/contact_us_hero.svg`}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}


