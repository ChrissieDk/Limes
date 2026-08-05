import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { auth } from '../../../config/firebase'
import { applyActionCode, checkActionCode } from 'firebase/auth'
import AuthLayout from '../layouts/AuthLayout'
import Button from '../components/Button'
import Footer from '../components/Footer'
import { getPostAuthRedirectPath } from '../utils/getPostAuthRedirect'

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

  return (
    <AuthLayout
      variant="signin"
      footer={<Footer />}
      heading={status === 'success' ? 'Email Verified!' : status === 'error' ? 'Verification Failed' : 'Verifying Email...'}
      subheading={
        status === 'success'
          ? 'Your email has been successfully verified. You can now access all features.'
          : status === 'error'
          ? errorMessage || 'The verification link may have expired or is invalid.'
          : 'Please wait while we verify your email address...'
      }
    >
      <div className="grid gap-4">
        {status === 'success' && (
          <>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="font-manrope text-green-400 text-sm text-center">
                ✓ Your email has been verified successfully!
              </p>
            </div>
            <Button
              onClick={async () => {
                const path = await getPostAuthRedirectPath()
                navigate(path)
              }}
              className="mt-2 h-10 rounded-lg border border-white/10 shadow-none"
            >
              Go to Dashboard
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm text-center">
                {errorMessage || 'Verification failed. The link may have expired.'}
              </p>
            </div>
            <Button
              onClick={() => navigate('/signin')}
              className="mt-2 h-10 rounded-lg border border-white/10 shadow-none"
            >
              Back to Sign In
            </Button>
          </>
        )}

        {status === 'loading' && (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#ABFF63]"></div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
