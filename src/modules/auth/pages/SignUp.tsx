import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import AuthLayout from '../layouts/AuthLayout'
import TextField from '../components/TextField'
import Checkbox from '../components/Checkbox'
import Button from '../components/Button'

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = (values: FormValues) => {
    // replace with actual submit
    console.log(values)
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
      side={<div className="h-full w-full rounded-3xl border border-neutral-700/60 bg-neutral-800/40" />}
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

        <Button type="submit">Join The Juice</Button>

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


