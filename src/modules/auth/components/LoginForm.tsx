import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import TextField from './TextField'
import Button from './Button'
import Checkbox from './Checkbox'
import { firebaseAuthService } from '../services/firebaseAuthService'
import { getFirebaseAuthErrorMessage } from '../utils/firebaseAuthErrorMessage'
import { getPostAuthRedirectPath } from '../utils/getPostAuthRedirect'

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
  rememberMe: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

export default function LoginForm() {
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
      navigate(await getPostAuthRedirectPath())
    } catch (err: unknown) {
      setSubmitError(getFirebaseAuthErrorMessage(err, 'signIn'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto grid max-w-xl gap-5" noValidate>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
        <TextField
          variant="dark"
          type="email"
          label="Email*"
          placeholder="Eg. eric@mail.co.za"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <TextField
          variant="dark"
          type="password"
          label="Password*"
          placeholder="Enter your password"
          autoComplete="current-password"
          {...register('password')}
          error={errors.password?.message}
        />
      </div>

      <div className="flex items-center justify-between">
        <Checkbox label="Remember me" {...register('rememberMe')} />
        <Link to="/forgot-password" className="font-manrope text-sm text-neutral-400 hover:text-white transition-colors">
          Forgot your password?
        </Link>
      </div>

      <div className="flex justify-center">
        <Button type="submit" fullWidth={false} disabled={submitting} className="h-10 rounded-lg border-0 shadow-none">
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </div>

      {submitError && (
        <div role="alert" className="font-manrope text-sm text-red-400 text-center">
          {submitError}
        </div>
      )}
    </form>
  )
}
