import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import AuthLayout from '../layouts/AuthLayout'
import TextField from '../components/TextField'
import Button from '../components/Button'
import Footer from '../components/Footer'
import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../../config/firebase'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type FormValues = z.infer<typeof schema>

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      const sendPasswordReset = httpsCallable(functions, 'sendPasswordResetEmail')
      
      await sendPasswordReset({ email: values.email })
      
      setSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      variant="signin"
      footer={<Footer />}
      heading="Reset your password"
      subheading="Enter your email address and we'll send you a link to reset your password."
    >
      {success ? (
        <div className="grid gap-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm text-center">
              Check your email! We've sent a password reset link to your inbox.
            </p>
          </div>
          <Button
            onClick={() => navigate('/signin')}
            className="mt-2 h-10 rounded-lg border border-white/10 shadow-none"
          >
            Back to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <TextField
            variant="dark"
            label="Email address"
            type="email"
            placeholder="Enter your email address"
            {...register('email')}
            error={errors.email?.message}
          />

          <Button
            type="submit"
            disabled={submitting}
            className="mt-2 h-10 rounded-lg border border-white/10 shadow-none"
          >
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </Button>

          {submitError && (
            <div className="text-sm text-red-400 text-center">{submitError}</div>
          )}

          <div className="pt-2 text-sm text-neutral-500 text-center">
            Remember your password?{' '}
            <Link to="/signin" className="text-[#ABFF63] hover:text-[#ABFF63]/90 transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
