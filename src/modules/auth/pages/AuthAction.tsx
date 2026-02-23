import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import Footer from '../components/Footer'

/**
 * Single entry point for Firebase email action links (verification + password reset).
 * Firebase Console only allows one custom action URL, so both link types hit this route.
 * We read `mode` and redirect to the correct page with the same params.
 */
export default function AuthAction() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const mode = searchParams.get('mode')
    const oobCode = searchParams.get('oobCode')

    if (!mode || !oobCode) {
      navigate('/signin', { replace: true })
      return
    }

    if (mode === 'verifyEmail') {
      navigate(`/auth/verify-email?${searchParams.toString()}`, { replace: true })
      return
    }

    if (mode === 'resetPassword') {
      navigate(`/auth/reset-password?${searchParams.toString()}`, { replace: true })
      return
    }

    // Unknown mode
    navigate('/signin', { replace: true })
  }, [searchParams, navigate])

  return (
    <AuthLayout
      variant="signin"
      footer={<Footer />}
      heading="Taking you there..."
      subheading="One moment."
    >
      <div className="p-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#ABFF63]" />
      </div>
    </AuthLayout>
  )
}
