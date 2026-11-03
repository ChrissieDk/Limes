import { Link, useNavigate, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import AuthShell from '../layouts/AuthShell'
import TextField from '../components/TextField'
import Checkbox from '../components/Checkbox'
import Button from '../components/Button'
import SocialAuthButton from '../components/SocialAuthButton'
import Footer from '../components/Footer'
import { firebaseAuthService } from '../services/firebaseAuthService'
import { userService } from '../services/userService'
import { getFirebaseAuthErrorMessage, isFirebaseAuthError } from '../utils/firebaseAuthErrorMessage'
import { getAxiosErrorMessage } from '../../../utils/errorMessage'
import { isEmail, isSaPhone } from '../utils/validation'

const identifierSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Enter your email address or mobile number')
    .refine((v) => isEmail(v) || isSaPhone(v), 'Enter a valid email address or South African mobile number'),
})

const detailsSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Enter your full name')
      .max(200, 'Name is too long')
      .regex(/^[\p{L}][\p{L}\s'.-]*$/u, 'Name can only contain letters'),
    password: z
      .string()
      .min(8, 'Must contain at least 8 characters and 1 special character')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least 8 characters and 1 special character'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    terms: z.boolean().refine((v) => v === true, 'Please accept the Terms & Conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type IdentifierValues = z.infer<typeof identifierSchema>
type DetailsValues = z.infer<typeof detailsSchema>

const PASSWORD_HINT = 'Must contain at least 8 characters and 1 special character'

export default function SignUp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState<'identifier' | 'details' | 'verify'>(
    searchParams.get('verify') === 'true' ? 'verify' : 'identifier',
  )
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const identifierForm = useForm<IdentifierValues>({ resolver: zodResolver(identifierSchema) })
  const detailsForm = useForm<DetailsValues>({ resolver: zodResolver(detailsSchema) })

  const onContinue = ({ identifier }: IdentifierValues) => {
    if (!isEmail(identifier)) {
      identifierForm.setError('identifier', {
        message: "Mobile number sign-up isn't available yet. Please use your email address.",
      })
      return
    }
    setEmail(identifier.trim())
    setStep('details')
  }

  const onJoin = async (values: DetailsValues) => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      await firebaseAuthService.signUpWithEmailPassword({ email, password: values.password })
      const [firstName, ...rest] = values.fullName.trim().split(/\s+/)
      await userService.registerUser({
        emailAddress: email,
        firstName,
        lastName: rest.join(' ') || 'User',
      })
      // The Cloud Function sends the verification email on user creation.
      setStep('verify')
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

  const loginPrompt = (
    <div className="font-manrope text-sm text-white text-center">
      Already have an account?{' '}
      <Link to="/signin" className="font-semibold text-[#ABFF63] hover:text-[#ABFF63]/90 transition-colors">
        Log in now
      </Link>
    </div>
  )

  if (step === 'verify') {
    return (
      <AuthShell
        eyebrow="Register"
        heading="Check your email"
        subheading={
          <>
            We&apos;ve sent you a verification link. Please click the link in the email to verify your account.
            <br />
            You&apos;ll be redirected to your dashboard once verified.
          </>
        }
        footer={<Footer />}
      >
        <div className="grid justify-items-center gap-4">
          <p className="font-manrope text-xs text-neutral-300">Didn&apos;t receive the email? Check your spam folder.</p>
          <Link to="/">
            <Button fullWidth={false} className="h-10 rounded-lg border-0 shadow-none">
              Back to Home
            </Button>
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      eyebrow="Register"
      heading="You’re a few steps away"
      subheading="Join the community where your mobile plan actually makes sense for you."
      footer={<Footer />}
    >
      {step === 'identifier' ? (
        <form onSubmit={identifierForm.handleSubmit(onContinue)} className="mx-auto grid max-w-xl gap-6" noValidate>
          <TextField
            variant="dark"
            label="Email address or mobile number*"
            placeholder="Eg. eric@mail.co.za"
            autoComplete="username"
            {...identifierForm.register('identifier')}
            error={identifierForm.formState.errors.identifier?.message}
          />

          <div className="grid justify-items-center gap-5">
            <Button type="submit" fullWidth={false} className="h-10 rounded-lg border-0 shadow-none">
              Continue
            </Button>
            <span className="font-manrope text-white">OR</span>
            <SocialAuthButton provider="google" />
            <SocialAuthButton provider="facebook" />
            {loginPrompt}
          </div>
        </form>
      ) : (
        <form onSubmit={detailsForm.handleSubmit(onJoin)} className="mx-auto grid max-w-xl gap-5" noValidate>
          <TextField
            variant="dark"
            label="Full name *"
            placeholder="Eg. Eric Brick"
            autoComplete="name"
            {...detailsForm.register('fullName')}
            error={detailsForm.formState.errors.fullName?.message}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
            <TextField
              variant="dark"
              type="password"
              label="Password*"
              placeholder="Enter your password"
              autoComplete="new-password"
              message={PASSWORD_HINT}
              messageState="info"
              {...detailsForm.register('password')}
              error={detailsForm.formState.errors.password?.message}
            />
            <TextField
              variant="dark"
              type="password"
              label="Confirm password*"
              placeholder="Confirm your password"
              autoComplete="new-password"
              {...detailsForm.register('confirmPassword')}
              error={detailsForm.formState.errors.confirmPassword?.message}
            />
          </div>

          <Checkbox
            {...detailsForm.register('terms')}
            error={detailsForm.formState.errors.terms?.message}
            label={
              <>
                I agree to the{' '}
                <Link to="/terms-and-conditions" className="underline">
                  Terms & Conditions
                </Link>
              </>
            }
          />

          <div className="grid justify-items-center gap-5">
            <Button type="submit" fullWidth={false} disabled={submitting} className="h-10 rounded-lg border-0 shadow-none">
              {submitting ? 'Creating account…' : 'Join Limes Mobile'}
            </Button>
            {submitError && (
              <div role="alert" className="font-manrope text-sm text-red-400 text-center">
                {submitError}
              </div>
            )}
            {loginPrompt}
          </div>
        </form>
      )}
    </AuthShell>
  )
}
