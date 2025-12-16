import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';
import { userService } from '../services/userService';
import { paymentService } from '../../payment/services/paymentService';
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
  Phone,
  CreditCard
} from 'lucide-react';

// Monthly/recurring plan IDs
const RECURRING_PLAN_IDS = ['40021', '40022'];

function Subscriptions() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchUserAndSubscription();
  }, []);

  const fetchUserAndSubscription = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[Subscriptions] 📡 Fetching user data...');
      const userData = await userService.getCurrentUser();
      console.log('[Subscriptions] 👤 User data:', userData);
      
      // TEMPORARY: Use hardcoded MSISDN until we have proper subscriber endpoint
      // TODO: Replace with actual subscriber/product data endpoint
      const tempUserData: User = {
        ...userData,
        msisdn: '27644038847', // Hardcoded for now
        productId: undefined // Will be determined from stored subscription data
      };

      // Try to fetch subscription details if we have an ID stored
      const storedSubIds = localStorage.getItem('subscriptionIds');
      if (storedSubIds) {
        try {
          const subIds = JSON.parse(storedSubIds) as string[];
          if (subIds.length > 0) {
            console.log('[Subscriptions] 📡 Fetching subscription details...');
            const subDetails = await paymentService.getSubscription(subIds[0]);
            console.log('[Subscriptions] ✅ Subscription details:', subDetails);
            setSubscription(subDetails);
            
            // Update user with productId from subscription if available
            if (subDetails.paystackPlanCode) {
              // Extract product ID from plan code if possible
              // For now, if we have a subscription, assume it's recurring
              tempUserData.productId = '40021'; // Assume recurring for demo
            }
          }
        } catch (subErr) {
          console.error('[Subscriptions] ❌ Error fetching subscription:', subErr);
        }
      } else {
        console.log('[Subscriptions] ℹ️  No subscription IDs stored in localStorage');
      }
      
      setUser(tempUserData);
    } catch (err: any) {
      console.error('[Subscriptions] ❌ Error fetching:', err);
      setError(err.response?.data?.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    if (!confirm('Are you sure you want to cancel this subscription? You will still have access until the end of the current billing period.')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await paymentService.cancelSubscription({ 
        subscriptionCode: subscription.paystackSubscriptionCode 
      });
      console.log('[Subscriptions] Cancelled:', response);
      
      if (response.success) {
        // Refresh data
        await fetchUserAndSubscription();
      } else {
        alert(response.message || 'Failed to cancel subscription');
      }
    } catch (err: any) {
      console.error('[Subscriptions] Error cancelling:', err);
      alert(err.response?.data?.message || 'Failed to cancel subscription');
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
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
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
          <div className="bg-neutral-900 rounded-lg p-12 text-center border border-neutral-800">
            <Package className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Recurring Subscriptions</h3>
            <p className="text-neutral-400 mb-2">
              {user?.productId 
                ? 'You have a prepaid or once-off plan. Only monthly recurring plans appear here.'
                : 'You don\'t have any active subscriptions yet.'}
            </p>
            {user?.productId && (
              <p className="text-neutral-500 text-sm mb-6">
                Current plan: {user.productId}
              </p>
            )}
            <button
              onClick={() => navigate('/dashboard/packages')}
              className="bg-lime-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-lime-500 transition-colors"
            >
              Browse Monthly Plans
            </button>
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
                      {subscription?.paystackPlanCode || `Plan ${user.productId}`}
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
                  {subscription?.paystackSubscriptionCode && (
                    <p className="text-neutral-400 text-sm">
                      Subscription ID: {subscription.paystackSubscriptionCode}
                    </p>
                  )}
                </div>
                
                {subscription && subscription.status.toLowerCase() === 'active' && !subscription.cancelledAt && (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                    className="bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Subscription
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                {subscription ? (
                  <div className="flex items-start">
                    <div className="bg-lime-400/10 p-3 rounded-lg mr-4">
                      <DollarSign className="w-5 h-5 text-lime-400" />
                    </div>
                    <div>
                      <p className="text-neutral-400 text-sm mb-1">Amount</p>
                      <p className="text-white font-semibold text-lg">
                        R{subscription.amountInRands.toFixed(2)}/{subscription.currency}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <div className="bg-lime-400/10 p-3 rounded-lg mr-4">
                      <CreditCard className="w-5 h-5 text-lime-400" />
                    </div>
                    <div>
                      <p className="text-neutral-400 text-sm mb-1">Plan</p>
                      <p className="text-white font-semibold text-lg">
                        Product {user.productId}
                      </p>
                    </div>
                  </div>
                )}

                {/* Next Payment or Created Date */}
                {subscription ? (
                  <div className="flex items-start">
                    <div className="bg-blue-400/10 p-3 rounded-lg mr-4">
                      <Calendar className="w-5 h-5 text-blue-400" />
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
                ) : (
                  <div className="flex items-start">
                    <div className="bg-blue-400/10 p-3 rounded-lg mr-4">
                      <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-neutral-400 text-sm mb-1">Type</p>
                      <p className="text-white font-semibold">Monthly Recurring</p>
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
    </div>
  );
}

export default Subscriptions;
