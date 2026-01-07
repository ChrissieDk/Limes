import { CreditCard, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DashboardNavbar from '../../auth/components/DashboardNavbar'
import SavedCards from '../components/SavedCards'

export default function PaymentMethodsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-neutral-900">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-neutral-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neutral-800 rounded-xl border border-neutral-700">
              <CreditCard className="w-6 h-6 text-neutral-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Payment Methods</h1>
              <p className="text-neutral-400 mt-1">
                Manage your saved cards
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white mb-2">
              Your Saved Cards
            </h2>
            <p className="text-neutral-400 text-sm">
              Cards saved for quick one-click payments. Your card details are securely stored.
            </p>
          </div>
          <SavedCards />
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-neutral-300 mb-2">
              🔒 Secure & Encrypted
            </h3>
            <p className="text-sm text-neutral-400">
              Your card details are never stored directly. We use secure tokens provided by Paystack.
            </p>
          </div>
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-neutral-300 mb-2">
              ⚡ One-Click Payments
            </h3>
            <p className="text-sm text-neutral-400">
              Use saved cards for instant payments without re-entering card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
