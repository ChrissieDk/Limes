import { ArrowLeft, Lock, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DashboardNavbar from '../../auth/components/DashboardNavbar'
import Footer from '../../auth/components/Footer'
import SavedCards from '../components/SavedCards'

export default function PaymentMethodsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-neutral-900">
      <DashboardNavbar />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-center font-grotesque font-semibold text-white text-5xl sm:text-6xl md:text-7xl leading-[1.02] tracking-tight">
            Payment methods
          </h1>
          <p className="mt-3 text-center text-neutral-400 text-sm">
            Manage your saved cards
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 ring-1 ring-white/10 text-white px-5 h-11 text-sm font-semibold hover:bg-white/15 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto mt-5 rounded-[28px] bg-white/5 ring-1 ring-white/10 p-8 sm:p-10">
          <div className="mb-6">
            <h2 className="text-white font-grotesque font-semibold text-xl sm:text-2xl mb-1">
              Your saved cards
            </h2>
            <p className="text-neutral-400 text-sm">
              Cards saved for quick one-click payments. Your card details are securely stored.
            </p>
          </div>
          <SavedCards />
        </div>

        {/* Info Cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-[22px] bg-transparent ring-1 ring-white/10 p-6">
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-[#ABFF63] mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Secure &amp; Encrypted</h3>
                <p className="text-sm text-neutral-400">
                  Your card details are never stored directly. We use secure tokens provided by Paystack.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[22px] bg-transparent ring-1 ring-white/10 p-6">
            <div className="flex items-start gap-3">
              <Zap className="w-4 h-4 text-[#ABFF63] mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">One-click payments</h3>
                <p className="text-sm text-neutral-400">
                  Use saved cards for instant payments without re-entering card details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
