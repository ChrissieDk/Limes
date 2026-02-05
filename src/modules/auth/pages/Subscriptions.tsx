import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import { userService } from '../services/userService';
import { paymentService } from '../../payment/services/paymentService';
import { SubscriptionCardSkeleton } from '../components/dashboard/SkeletonLoaders';
import type { User } from '../../../types';
import type { SubscriptionDetails } from '../../../types/payment';
import { 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertCircle,
  ChevronLeft,
  Package,
  Phone
} from 'lucide-react';

// Map product IDs and Paystack plan codes to friendly names
const PLAN_CODE_TO_NAME: Record<string, string> = {
  '40021': 'Lite Monthly Plan',
  '40022': '300MB Monthly Plan',
  'PLN_h1tdp1icb27ss2w': '300MB Monthly Plan',
  'PLN_anjvoror46vxqvaw': 'Test Monthly Plan',
};

// Monthly/recurring plan IDs
const RECURRING_PLAN_IDS = ['40021', '40022'];

function Subscriptions() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    fetchUserAndSubscription();
  }, []);

  const fetchUserAndSubscription = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await userService.getCurrentUser();
      console.log('[Subscriptions] User data:', userData);
      
      // Use new getAllSubscriptions endpoint
      const { subscriptions } = await paymentService.getAllSubscriptions();
      console.log('[Subscriptions] All subscriptions:', subscriptions);
      
      // Find the first active subscription
      const activeSubscription = subscriptions.find((sub) => sub.isActive && sub.status === 'active');
      
      if (activeSubscription) {
        console.log('[Subscriptions] Active subscription found:', activeSubscription);
        
        // Map subscription data to User format
        const tempUserData: User = {
          ...userData,
          msisdn: activeSubscription.msisdn,
          productId: activeSubscription.productId
        };
        
        // Use the new Subscription type with additional fields
        const mappedSubscription: SubscriptionDetails = {
          id: activeSubscription.id,
          paystackSubscriptionCode: activeSubscription.paystackSubscriptionCode,
          paystackPlanCode: activeSubscription.paystackPlanCode,
          status: activeSubscription.status,
          nextPaymentDate: activeSubscription.nextPaymentDate,
          amountInRands: activeSubscription.amountInRands,
          currency: activeSubscription.currency,
          createdAt: activeSubscription.createdAt,
          cancelledAt: activeSubscription.cancelledAt
        };
        
        setSubscription(mappedSubscription);
        setUser(tempUserData);
      } else {
        // No active subscription found
        console.log('[Subscriptions] No active subscription found');
        setUser({
          ...userData,
          msisdn: userData.msisdns?.[0]?.msisdn || '',
          productId: undefined
        });
      }
    } catch (err: any) {
      console.error('[Subscriptions] Error:', err);
      setError(err.response?.data?.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription || !user?.msisdn || !user?.productId) {
      setError('Missing subscription information. Please try again.');
      return;
    }

    setCancelling(true);
    setError(null);
    
    try {
      const response = await paymentService.cancelSubscription({ 
        subscriptionCode: subscription.paystackSubscriptionCode,
        msisdn: user.msisdn,
        productId: user.productId
      });
      console.log('[Subscriptions] Cancelled:', response);
      
      if (response.success) {
        setCancelSuccess(true);
        // Refresh data after a short delay
        setTimeout(async () => {
          await fetchUserAndSubscription();
          setShowCancelModal(false);
          setCancelSuccess(false);
        }, 2000);
      } else {
        setError(response.message || 'Failed to cancel subscription');
      }
    } catch (err: any) {
      console.error('[Subscriptions] Error cancelling:', err);
      const errorMessage = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || 'Failed to cancel subscription';
      setError(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  const isRecurringPlan = user?.productId && RECURRING_PLAN_IDS.includes(user.productId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-lime-400 bg-lime-400/10';
      case 'cancelled':
      case 'canceled':
        return 'text-neutral-500 bg-neutral-500/10';
      case 'non-renewing':
        return 'text-yellow-400 bg-yellow-400/10';
      default:
        return 'text-neutral-400 bg-neutral-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNavbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-neutral-400 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neutral-800 rounded-xl border border-neutral-700">
              <Package className="w-6 h-6 text-lime-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Subscriptions</h1>
              <p className="text-neutral-400">Manage your active recurring plans</p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <SubscriptionCardSkeleton />
            {/* Info box skeleton */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 animate-pulse">
              <div className="flex items-start">
                <div className="w-5 h-5 bg-neutral-800 rounded mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-5 w-48 bg-neutral-800 rounded mb-3" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-neutral-800 rounded" />
                    <div className="h-3 w-5/6 bg-neutral-800 rounded" />
                    <div className="h-3 w-4/6 bg-neutral-800 rounded" />
                    <div className="h-3 w-full bg-neutral-800 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold mb-1">Error Loading Subscriptions</h3>
                <p className="text-neutral-400 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No Recurring Subscriptions */}
        {!loading && !error && !isRecurringPlan && (
          <div className="space-y-6">
            <div className="bg-neutral-900 rounded-lg p-12 text-center border border-neutral-800">
              <Package className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Active Recurring Subscriptions</h3>
              <p className="text-neutral-400 mb-6">
                {user?.productId 
                  ? 'You have a prepaid or once-off plan. Only monthly recurring plans appear here.'
                  : 'You don\'t have any active subscriptions yet.'}
              </p>
              <button
                onClick={() => navigate('/dashboard/packages')}
                className="bg-lime-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-lime-500 transition-colors"
              >
                Browse Monthly Plans
              </button>
            </div>

            {/* Info about recurring plans */}
            <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-blue-400 font-semibold mb-2">ℹ️ About Your Subscriptions</h3>
                  <p className="text-neutral-300 text-sm mb-2">
                    Your subscription data is synced from your account and will be available across all your devices.
                  </p>
                  <p className="text-neutral-400 text-sm">
                    To view or purchase new plans, visit the <button onClick={() => navigate('/dashboard/packages')} className="text-lime-400 hover:underline">Packages page</button>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Recurring Subscription */}
        {!loading && !error && isRecurringPlan && (
          <div className="space-y-6">
            {/* Subscription Card */}
            <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-white mr-3">
                      {subscription && PLAN_CODE_TO_NAME[subscription.paystackPlanCode] 
                        ? PLAN_CODE_TO_NAME[subscription.paystackPlanCode]
                        : subscription?.paystackPlanCode || `Plan ${user.productId}`
                      }
                    </h3>
                    {subscription ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium text-lime-400 bg-lime-400/10">
                        Active
                      </span>
                    )}
                  </div>
                  {subscription && (
                    <div className="space-y-1">
                      <p className="text-neutral-500 text-xs">
                        Plan Code: {subscription.paystackPlanCode}
                      </p>
                      <p className="text-neutral-400 text-sm">
                        Subscription ID: {subscription.paystackSubscriptionCode}
                      </p>
                    </div>
                  )}
                </div>
                
                {subscription && subscription.status.toLowerCase() === 'active' && !subscription.cancelledAt && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelling}
                    className="bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Subscription
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* MSISDN */}
                {user.msisdn && (
                  <div className="flex items-start">
                    <div className="bg-purple-400/10 p-3 rounded-lg mr-4">
                      <Phone className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-neutral-400 text-sm mb-1">Phone Number</p>
                      <p className="text-white font-semibold text-lg">{user.msisdn}</p>
                    </div>
                  </div>
                )}

                {/* Amount */}
                {subscription && (
                  <div className="flex items-start">
                    <div className="bg-lime-400/10 p-3 rounded-lg mr-4">
                      <DollarSign className="w-5 h-5 text-lime-400" />
                    </div>
                    <div>
                      <p className="text-neutral-400 text-sm mb-1">Amount</p>
                      <p className="text-white font-semibold text-lg">
                        R{subscription.amountInRands.toFixed(2)}/mo
                      </p>
                    </div>
                  </div>
                )}

                {/* Auto-Renewal Status */}
                <div className="flex items-start">
                  <div className="bg-blue-400/10 p-3 rounded-lg mr-4">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-neutral-400 text-sm mb-1">Auto-Renewal</p>
                    <p className="text-white font-semibold">
                      {subscription?.cancelledAt ? 'Disabled' : 'Enabled'}
                    </p>
                  </div>
                </div>

                {/* Next Payment */}
                {subscription && (
                  <div className="flex items-start">
                    <div className="bg-orange-400/10 p-3 rounded-lg mr-4">
                      <Calendar className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-neutral-400 text-sm mb-1">Next Payment</p>
                      <p className="text-white font-semibold">
                        {subscription.cancelledAt 
                          ? 'Cancelled' 
                          : formatDate(subscription.nextPaymentDate)
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {subscription?.cancelledAt && (
                <div className="mt-6 pt-6 border-t border-neutral-800">
                  <div className="flex items-center text-yellow-400">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <p className="text-sm">
                      This subscription was cancelled on {formatDate(subscription.cancelledAt)}. 
                      You will still have access until the end of your current billing period.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-lime-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-semibold mb-2">About Subscriptions</h3>
                  <ul className="text-neutral-400 text-sm space-y-1">
                    <li>• Subscriptions renew automatically on the next payment date</li>
                    <li>• Cancelling a subscription will stop future charges but keep your access until the end of the current period</li>
                    <li>• You can reactivate a cancelled subscription by purchasing the plan again</li>
                    <li>• Payment is processed using your saved payment method</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {cancelSuccess ? (
              // Success State
              <div className="text-center">
                <div className="mb-4 mx-auto w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-lime-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Subscription Cancelled</h3>
                <p className="text-neutral-400">
                  Your subscription has been successfully cancelled.
                </p>
              </div>
            ) : (
              // Confirmation State
              <>
                <div className="mb-6">
                  <div className="mb-4 mx-auto w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 text-center">Cancel Subscription?</h3>
                </div>

                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 mb-6 space-y-3">
                  <div className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-lime-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold text-sm">Access Until Billing Date</p>
                      <p className="text-neutral-400 text-sm">
                        You'll continue to have access until {subscription && formatDate(subscription.nextPaymentDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-lime-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold text-sm">No Future Charges</p>
                      <p className="text-neutral-400 text-sm">
                        You won't be charged after {subscription && formatDate(subscription.nextPaymentDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-lime-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold text-sm">Resubscribe Anytime</p>
                      <p className="text-neutral-400 text-sm">
                        You can choose a new package from our plans page once this expires
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setError(null);
                    }}
                    disabled={cancelling}
                    className="flex-1 bg-neutral-800 text-white px-4 py-3 rounded-lg font-semibold hover:bg-neutral-700 transition-colors disabled:opacity-50"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Yes, Cancel'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default Subscriptions;
