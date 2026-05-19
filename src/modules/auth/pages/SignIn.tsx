import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import AuthLayout from '../layouts/AuthLayout'
import TextField from '../components/TextField'
import Button from '../components/Button'
import Checkbox from '../components/Checkbox'
import Footer from '../components/Footer'
import { useState } from 'react'
import { firebaseAuthService } from '../services/firebaseAuthService'
import { getFirebaseAuthErrorMessage } from '../utils/firebaseAuthErrorMessage'
import { getPostAuthRedirectPath } from '../utils/getPostAuthRedirect'

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
      await firebaseAuthService.signInWithEmailPassword(values)
      const path = await getPostAuthRedirectPath()
      navigate(path)
    } catch (err: unknown) {
      setSubmitError(getFirebaseAuthErrorMessage(err, 'signIn'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      variant="signin"
      footer={<Footer />}
      heading={
        <>
          Back for more
          <br />
          zest?
        </>
      }
      subheading="Welcome back! Login to manage your data, earn rewards, and keep the good stuff rolling."
      side={
        <div className="h-full w-full rounded-3xl overflow-hidden flex items-center justify-center p-3">
          <img
            src={`${import.meta.env.BASE_URL}images/sign_in_hero.svg`}
            alt="Sign in"
            className="h-full w-full object-contain"
          />
        </div>
      }
    >
      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <TextField
            variant="dark"
            type="email"
            label="Email Address"
            placeholder="Enter your email address"
            {...register('email')}
            error={errors.email?.message}
          />

          <TextField
            variant="dark"
            label="Password"
            type="password"
            placeholder="Enter your password"
            {...register('password')}
            error={errors.password?.message}
          />

          <div className="flex items-center justify-between pt-1">
            <Checkbox label="Remember Me" {...register('rememberMe' as any)} />
            <Link to="/forgot-password" className="text-sm text-neutral-500 hover:text-neutral-400 transition-colors">
              Forgot your password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="mt-2 h-10 rounded-lg border border-white/10 shadow-none"
          >
            {submitting ? 'Signing In...' : 'Log in'}
          </Button>

          {submitError && (
            <div className="font-manrope text-sm text-red-400 text-center">{submitError}</div>
          )}

          <div className="font-manrope pt-2 text-sm text-neutral-500 text-center">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-[#ABFF63] hover:text-[#ABFF63]/90 transition-colors">
              Sign up now
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
