import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import AuthLayout from '../layouts/AuthLayout'
import TextField from '../components/TextField'
import Button from '../components/Button'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
})

type FormValues = z.infer<typeof schema>

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = (values: FormValues) => {
    console.log(values)
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
      side={<div className="h-full w-full rounded-3xl border border-neutral-700/60 bg-neutral-800/40" />}
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

        <Button type="submit">Sign In</Button>

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


