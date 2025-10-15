import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import AuthLayout from '../layouts/AuthLayout'
import TextField from '../components/TextField'
import Checkbox from '../components/Checkbox'
import Button from '../components/Button'
import { useState } from 'react'
import { firebaseAuthService } from '../services/firebaseAuthService'
import { userService } from '../services/userService'

const schema = z
  .object({
    phone: z.string().min(7, 'Enter a valid phone number'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v === true, 'Please accept the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type FormValues = z.infer<typeof schema>

export default function SignUp() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      const cred = await firebaseAuthService.signUpWithEmailPassword({ email: values.email, password: values.password })
      const idToken = await cred.user.getIdToken(true)
      localStorage.setItem('authToken', idToken)

      const displayName = cred.user.displayName?.trim() || ''
      const [firstNameFromDisplay, ...rest] = displayName.split(' ').filter(Boolean)
      const firstName = firstNameFromDisplay || values.email.split('@')[0]
      const lastName = rest.join(' ') || 'User'
      const externalId = `fb_${cred.user.uid}`

      await userService.registerUser({
        externalId,
        emailAddress: values.email,
        firstName,
        lastName,
      })
      navigate('/dashboard/packages')
    } catch (err: unknown) {
      let message = 'Failed to sign up'
      if (err && typeof err === 'object') {
        const anyErr = err as any
        if (anyErr.response?.data) {
          const data = anyErr.response.data
          message = data?.message || data?.error || message
        } else if (anyErr.message) {
          message = anyErr.message
        }

        const status = anyErr.response?.status
        const lowerMessage = String(message).toLowerCase()
        const looksLikeAlreadyExists =
          lowerMessage.includes('exist') || lowerMessage.includes('duplicate') || lowerMessage.includes('already')

        if (status === 409 || (status === 400 && looksLikeAlreadyExists)) {
          navigate('/dashboard/packages')
          return
        }
      }
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      heading={
        <>
          Ready to get your
          <br />
          slice of Limes?
        </>
      }
      subheading={
        <>Join the community where data pays you back, and your mobile plan actually makes sense.</>
      }
      side={
        <div className="h-full w-full rounded-3xl overflow-hidden border border-neutral-700/60">
          <img src="/images/signup.png" alt="Sign up" className="h-full w-full object-cover" />
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <TextField
          label="Phone number"
          prefix={'+27'}
          placeholder="Enter your mobile number"
          {...register('phone')}
          error={errors.phone?.message}
        />

        <TextField
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          {...register('email')}
          error={errors.email?.message}
        />

        <TextField
          label="Password"
          type="password"
          placeholder="Enter your password"
          {...register('password')}
          error={errors.password?.message}
        />

        <TextField
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <Checkbox
          {...register('terms')}
          label={
            <>
              I agree to the <a className="underline" href="#">Terms & Conditions</a>
            </>
          }
        />

        <Button type="submit" disabled={submitting}>{submitting ? 'Creating Account...' : 'Join The Juice'}</Button>

        {submitError && (
          <div className="text-sm text-red-400 text-center">{submitError}</div>
        )}

        <div className="text-sm text-neutral-400 text-center">
          Already an account?{' '}
          <Link to="/signin" className="underline">
            Login now
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}


