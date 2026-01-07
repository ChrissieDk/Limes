import { useEffect, useState } from 'react'
import { Calendar, AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { paymentService } from '../services/paymentService'
import { userService } from '../../auth/services/userService'
import type { SubscriptionDetails, SavedCard } from '../../../types/payment'

interface SubscriptionManagementProps {
  subscriptionId?: string // If provided, load this subscription
  onSubscriptionCreated?: (subscription: SubscriptionDetails) => void
  onSubscriptionCancelled?: () => void
}

export default function SubscriptionManagement({
  subscriptionId,
  onSubscriptionCreated,
  onSubscriptionCancelled,
}: SubscriptionManagementProps) {
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null)
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [userMsisdn, setUserMsisdn] = useState<string>('')
  
  // Create subscription form state
  const [selectedCardId, setSelectedCardId] = useState<string>('')
  const [planCode, setPlanCode] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  // Fetch user MSISDN
  useEffect(() => {
    const fetchUserMsisdn = async () => {
      try {
        const user = await userService.getCurrentUser()
        const activeMsisdn = user.msisdns?.find((m) => m.hasActiveSubscription)
        if (activeMsisdn) {
          setUserMsisdn(activeMsisdn.msisdn)
        } else if (user.msisdns && user.msisdns.length > 0) {
          setUserMsisdn(user.msisdns[0].msisdn)
        }
      } catch (err) {
        console.error('[SubscriptionManagement] Error fetching user MSISDN:', err)
      }
    }
    fetchUserMsisdn()
  }, [])

  useEffect(() => {
    if (subscriptionId) {
      loadSubscription(subscriptionId)
    } else {
      loadSavedCards()
    }
  }, [subscriptionId])

  const loadSubscription = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await paymentService.getSubscription(id)
      setSubscription(data)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load subscription')
    } finally {
      setLoading(false)
    }
  }

  const loadSavedCards = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await paymentService.getSavedCards()
      setSavedCards(data)
      if (data.length > 0) {
        setSelectedCardId(data[0].id)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load saved cards')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubscription = async () => {
    if (!selectedCardId || !planCode) {
      setError('Please select a card and enter a plan code')
      return
    }
    
    if (!userMsisdn) {
      setError('User MSISDN not found. Please try again.')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const response = await paymentService.subscribe({
        productId: planCode,
        paymentMethodId: selectedCardId,
        msisdn: userMsisdn // Use actual user MSISDN from API
      })

      if (response.success && response.subscription) {
        setSubscription(response.subscription as any)
        setSuccessMessage('Subscription created successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
        if (onSubscriptionCreated) {
          onSubscriptionCreated(response.subscription as any)
        }
      } else {
        setError(response.error || 'Failed to create subscription')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create subscription')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    if (!userMsisdn) {
      setError('User MSISDN not found. Please try again.')
      return
    }

    if (!confirm('Are you sure you want to cancel this subscription? No further charges will be made.')) {
      return
    }

    setIsCancelling(true)
    setError(null)

    try {
      const response = await paymentService.cancelSubscription({
        subscriptionCode: subscription.paystackSubscriptionCode,
        msisdn: userMsisdn,
        productId: subscription.paystackPlanCode,
      })

      if (response.success) {
        setSuccessMessage('Subscription cancelled successfully')
        setTimeout(() => setSuccessMessage(null), 3000)
        if (onSubscriptionCancelled) {
          onSubscriptionCancelled()
        }
        // Reload subscription to get updated status
        if (subscriptionId) {
          loadSubscription(subscriptionId)
        }
      } else {
        setError('Failed to cancel subscription')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel subscription')
    } finally {
      setIsCancelling(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      past_due: 'bg-yellow-100 text-yellow-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-300">Loading...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-400">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Existing Subscription */}
      {subscription ? (
        <div className="border border-gray-700 bg-gray-900/50 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Subscription Details</h3>
            {getStatusBadge(subscription.status)}
          </div>

          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Plan Code:</span>
              <span className="font-medium text-white">{subscription.paystackPlanCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Amount:</span>
              <span className="font-medium text-white">R{subscription.amountInRands} {subscription.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Next Payment:</span>
              <span className="font-medium text-white flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(subscription.nextPaymentDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Created:</span>
              <span className="font-medium text-white">
                {new Date(subscription.createdAt).toLocaleDateString()}
              </span>
            </div>
            {subscription.cancelledAt && (
              <div className="flex justify-between">
                <span className="text-gray-400">Cancelled:</span>
                <span className="font-medium text-red-400">
                  {new Date(subscription.cancelledAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {subscription.status === 'active' && (
            <button
              onClick={handleCancelSubscription}
              disabled={isCancelling}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Cancel Subscription
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        /* Create New Subscription Form */
        <div className="border border-gray-700 bg-gray-900/50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Create Subscription</h3>

          {savedCards.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p>You need to save a card first before creating a subscription.</p>
              <p className="text-sm mt-2">Make a one-time payment and save your card.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select Card */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Card
                </label>
                <select
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {savedCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.cardType.toUpperCase()} •••• {card.last4} - {card.bank}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plan Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plan Code
                </label>
                <input
                  type="text"
                  value={planCode}
                  onChange={(e) => setPlanCode(e.target.value)}
                  placeholder="e.g., PLN_monthly_lite"
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Get plan code from Paystack Dashboard → Plans
                </p>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateSubscription}
                disabled={isCreating || !selectedCardId || !planCode}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Create Subscription
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
