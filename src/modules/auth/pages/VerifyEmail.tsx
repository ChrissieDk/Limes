import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { auth } from '../../../config/firebase'
import { applyActionCode, checkActionCode } from 'firebase/auth'
import AuthShell from '../layouts/AuthShell'
import LoginForm from '../components/LoginForm'
import Button from '../components/Button'
import Footer from '../components/Footer'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      const mode = searchParams.get('mode')
      const oobCode = searchParams.get('oobCode')

      if (mode !== 'verifyEmail' || !oobCode) {
        setStatus('error')
        setErrorMessage('Invalid verification link')
        return
      }

      try {
        // Verify the action code
        await checkActionCode(auth, oobCode)
        
        // Apply the email verification
        await applyActionCode(auth, oobCode)
        
        setStatus('success')
      } catch (error: unknown) {
        console.error('Email verification error:', error)
        const message = error instanceof Error ? error.message : 'Failed to verify email'
        setStatus('error')
        setErrorMessage(message)
      }
    }

    verifyEmail()
  }, [searchParams])

  if (status === 'success') {
    return (
      <AuthShell
        eyebrow="Log in"
        heading="Email verified!"
        subheading="Your email has been successfully verified. Log in to view your dashboard."
        footer={<Footer />}
      >
        <LoginForm />
      </AuthShell>
    )
  }

  return (
    <AuthShell
      eyebrow="Register"
      heading={status === 'error' ? 'Verification failed' : 'Verifying email…'}
      subheading={
        status === 'error'
          ? errorMessage || 'The verification link may have expired or is invalid.'
          : 'Please wait while we verify your email address…'
      }
      footer={<Footer />}
    >
      {status === 'error' ? (
        <div className="flex justify-center">
          <Button onClick={() => navigate('/signin')} fullWidth={false} className="h-10 rounded-lg border-0 shadow-none">
            Back to log in
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#ABFF63]"></div>
        </div>
      )}
    </AuthShell>
  )
}
