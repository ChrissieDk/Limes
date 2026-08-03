import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import AuthLayout from '../layouts/AuthLayout'
import TextField from '../components/TextField'
import Checkbox from '../components/Checkbox'
import Button from '../components/Button'
import Footer from '../components/Footer'
import { useState, useEffect } from 'react'
import { firebaseAuthService } from '../services/firebaseAuthService'
import { userService } from '../services/userService'
import { getFirebaseAuthErrorMessage, isFirebaseAuthError } from '../utils/firebaseAuthErrorMessage'
import { getAxiosErrorMessage } from '../../../utils/errorMessage'

const schema = z
  .object({
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
  const [searchParams] = useSearchParams()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (searchParams.get('verify') === 'true') {
      setShowVerificationMessage(true)
    }
  }, [searchParams])

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      const cred = await firebaseAuthService.signUpWithEmailPassword({ email: values.email, password: values.password })
      const displayName = cred.user.displayName?.trim() || ''
      const [firstNameFromDisplay, ...rest] = displayName.split(' ').filter(Boolean)
      const firstName = firstNameFromDisplay || values.email.split('@')[0]
      const lastName = rest.join(' ') || 'User'

      await userService.registerUser({
        emailAddress: values.email,
        firstName,
        lastName,
      })
      
      // Show verification message
      // The Cloud Function will automatically send verification email on user creation
      setShowVerificationMessage(true)
    } catch (err: unknown) {
      if (isFirebaseAuthError(err)) {
        setSubmitError(getFirebaseAuthErrorMessage(err, 'signUp'))
        return
      }

      const message = getAxiosErrorMessage(err, 'Failed to sign up')
      const status = err && typeof err === 'object'
        ? (err as { response?: { status?: number } }).response?.status
        : undefined
      const lowerMessage = String(message).toLowerCase()
      const looksLikeAlreadyExists =
        lowerMessage.includes('exist') || lowerMessage.includes('duplicate') || lowerMessage.includes('already')

      if (status === 409 || (status === 400 && looksLikeAlreadyExists)) {
        navigate('/dashboard/packages')
        return
      }
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      variant="signup"
      tone="dark"
      footer={<Footer />}
      heading={
        <>
          Ready to get your
          <br />
          slice of Limes?
        </>
      }
      subheading={
        <>Join the community where your mobile subscription actually makes sense for you.</>
      }
      side={
        <div className="h-full w-full rounded-3xl overflow-hidden flex items-center justify-center p-3">
          <img
            src={`${import.meta.env.BASE_URL}images/sign_up_hero.svg`}
            alt="Sign up"
            className="h-full w-full object-contain"
          />
        </div>
      }
    >
      {showVerificationMessage ? (
        <div className="grid gap-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h3 className="font-grotesque text-green-400 font-semibold mb-2 text-center">Check your email!</h3>
            <p className="font-manrope text-green-400 text-sm text-center mb-4">
              We've sent a verification email to your inbox. Please click the link in the email to verify your account.
            </p>
            <p className="font-manrope text-neutral-400 text-xs text-center">
              Didn't receive the email? Check your spam folder or try signing up again.
            </p>
          </div>
          <Button
            onClick={() => navigate('/signin')}
            className="mt-2 h-10 rounded-lg border border-white/10 shadow-none"
          >
            Go to Sign In
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

        <TextField
          variant="dark"
          label="Password"
          type="password"
          placeholder="Enter your password"
          {...register('password')}
          error={errors.password?.message}
        />

        <TextField
          variant="dark"
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
              I agree to the{' '}
              <Link to="/terms-and-conditions" className="underline">
                Terms & Conditions
              </Link>
            </>
          }
        />

        <Button
          type="submit"
          disabled={submitting}
          className="mt-2 h-10 rounded-lg border border-white/10 shadow-none"
        >
          {submitting ? 'Creating Account...' : 'Join Limes'}
        </Button>

        {submitError && (
          <div className="font-manrope text-sm text-red-400 text-center">{submitError}</div>
        )}

        <div className="font-manrope pt-2 text-sm text-neutral-500 text-center">
          Already have an account?{' '}
          <Link to="/signin" className="text-[#ABFF63] hover:text-[#ABFF63]/90 transition-colors">
            Login now
          </Link>
        </div>
      </form>
      )}
    </AuthLayout>
  )
}


