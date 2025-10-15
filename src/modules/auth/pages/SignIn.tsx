import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import AuthLayout from '../layouts/AuthLayout'
import TextField from '../components/TextField'
import Button from '../components/Button'
import { useState } from 'react'
import { firebaseAuthService } from '../services/firebaseAuthService'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
})

type FormValues = z.infer<typeof schema>

export default function SignIn() {
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
      const cred = await firebaseAuthService.signInWithEmailPassword(values)
      const idToken = await cred.user.getIdToken(true)
      localStorage.setItem('authToken', idToken)
      navigate('/dashboard/packages')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      heading={
        <>
          Welcome back,
          <br />
          let’s sign you in
        </>
      }
      subheading={
        <>Enter your credentials to access your Limes account.</>
      }
      side={
        <div className="h-full w-full rounded-3xl overflow-hidden border border-neutral-700/60">
          <img src="/images/signin.png" alt="Sign in" className="h-full w-full object-cover" />
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
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

        <Button type="submit" disabled={submitting}>{submitting ? 'Signing In...' : 'Sign In'}</Button>

        {submitError && (
          <div className="text-sm text-red-400 text-center">{submitError}</div>
        )}

        <div className="text-sm text-neutral-400 text-center">
          New to Limes?{' '}
          <Link to="/" className="underline">
            Create an account
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}


