import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, CircleAlert } from 'lucide-react'
import Button from './Button'
import TextField from './TextField'

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

export type ContactFormValues = z.output<typeof schema>

type Props = {
  /** Show the optional company name field (business enquiries). */
  showCompany?: boolean
  onSubmit: (values: ContactFormValues) => Promise<void>
}

const fieldBase = 'w-full rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white outline-none focus:border-white/20'

export default function ContactForm({ onSubmit, showCompany = true }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', company: '', queryType: '' },
  })

  const submit = async (values: ContactFormValues) => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      await onSubmit(values)
      setSuccess(true)
      reset()
    } catch (err: unknown) {
      setSubmitError(err instanceof Error && err.message ? err.message : 'Could not send your message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="font-grotesque font-semibold text-white text-[28px] md:text-[32px] leading-[1.1]">Contact us</h2>

      {success ? (
        <div className="mt-5 grid gap-4 content-start">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="font-manrope text-green-400 text-sm">
              Thanks — your message was sent. We&apos;ll get back to you soon.
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            fullWidth={false}
            onClick={() => setSuccess(false)}
            className="h-10 w-fit rounded-lg border-0 shadow-none"
          >
            Send another message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit((v) => submit(v as ContactFormValues))} className="mt-5 grid gap-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <TextField
              variant="dark"
              label="Full name *"
              placeholder="Eg. Eric Brick"
              autoComplete="name"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <TextField
              variant="dark"
              label="Email*"
              type="email"
              placeholder="Eg. eric@mail.co.za"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className={showCompany ? '' : 'md:col-span-2'}>
              <TextField
                variant="dark"
                label="Contact Number*"
                placeholder="Eg. 012 3456 7890"
                autoComplete="tel"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
            {showCompany && (
              <TextField
                variant="dark"
                label="Company name"
                placeholder="Enter your company name"
                autoComplete="organization"
                error={errors.company?.message}
                {...register('company')}
              />
            )}
          </div>

          <div>
            <div className="relative">
              <select
                aria-label="Query type"
                aria-invalid={errors.queryType ? true : undefined}
                className={`${fieldBase} h-12 pr-10 appearance-none font-semibold ${errors.queryType ? 'border-red-400' : ''}`}
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
              <ChevronDown
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white"
                aria-hidden="true"
              />
            </div>
            {errors.queryType && (
              <span role="alert" className="mt-2 font-manrope text-xs text-red-400 flex items-center gap-1.5">
                <CircleAlert className="w-3.5 h-3.5" aria-hidden="true" />
                {errors.queryType.message}
              </span>
            )}
          </div>

          <label className="grid gap-2">
            <span className="font-manrope text-sm text-neutral-400">Message</span>
            <textarea
              placeholder="Enter your message"
              rows={5}
              aria-invalid={errors.message ? true : undefined}
              className={`${fieldBase} py-3 placeholder:text-neutral-500 resize-none ${errors.message ? 'border-red-400' : ''}`}
              {...register('message')}
            />
            {errors.message && (
              <span role="alert" className="font-manrope text-xs text-red-400 flex items-center gap-1.5">
                <CircleAlert className="w-3.5 h-3.5" aria-hidden="true" />
                {errors.message.message}
              </span>
            )}
          </label>

          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth={false}
              disabled={submitting}
              className="h-10 rounded-lg border-0 shadow-none"
            >
              {submitting ? 'Sending…' : 'Send message'}
            </Button>
          </div>

          {submitError && (
            <div role="alert" className="font-manrope text-sm text-red-400 flex items-center gap-1.5">
              <CircleAlert className="w-4 h-4" aria-hidden="true" />
              {submitError}
            </div>
          )}
        </form>
      )}

      <h2 className="mt-12 font-grotesque font-semibold text-white text-[28px] md:text-[32px] leading-[1.1]">
        Come say hello
      </h2>
      <a href="/contact" className="mt-5 inline-block">
        <Button variant="primary" fullWidth={false} className="h-10 rounded-lg border-0 shadow-none bg-pink-300 hover:bg-pink-300/90 active:bg-pink-300">
          Take me there
        </Button>
      </a>
    </div>
  )
}
