import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import Footer from "../components/Footer";
import MobilePage from "../../../components/MobilePage";
import { paymentService } from "../../payment/services/paymentService";
import { SubscriptionCardSkeleton } from "../components/dashboard/SkeletonLoaders";
import { formatDate } from "../../../utils/dateFormat";
import type { SubscriptionDetails } from "../../../types/payment";
import {
  XCircle,
  Loader2,
  AlertCircle,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";

// Map product IDs and Paystack plan codes to friendly names
const PLAN_CODE_TO_NAME: Record<string, string> = {
  "40021": "Value Plan",
  "40022": "Premium Plan",
  PLN_h1tdp1icb27ss2w: "Unlimited Plan",
  PLN_anjvoror46vxqvaw: "Standard Plan",
};

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-lime-400/10 text-lime-400";
    case "cancelled":
      return "bg-yellow-400/10 text-yellow-400";
    case "expired":
      return "bg-red-400/10 text-red-400";
    default:
      return "bg-neutral-400/10 text-neutral-400";
  }
}

function getPlanName(sub: SubscriptionWithDetails): string {
  const productId = sub.productId?.toString() || "";
  const paystackPlanCode = sub.paystackPlanCode || "";
  return (
    PLAN_CODE_TO_NAME[productId] ||
    PLAN_CODE_TO_NAME[paystackPlanCode] ||
    paystackPlanCode ||
    "Subscription"
  );
}

interface SubscriptionWithDetails extends SubscriptionDetails {
  msisdn?: string;
  productId?: string | number;
  hasDynamicServices?: boolean;
}

export default function Subscriptions() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [selectedMsisdn, setSelectedMsisdn] = useState<string>("all");
  const [availableMsisdns, setAvailableMsisdns] = useState<string[]>([]);

  const fetchUserAndSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use new getAllSubscriptions endpoint
      const { subscriptions: allSubs } =
        await paymentService.getAllSubscriptions();

      // Filter active subscriptions and map to full details
      const activeSubs = allSubs
        .filter((sub) => sub.isActive && sub.status === "active")
        .map((sub) => ({
          id: sub.id,
          paystackSubscriptionCode: sub.paystackSubscriptionCode,
          paystackPlanCode: sub.paystackPlanCode,
          status: sub.status,
          nextPaymentDate: sub.nextPaymentDate,
          amountInRands: sub.amountInRands,
          currency: sub.currency,
          createdAt: sub.createdAt,
          cancelledAt: sub.cancelledAt,
          msisdn: sub.msisdn,
          productId: sub.productId,
          hasDynamicServices: sub.hasDynamicServices,
        }));

      // Extract unique MSISDNs for filter
      const uniqueMsisdns = Array.from(
        new Set(activeSubs.map((sub) => sub.msisdn)),
      );
      setAvailableMsisdns(uniqueMsisdns);

      setSubscriptions(activeSubs);
    } catch (err: any) {
      console.error("[Subscriptions] Error:", err);
      setError(
        err.response?.data?.message || "Failed to load subscription data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndSubscriptions();
  }, []);

  const handleCancelSubscription = async (sub: SubscriptionWithDetails) => {
    setCancelling(sub.id);
    setError(null);
    try {
      const response = await paymentService.cancelSubscription({
        subscriptionCode: sub.paystackSubscriptionCode,
        msisdn: sub.msisdn || "",
        productId: sub.productId?.toString() || "",
      });
      if (response.success) {
        setCancelSuccess(true);
        // Refresh data after a short delay
        setTimeout(async () => {
          await fetchUserAndSubscriptions();
          setShowCancelModal(null);
          setCancelSuccess(false);
        }, 2000);
      } else {
        setError(response.message || "Failed to cancel subscription");
      }
    } catch (err: any) {
      console.error("[Subscriptions] Error cancelling:", err);
      const errorMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(", ")
        : err.response?.data?.message || "Failed to cancel subscription";
      setError(errorMessage);
    } finally {
      setCancelling(null);
    }
  };

  // Filter subscriptions by selected MSISDN
  const filteredSubscriptions =
    selectedMsisdn === "all"
      ? subscriptions
      : subscriptions.filter((sub) => sub.msisdn === selectedMsisdn);

  const subToCancel = showCancelModal
    ? subscriptions.find((s) => s.id === showCancelModal)
    : null;

  return (
    <>
      <div className="hidden lg:block">
        <div className="min-h-screen bg-neutral-900 text-white">
          <DashboardNavbar />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="mb-10">
              <h1 className="text-center font-grotesque font-semibold text-white text-5xl sm:text-6xl md:text-7xl leading-[1.02] tracking-tight">
                My subscriptions
              </h1>
              <p className="font-manrope mt-3 text-center text-neutral-400 text-sm">
                Manage your active recurring subscriptions
              </p>
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
                    <h3 className="font-grotesque text-white font-semibold mb-1">
                      Error Loading Subscriptions
                    </h3>
                    <p className="font-manrope text-neutral-400 text-sm">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* No Subscriptions */}
            {!loading && !error && subscriptions.length === 0 && (
              <div className="space-y-8">
                <div className="max-w-4xl mx-auto">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 ring-1 ring-white/10 text-white px-5 h-11 text-sm font-semibold hover:bg-white/15 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                  </button>
                </div>

                <div className="max-w-4xl mx-auto rounded-[28px] bg-white/5 ring-1 ring-white/10 p-10 sm:p-12 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <img
                      src={`${import.meta.env.BASE_URL}images/star.png`}
                      alt=""
                      aria-hidden="true"
                      className="h-10 w-10 select-none"
                    />
                  </div>
                  <h3 className="text-white font-grotesque font-semibold text-2xl sm:text-3xl leading-[1.15] mb-2">
                    No active subscriptions
                  </h3>
                  <p className="font-manrope text-neutral-400 text-sm sm:text-base mb-8">
                    You don't have any active recurring subscriptions yet.
                  </p>
                  <button
                    onClick={() => navigate("/dashboard/packages")}
                    className="w-full inline-flex items-center justify-center rounded-2xl bg-[#ABFF63] text-neutral-900 h-12 text-sm font-semibold hover:brightness-95 transition"
                  >
                    Browse subscriptions
                  </button>
                </div>

                <div className="max-w-4xl mx-auto rounded-[28px] bg-transparent ring-1 ring-white/10 p-8">
                  <h3 className="text-white font-grotesque font-semibold text-xl mb-2">
                    About your subscriptions
                  </h3>
                  <p className="font-manrope text-neutral-400 text-sm">
                    Your subscription data is synced from your account and will
                    be available across all your devices.
                  </p>
                  <p className="font-manrope text-neutral-400 text-sm mt-3">
                    To view or purchase new subscriptions,{" "}
                    <button
                      onClick={() => navigate("/dashboard/packages")}
                      className="text-[#ABFF63] hover:underline"
                    >
                      view our subscriptions
                    </button>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Active Subscriptions */}
            {!loading && !error && subscriptions.length > 0 && (
              <div className="space-y-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 ring-1 ring-white/10 text-white px-5 h-11 text-sm font-semibold hover:bg-white/15 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                  </button>

                  {/* MSISDN Filter */}
                  {availableMsisdns.length > 1 && (
                    <div className="flex items-center gap-3">
                      <label className="font-manrope text-neutral-400 text-sm">
                        Filter by number:
                      </label>
                      <select
                        value={selectedMsisdn}
                        onChange={(e) => setSelectedMsisdn(e.target.value)}
                        className="bg-neutral-800 border border-neutral-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                      >
                        <option value="all">
                          All Numbers ({subscriptions.length})
                        </option>
                        {availableMsisdns.map((msisdn) => (
                          <option key={msisdn} value={msisdn}>
                            {msisdn} (
                            {
                              subscriptions.filter((s) => s.msisdn === msisdn)
                                .length
                            }
                            )
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Subscription Cards */}
                <div className="space-y-6">
                  {filteredSubscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="max-w-6xl mx-auto rounded-[28px] bg-transparent ring-1 ring-white/10 p-8"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="font-grotesque text-xl font-semibold text-white mr-3">
                              {getPlanName(sub)}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}
                            >
                              {sub.status}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="font-manrope text-neutral-500 text-xs">
                              Subscription Code: {sub.paystackPlanCode}
                            </p>
                            <p className="font-manrope text-neutral-400 text-sm">
                              Subscription ID: {sub.paystackSubscriptionCode}
                            </p>
                          </div>
                        </div>

                        {sub.status.toLowerCase() === "active" &&
                          !sub.cancelledAt && (
                            <button
                              onClick={() => setShowCancelModal(sub.id)}
                              disabled={cancelling === sub.id}
                              className="bg-white/10 ring-1 ring-white/10 text-white px-4 h-11 rounded-xl text-sm font-semibold hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel
                            </button>
                          )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* MSISDN */}
                        <div className="flex items-start gap-3">
                          <img
                            src={`${import.meta.env.BASE_URL}images/plan_phone.svg`}
                            alt=""
                            className="w-8 h-8 flex-shrink-0"
                          />
                          <div>
                            <p className="font-manrope text-neutral-400 text-sm mb-1">
                              Phone Number
                            </p>
                            <p className="font-grotesque text-white font-semibold text-lg">
                              {sub.msisdn}
                            </p>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="flex items-start gap-3">
                          <img
                            src={`${import.meta.env.BASE_URL}images/plan_lime.svg`}
                            alt=""
                            className="w-8 h-8 flex-shrink-0"
                          />
                          <div>
                            <p className="font-manrope text-neutral-400 text-sm mb-1">
                              Amount
                            </p>
                            <p className="font-grotesque text-white font-semibold text-lg">
                              R{sub.amountInRands.toFixed(2)}/mo
                            </p>
                          </div>
                        </div>

                        {/* Auto-Renewal Status */}
                        <div className="flex items-start gap-3">
                          <img
                            src={`${import.meta.env.BASE_URL}images/data_icon.svg`}
                            alt=""
                            className="w-8 h-8 flex-shrink-0"
                          />
                          <div>
                            <p className="font-manrope text-neutral-400 text-sm mb-1">
                              Auto-Renewal
                            </p>
                            <p className="font-grotesque text-white font-semibold">
                              {sub.cancelledAt ? "Disabled" : "Enabled"}
                            </p>
                          </div>
                        </div>

                        {/* Next Payment */}
                        <div className="flex items-start gap-3">
                          <img
                            src={`${import.meta.env.BASE_URL}images/ticket_icon.svg`}
                            alt=""
                            className="w-8 h-8 flex-shrink-0"
                          />
                          <div>
                            <p className="font-manrope text-neutral-400 text-sm mb-1">
                              Next Payment
                            </p>
                            <p className="font-grotesque text-white font-semibold">
                              {sub.cancelledAt
                                ? "Cancelled"
                                : formatDate(sub.nextPaymentDate)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {sub.cancelledAt && (
                        <div className="mt-6 pt-6 border-t border-neutral-800">
                          <div className="flex items-center text-yellow-400">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            <p className="font-manrope text-sm">
                              This subscription was cancelled on{" "}
                              {formatDate(sub.cancelledAt)}. You will still have
                              access until the end of your current billing
                              period.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="max-w-6xl mx-auto rounded-[28px] bg-white/5 ring-1 ring-white/10 p-8">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-lime-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-grotesque text-white font-semibold mb-2">
                        About Subscriptions
                      </h3>
                      <ul className="text-neutral-400 text-sm space-y-1">
                        <li>
                          • Subscriptions renew automatically on the next
                          payment date
                        </li>
                        <li>
                          • Cancelling a subscription will stop future charges
                          but keep your access until the end of the current
                          period
                        </li>
                        <li>
                          • You can reactivate a cancelled subscription by
                          purchasing the subscription again
                        </li>
                        <li>
                          • Payment is processed using your saved payment method
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {showCancelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                {cancelSuccess ? (
                  // Success State
                  <div className="text-center">
                    <div className="mb-4 mx-auto w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-lime-400" />
                    </div>
                    <h3 className="font-grotesque text-xl font-bold text-white mb-2">
                      Subscription Cancelled
                    </h3>
                    <p className="font-manrope text-neutral-400">
                      Your subscription has been successfully cancelled.
                    </p>
                  </div>
                ) : subToCancel ? (
                  <>
                    <div className="mb-6">
                      <div className="mb-4 mx-auto w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-yellow-400" />
                      </div>
                      <h3 className="font-grotesque text-xl font-bold text-white mb-2 text-center">
                        Cancel Subscription?
                      </h3>
                      <p className="font-manrope text-neutral-400 text-sm text-center">
                        {getPlanName(subToCancel)} • {subToCancel.msisdn}
                      </p>
                    </div>

                    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 mb-6 space-y-3">
                      <div className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-lime-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-grotesque text-white font-semibold text-sm">
                            Access Until Billing Date
                          </p>
                          <p className="font-manrope text-neutral-400 text-sm">
                            You'll continue to have access until{" "}
                            {formatDate(subToCancel.nextPaymentDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-lime-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-grotesque text-white font-semibold text-sm">
                            No Future Charges
                          </p>
                          <p className="font-manrope text-neutral-400 text-sm">
                            You won't be charged after{" "}
                            {formatDate(subToCancel.nextPaymentDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-lime-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <p className="font-grotesque text-white font-semibold text-sm">
                            Resubscribe Anytime
                          </p>
                          <p className="font-manrope text-neutral-400 text-sm">
                            You can choose a new subscription from our
                            subscriptions page once this expires
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
                          setShowCancelModal(null);
                          setError(null);
                        }}
                        disabled={cancelling === showCancelModal}
                        className="flex-1 bg-neutral-800 text-white px-4 py-3 rounded-lg font-semibold hover:bg-neutral-700 transition-colors disabled:opacity-50"
                      >
                        Keep Subscription
                      </button>
                      <button
                        onClick={() => handleCancelSubscription(subToCancel)}
                        disabled={cancelling === showCancelModal}
                        className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {cancelling === showCancelModal ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          "Yes, Cancel"
                        )}
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}
          <Footer />
        </div>
      </div>

      <MobilePage title="My Subscriptions" backTo="/dashboard">
        <div className="px-4 pt-4 space-y-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#ABFF63] animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="font-grotesque text-white font-semibold text-lg">
                No active subscriptions
              </h3>
              <p className="font-manrope text-neutral-400 text-sm mt-2">
                You don't have any active recurring subscriptions yet.
              </p>
            </div>
          ) : (
            <>
              {/* MSISDN Filter */}
              {availableMsisdns.length > 1 && (
                <select
                  value={selectedMsisdn}
                  onChange={(e) => setSelectedMsisdn(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                >
                  <option value="all">
                    All Numbers ({subscriptions.length})
                  </option>
                  {availableMsisdns.map((msisdn) => (
                    <option key={msisdn} value={msisdn}>
                      {msisdn} (
                      {subscriptions.filter((s) => s.msisdn === msisdn).length})
                    </option>
                  ))}
                </select>
              )}

              {filteredSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-grotesque text-base font-semibold text-white">
                          {getPlanName(sub)}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}
                        >
                          {sub.status}
                        </span>
                      </div>
                      {sub.msisdn && (
                        <p className="font-mono text-xs text-neutral-500">
                          {sub.msisdn}
                        </p>
                      )}
                    </div>
                    {sub.status.toLowerCase() === "active" &&
                      !sub.cancelledAt && (
                        <button
                          onClick={() => setShowCancelModal(sub.id)}
                          className="text-red-400 text-xs font-semibold px-2 py-1"
                        >
                          Cancel
                        </button>
                      )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-neutral-500 text-xs">Amount</p>
                      <p className="text-white font-semibold">
                        R{sub.amountInRands.toFixed(2)}/mo
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500 text-xs">Next Payment</p>
                      <p className="text-white font-semibold">
                        {sub.cancelledAt
                          ? "Cancelled"
                          : formatDate(sub.nextPaymentDate)}
                      </p>
                    </div>
                  </div>
                  {sub.cancelledAt && (
                    <div className="mt-3 pt-3 border-t border-neutral-800">
                      <p className="text-yellow-400 text-xs">
                        Cancelled on {formatDate(sub.cancelledAt)} — access
                        until end of billing period
                      </p>
                    </div>
                  )}
                </div>
              ))}

              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <h3 className="font-grotesque text-white font-semibold text-sm mb-2">
                  About Subscriptions
                </h3>
                <ul className="text-neutral-400 text-xs space-y-1">
                  <li>• Renew automatically on next payment date</li>
                  <li>• Cancel anytime — access continues until period ends</li>
                  <li>• Payment via your saved payment method</li>
                </ul>
              </div>
            </>
          )}

          {/* Cancel Modal (mobile) */}
          {showCancelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-5 shadow-2xl">
                {cancelSuccess ? (
                  <div className="text-center">
                    <div className="mb-3 mx-auto w-14 h-14 bg-lime-400/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-lime-400" />
                    </div>
                    <h3 className="font-grotesque text-lg font-bold text-white mb-1">
                      Cancelled
                    </h3>
                    <p className="font-manrope text-neutral-400 text-sm">
                      Your subscription has been successfully cancelled.
                    </p>
                  </div>
                ) : subToCancel ? (
                  <>
                    <div className="mb-4 text-center">
                      <h3 className="font-grotesque text-lg font-bold text-white mb-1">
                        Cancel Subscription?
                      </h3>
                      <p className="font-manrope text-neutral-400 text-sm">
                        {getPlanName(subToCancel)} • {subToCancel.msisdn}
                      </p>
                    </div>
                    <div className="bg-neutral-800 rounded-lg p-3 mb-4 space-y-2">
                      <p className="text-xs text-neutral-400">
                        • Access continues until{" "}
                        {formatDate(subToCancel.nextPaymentDate)}
                      </p>
                      <p className="text-xs text-neutral-400">
                        • No future charges
                      </p>
                      <p className="text-xs text-neutral-400">
                        • Resubscribe anytime
                      </p>
                    </div>
                    {error && (
                      <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-3">
                        <p className="text-red-400 text-xs">{error}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowCancelModal(null);
                          setError(null);
                        }}
                        className="flex-1 bg-neutral-800 text-white px-3 py-2.5 rounded-lg text-sm font-semibold"
                      >
                        Keep
                      </button>
                      <button
                        onClick={() => handleCancelSubscription(subToCancel)}
                        disabled={cancelling === showCancelModal}
                        className="flex-1 bg-red-600 text-white px-3 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        {cancelling === showCancelModal
                          ? "Cancelling..."
                          : "Yes, Cancel"}
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </MobilePage>
    </>
  );
}
