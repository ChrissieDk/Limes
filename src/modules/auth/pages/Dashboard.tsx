import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { CatalogProduct } from "../../../types/catalog";
import TopUpModal from "../components/TopUpModal";
import ShippingModal from "../components/ShippingModal";
import ChoosePackageModal from "../components/ChoosePackageModal";
import DashboardNavbar from "../components/DashboardNavbar";
import MobilePage from "../../../components/MobilePage";
import { subscriptionService } from "../../subscription/services/subscriptionService";
import { userService } from "../services/userService";
import type { SimCard as SimCardModel } from "../components/dashboard/dashboardTypes.ts";
import {
  SimCard,
  PlanDetails,
  BalanceCard,
} from "../components/dashboard/SimComponents.tsx";
import MobileSimCard from "../components/dashboard/MobileSimCard";
import {
  TransactionHistory,
  TransactionsModal,
} from "../components/dashboard/TransactionsComponents.tsx";
import {
  SimCardSkeleton,
  PlanDetailsSkeleton,
} from "../components/dashboard/SkeletonLoaders.tsx";
import { SimSearchControls } from "../components/dashboard/SimSearchControls.tsx";
import { useSimSearch } from "../components/dashboard/useSimSearch.ts";
import { PortNumberModal } from "../components/dashboard/PortNumberModal.tsx";
import { SwitchToContractModal } from "../components/dashboard/SwitchToContractModal.tsx";
import { normalizeMsisdn } from "../../../utils/phoneFormat";
import { getAxiosErrorMessage } from "../../../utils/errorMessage";
import { useDashboardData } from "./useDashboardData";
import { PRODUCT_IDS } from "./usePackageSelection";
import Footer from "../components/Footer";
import TransactionsSheet from "../components/dashboard/TransactionsSheet";
import SwitchToContractSheet from "../components/dashboard/SwitchToContractSheet";
import PortNumberSheet from "../components/dashboard/PortNumberSheet";
import { Link } from "react-router-dom";
import { Search, WifiOff, Smartphone, ChevronRight } from "lucide-react";
import PullToRefresh from "../../../components/PullToRefresh";
import { motion } from "framer-motion";
import { openSentryFeedback } from "../../../utils/feedback";

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentSimIndex, setCurrentSimIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSim, setModalSim] = useState<SimCardModel | null>(null);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [choosePackageModalOpen, setChoosePackageModalOpen] = useState(false);
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
  const [transactionsSheetOpen, setTransactionsSheetOpen] = useState(false);
  const [switchToContractSheetOpen, setSwitchToContractSheetOpen] =
    useState(false);
  const [portNumberSheetOpen, setPortNumberSheetOpen] = useState(false);
  const [portNumberModalOpen, setPortNumberModalOpen] = useState(false);
  const [switchToContractModalOpen, setSwitchToContractModalOpen] =
    useState(false);
  const [activatingSim, setActivatingSim] = useState<string | null>(null);
  const [portingInProgressMsisdns, setPortingInProgressMsisdns] = useState<
    Record<string, true>
  >(() => {
    try {
      const stored = localStorage.getItem("limes_porting_in_progress");
      if (!stored) return {};
      const parsed = JSON.parse(stored) as string[];
      return Array.isArray(parsed)
        ? Object.fromEntries(parsed.map((m) => [m, true]))
        : {};
    } catch {
      return {};
    }
  });

  const {
    simCards,
    setSimCards,
    balancesLoading,
    transactions,
    transactionsLoading,
    customerAddress,
    customerEmail,
    customerName,
    customerPhone,
    ricaComplete,
    ricaStatusChecked,
    canActivate,
    setCanActivate,
    simIsActive,
    setSimIsActive,
    activationStatusLoading,
    isLoading,
    refresh,
    refreshBalances,
    error,
    isOffline,
    isShowingCachedData,
  } = useDashboardData(currentSimIndex);

  useEffect(() => {
    const handlePaymentSuccess = () => {
      refresh();
      // Bundle provisioning may be async; retry balances after a delay
      // so the backend has time to process before we query.
      setTimeout(() => refreshBalances(), 5000);
    };
    window.addEventListener("limes:payment-success", handlePaymentSuccess);
    return () =>
      window.removeEventListener("limes:payment-success", handlePaymentSuccess);
  }, [refresh, refreshBalances]);

  const navState = location.state as Record<string, unknown> | null;
  const selectedPackageFromState = navState?.selectedPackage as
    | CatalogProduct
    | undefined;
  const selectedPackage = (navState?.selectedPackage as
    | Record<string, unknown>
    | undefined) || {
    productId: "7029225P",
    simPackageProductId: "7029225P",
    name: "Lite Plan",
    price: 199.99,
    packageType: "prepaid",
    simStatus: "has-sim",
    planChargeType: "monthly",
    features: { mobileData: "10GB", messaging: "10 SMS", phone: "10 Min" },
  };

  const packageSelectionHandledRef = useRef(false);
  const simSelectionHandledRef = useRef(false);
  useEffect(() => {
    if (packageSelectionHandledRef.current) return;
    if (selectedPackageFromState && ricaStatusChecked) {
      packageSelectionHandledRef.current = true;
      if (ricaComplete) setShippingModalOpen(true);
      else setChoosePackageModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [selectedPackageFromState, ricaComplete, ricaStatusChecked]);

  // Handle SIM selection from Lines page
  useEffect(() => {
    if (simSelectionHandledRef.current) return;
    const selectedIndex = navState?.selectedSimIndex as number | undefined;
    if (selectedIndex !== undefined && selectedIndex !== currentSimIndex) {
      simSelectionHandledRef.current = true;
      setCurrentSimIndex(selectedIndex);
      window.history.replaceState({}, document.title);
    }
  }, [navState, currentSimIndex]);

  const {
    searchTerm,
    setSearchTerm,
    hasResults: searchHasResults,
    displayPosition,
    displayTotal,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
  } = useSimSearch({ simCards, currentSimIndex, setCurrentSimIndex });

  const handleRename = async (sim: SimCardModel, newName: string) => {
    if (!sim.phoneNumber) return;
    const trimmed = newName.trim();
    try {
      await userService.updateSimDescription({
        simDescription: trimmed,
        msisdn: sim.phoneNumber,
      });
      setSimCards((prev) =>
        prev.map((s) =>
          s.phoneNumber === sim.phoneNumber ? { ...s, name: trimmed } : s,
        ),
      );
    } catch (err) {
      console.error("[Dashboard] Error renaming SIM:", err);
    }
  };

  const handleSwitchToContract = async (msisdn: string, _productId: string) => {
    try {
      await subscriptionService.migrateToContract(
        msisdn,
        PRODUCT_IDS.CONTRACT_SA,
      );
      refresh();
    } catch (err) {
      throw new Error(
        getAxiosErrorMessage(err, "Failed to switch to subscription"),
      );
    }
  };

  const handlePortConfirm = async (
    limesMsisdn: string,
    numberToPortFrom: string,
  ) => {
    const normalizedLimes = normalizeMsisdn(limesMsisdn);
    const normalizedPortFrom = normalizeMsisdn(numberToPortFrom);
    if (normalizedLimes.length < 9)
      throw new Error("Please enter a valid Limes number");
    if (normalizedPortFrom.length < 9)
      throw new Error("Please enter a valid number to port from");
    try {
      await subscriptionService.portNumber(normalizedLimes, normalizedPortFrom);
      setPortingInProgressMsisdns((prev) => {
        const next: Record<string, true> = { ...prev, [normalizedLimes]: true };
        try {
          localStorage.setItem(
            "limes_porting_in_progress",
            JSON.stringify(Object.keys(next)),
          );
        } catch {}
        return next;
      });
      refresh();
    } catch (err) {
      throw new Error(
        getAxiosErrorMessage(err, "Failed to submit porting request"),
      );
    }
  };

  const handleActivate = async (sim: SimCardModel) => {
    if (!sim.phoneNumber) return;
    setActivatingSim(sim.phoneNumber);
    try {
      const ordersResponse = await subscriptionService.processPendingOrders(
        sim.phoneNumber,
      );
      const servicesResponse =
        await subscriptionService.processPendingDynamicServices(
          sim.phoneNumber,
        );
      if (ordersResponse.success || servicesResponse.success) {
        const statusResponse = await subscriptionService.checkSimActive(
          sim.phoneNumber,
        );
        setCanActivate((prev) => ({
          ...prev,
          [sim.phoneNumber]:
            statusResponse.isActive &&
            (statusResponse.hasPendingOrders ||
              statusResponse.hasPendingDynamicServices ||
              false),
        }));
        setSimIsActive((prev) => ({
          ...prev,
          [sim.phoneNumber]: statusResponse.isActive,
        }));
        setSimCards((prev) => [...prev]);
      }
    } catch (err) {
      console.error("[Activate] Error processing pending items:", err);
    } finally {
      setActivatingSim(null);
    }
  };

  const handlePay = () => {
    console.log("Proceeding to payment...");
  };
  const handleChoosePackageModalClose = () => {
    setChoosePackageModalOpen(false);
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="min-h-screen bg-neutral-900">
          <DashboardNavbar />
          <MainContent />
          <Footer />
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <MobilePage
          variant="dashboard"
          title="Dashboard"
          customerName={customerName}
          onSearch={() => setSearchTerm(searchTerm ? "" : " ")}
        >
          <div className="flex flex-col px-4 pt-0 pb-24">
            <PullToRefresh onRefresh={refresh}>
              {/* Offline cached-data indicator */}
              {isShowingCachedData && (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-900/30 border border-amber-500/50 px-4 py-2 mb-3">
                  <WifiOff className="size-4 text-amber-400 flex-shrink-0" />
                  <p className="font-manrope text-amber-300/80 text-xs">
                    You're offline — showing saved data
                  </p>
                </div>
              )}
              <MainContentMobile />
            </PullToRefresh>
          </div>
        </MobilePage>
      </div>

      <Modals />
    </>
  );

  function Modals() {
    return (
      <>
        <TopUpModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          phoneNumber={modalSim?.phoneNumber}
          phoneNumbers={simCards.map((s) => s.phoneNumber)}
        />
        <PortNumberModal
          open={portNumberModalOpen}
          onClose={() => setPortNumberModalOpen(false)}
          currentMsisdn={simCards[currentSimIndex]?.phoneNumber ?? ""}
          onConfirm={handlePortConfirm}
        />
        <PortNumberSheet
          open={portNumberSheetOpen}
          onClose={() => setPortNumberSheetOpen(false)}
          currentMsisdn={simCards[currentSimIndex]?.phoneNumber ?? ""}
          onConfirm={handlePortConfirm}
        />
        <SwitchToContractModal
          open={switchToContractModalOpen}
          onClose={() => setSwitchToContractModalOpen(false)}
          msisdn={simCards[currentSimIndex]?.phoneNumber ?? ""}
          productId={PRODUCT_IDS.CONTRACT_SA}
          onConfirm={handleSwitchToContract}
        />
        <SwitchToContractSheet
          open={switchToContractSheetOpen}
          onClose={() => setSwitchToContractSheetOpen(false)}
          msisdn={simCards[currentSimIndex]?.phoneNumber ?? ""}
          productId={PRODUCT_IDS.CONTRACT_SA}
          onConfirm={handleSwitchToContract}
        />
        <ChoosePackageModal
          open={choosePackageModalOpen}
          onClose={handleChoosePackageModalClose}
          selectedPackage={selectedPackageFromState}
        />
        {shippingModalOpen && (
          <ShippingModal
            open={shippingModalOpen}
            onClose={() => setShippingModalOpen(false)}
            defaultAddress={
              customerAddress
                ? {
                    streetNo: customerAddress.streetNo,
                    streetName: customerAddress.streetName,
                    suburb: customerAddress.suburb,
                    city: customerAddress.city,
                    stateOrProvince: customerAddress.stateOrProvince,
                    postCode: customerAddress.postCode,
                    country: customerAddress.country,
                  }
                : undefined
            }
            selectedPackage={
              selectedPackage as unknown as Parameters<
                typeof ShippingModal
              >[0]["selectedPackage"]
            }
            onPay={handlePay}
            customerEmail={customerEmail}
            customerName={customerName}
            customerPhone={customerPhone}
            ricaData={
              customerAddress
                ? {
                    address: {
                      streetNo: customerAddress.streetNo,
                      streetName: customerAddress.streetName,
                      suburb: customerAddress.suburb || "",
                      city: customerAddress.city,
                      stateOrProvince: customerAddress.stateOrProvince,
                      postCode: customerAddress.postCode,
                      country: customerAddress.country,
                    },
                    customerInfo: {
                      firstname: customerName.split(" ")[0] || "",
                      lastname:
                        customerName.split(" ").slice(1).join(" ") || "",
                      billEmail: customerEmail,
                      phoneNumber: customerPhone,
                    },
                  }
                : undefined
            }
          />
        )}
        <TransactionsModal
          open={transactionsModalOpen}
          onClose={() => setTransactionsModalOpen(false)}
          transactions={transactions}
        />
        <TransactionsSheet
          open={transactionsSheetOpen}
          onClose={() => setTransactionsSheetOpen(false)}
          transactions={transactions}
          loading={transactionsLoading}
        />
      </>
    );
  }

  function MainContentMobile() {
    const currentSim = simCards[currentSimIndex];

    if (isLoading) {
      return (
        <div className="space-y-4">
          <SimCardSkeleton />
          <PlanDetailsSkeleton />
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <div className="h-4 bg-neutral-800 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-neutral-800 rounded w-1/4" />
                </div>
                <div className="h-4 bg-neutral-800 rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <>
        {/* Phone number + Manage Lines header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center size-9 rounded-xl bg-[#ABFF63]/15 text-[#ABFF63] flex-shrink-0">
              <Smartphone className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <span className="font-manrope text-white text-base font-semibold tracking-wider truncate">
              {currentSim?.phoneNumber || "--"}
            </span>
          </div>
          <button
            onClick={() =>
              navigate("/dashboard/lines", {
                state: {
                  simCards,
                  currentSimIndex,
                  simIsActive,
                },
              })
            }
            className="flex-shrink-0 rounded-lg bg-white/10 px-3.5 py-2 text-white text-xs font-semibold hover:bg-white/15 active:bg-white/20 transition-colors"
          >
            Manage Lines
          </button>
        </div>

        {searchTerm && (
          <div className="mb-3">
            <div className="flex h-10 items-center rounded-xl bg-white/10 px-3">
              <Search className="w-4 h-4 text-neutral-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search SIMs…"
                className="flex-1 bg-transparent text-white text-sm placeholder:text-neutral-500 focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setSearchTerm("")}
                className="text-neutral-500 text-sm font-medium ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {balancesLoading ? (
          <>
            <SimCardSkeleton />
            <PlanDetailsSkeleton />
          </>
        ) : !searchHasResults ? (
          <div className="rounded-2xl bg-neutral-800 border border-white/10 p-6 text-center">
            <h3 className="font-grotesque text-white text-base font-semibold">
              No SIMs found
            </h3>
            <p className="font-manrope mt-1 text-sm text-neutral-400">
              Try a different name or number.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activatingSim === currentSim?.phoneNumber && (
              <div className="p-3 rounded-xl bg-blue-900/50 border border-blue-500/50">
                <div className="flex items-center gap-3">
                  <div className="inline-block size-5 border-2 border-blue-200 border-t-blue-400 rounded-full animate-spin flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-white text-sm">
                      Activating your SIM...
                    </div>
                    <div className="font-manrope text-xs text-blue-200">
                      This may take up to 30 seconds.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isOffline && (
              <div className="rounded-2xl bg-amber-900/30 border border-amber-500/50 p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="size-5 mt-0.5 flex-shrink-0 text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-200 text-sm">
                      You are offline
                    </p>
                    <p className="font-manrope text-amber-300/70 text-xs mt-1">
                      Some data may not be up to date.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && !isOffline && (
              <div className="rounded-2xl bg-red-900/30 border border-red-500/50 p-4">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="size-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-red-200 text-sm">
                      Something went wrong
                    </p>
                    <p className="font-manrope text-red-300/70 text-xs mt-1">
                      {error}
                    </p>
                  </div>
                  <button
                    onClick={refresh}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            <motion.div
              key={currentSimIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <MobileSimCard
                sim={currentSim}
                onTopUp={(sim) => {
                  setModalSim(sim);
                  setModalOpen(true);
                }}
                onActivate={handleActivate}
                onPort={() => setPortNumberModalOpen(true)}
                onRename={handleRename}
                onSwitchToContract={() => setSwitchToContractModalOpen(true)}
                onManageSubscription={() =>
                  navigate("/dashboard/subscriptions")
                }
                canActivate={
                  canActivate[currentSim?.phoneNumber || currentSim?.id] ||
                  false
                }
                isActivating={activatingSim === currentSim?.phoneNumber}
                isActive={
                  simIsActive[currentSim?.phoneNumber || currentSim?.id]
                }
                activationStatusLoading={activationStatusLoading}
              />
            </motion.div>

            {/* Balance detail cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                delay: 0.1,
              }}
            >
              {(() => {
                const getBalanceValue = (
                  grouping: string,
                  definitionCode?: string,
                ) => {
                  if (!currentSim?.balances) return null;
                  const balance = currentSim.balances.find((b) =>
                    definitionCode
                      ? b.definitionCode === definitionCode
                      : b.grouping === grouping,
                  );
                  return balance?.formattedParts?.value || null;
                };
                const mobileData =
                  getBalanceValue("data", "DATA") ||
                  currentSim?.plan.mobileData ||
                  "—";
                const airtime =
                  getBalanceValue("gpa", "GPA_CREDIT") ||
                  currentSim?.plan.airtime ||
                  "—";
                const voiceMinutes =
                  getBalanceValue("voice", "VOICE") ||
                  currentSim?.plan.phone ||
                  "—";
                const smsCount =
                  getBalanceValue("sms", "SMS") ||
                  currentSim?.plan.messaging ||
                  "—";
                const whatsappData = getBalanceValue("whatsapp", "WHATSAPP");
                return (
                  <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                    <h4 className="font-grotesque text-white font-semibold text-lg mb-3">
                      Balance
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <BalanceCard
                        icon="plan_data.svg"
                        label="Mobile data"
                        value={mobileData}
                        bgClass="bg-[#FDDA36]"
                        colSpan
                      />
                      <BalanceCard
                        icon="plan_lime.svg"
                        label="Airtime"
                        value={airtime}
                        bgClass="bg-[#D8B0FF]"
                      />
                      <BalanceCard
                        icon="plan_sms.svg"
                        label="SMS"
                        value={smsCount}
                        bgClass="bg-[#629BFC]"
                      />
                      <BalanceCard
                        icon="plan_phone.svg"
                        label="Voice minutes"
                        value={voiceMinutes}
                        bgClass="bg-pink-300"
                      />
                      {whatsappData && (
                        <BalanceCard
                          icon="whatsapp_icon_small.svg"
                          label="WhatsApp"
                          value={whatsappData}
                          bgClass="bg-[#ABFF63]"
                        />
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>

            {/* SIM Management Group */}
            <motion.div
              className="mt-2 mb-4 overflow-hidden rounded-2xl bg-neutral-800/80 border border-white/5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                delay: 0.2,
              }}
            >
              <button
                onClick={() => setTransactionsSheetOpen(true)}
                className="mobile-list-row w-full text-left active:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#D8B0FF] flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-neutral-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="font-manrope text-white text-[15px] font-medium flex-1">
                  Transactions
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>

              <button
                onClick={() => setSwitchToContractSheetOpen(true)}
                disabled={currentSim?.packageType === "contract"}
                className="mobile-list-row w-full text-left active:bg-white/5 transition-colors disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FDDA36] flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-neutral-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <span className="font-manrope text-white text-[15px] font-medium flex-1">
                  {currentSim?.packageType === "contract"
                    ? "Manage Subscription"
                    : "Switch to Subscription"}
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>

              <button
                onClick={() => setPortNumberSheetOpen(true)}
                className="mobile-list-row w-full text-left active:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Smartphone
                    className="w-4 h-4 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <span className="font-manrope text-white text-[15px] font-medium flex-1">
                  Port Number
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>

              <Link
                to="/dashboard/packages"
                className="mobile-list-row w-full text-left active:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#2DD4BF] flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-neutral-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span className="font-manrope text-white text-[15px] font-medium flex-1">
                  Add new SIM
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </Link>
            </motion.div>

            {/* Account Settings Group */}
            <motion.div
              className="mt-2 mb-6 overflow-hidden rounded-2xl bg-neutral-800/80 border border-white/5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                delay: 0.3,
              }}
            >
              <Link
                to="/dashboard/delivery-tracking"
                className="mobile-list-row w-full text-left active:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#ABFF63] flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-neutral-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                </div>
                <span className="font-manrope text-white text-[15px] font-medium flex-1">
                  Delivery Tracking
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </Link>

              <Link
                to="/dashboard/payment-methods"
                className="mobile-list-row w-full text-left active:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#629BFC] flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-neutral-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <span className="font-manrope text-white text-[15px] font-medium flex-1">
                  Payment Methods
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </Link>

              <Link
                to="/dashboard/edit-details"
                className="mobile-list-row w-full text-left active:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-pink-300 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-neutral-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <span className="font-manrope text-white text-[15px] font-medium flex-1">
                  Account Details
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </Link>

              <button
                onClick={openSentryFeedback}
                className="mobile-list-row w-full text-left active:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FF8C42] flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-neutral-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <span className="font-manrope text-white text-[15px] font-medium flex-1">
                  Report an Issue
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>
            </motion.div>
          </div>
        )}
      </>
    );
  }

  function MainContent() {
    return (
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 items-stretch">
            <div className="bg-neutral-800 rounded-xl p-3 md:p-6 h-full border border-neutral-700 flex flex-col">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
                <h2 className="font-grotesque text-white font-medium text-xl whitespace-nowrap">
                  My SIM
                </h2>
                <SimSearchControls
                  searchTerm={searchTerm}
                  onSearchTermChange={setSearchTerm}
                  displayPosition={displayPosition}
                  displayTotal={displayTotal}
                  canGoPrev={canGoPrev}
                  canGoNext={canGoNext}
                  onPrev={goPrev}
                  onNext={goNext}
                />
              </div>
              <div className="flex-1 flex flex-col gap-3">
                {balancesLoading ? (
                  <>
                    <SimCardSkeleton />
                    <PlanDetailsSkeleton />
                  </>
                ) : !searchHasResults ? (
                  <div className="rounded-[24px] bg-white/5 ring-1 ring-white/10 p-5">
                    <h3 className="font-grotesque text-white text-lg font-semibold">
                      No SIMs found
                    </h3>
                    <p className="font-manrope mt-1 text-sm text-neutral-400">
                      Try a different name or number in the search bar.
                    </p>
                  </div>
                ) : (
                  <>
                    {activatingSim ===
                      simCards[currentSimIndex]?.phoneNumber && (
                      <div className="p-4 rounded-xl bg-blue-900/50 border border-blue-500/50">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="inline-block size-5 border-2 border-blue-200 border-t-blue-400 rounded-full animate-spin" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white mb-1">
                              Activating your SIM...
                            </div>
                            <div className="font-manrope text-sm text-blue-200">
                              This may take up to 30 seconds. Please don&apos;t
                              close this window.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isOffline && (
                      <div className="rounded-xl bg-amber-900/30 border border-amber-500/50 p-4">
                        <div className="flex items-start gap-3">
                          <svg
                            className="size-5 mt-0.5 flex-shrink-0 text-amber-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div className="flex-1">
                            <p className="font-semibold text-amber-200 text-sm">
                              You are offline
                            </p>
                            <p className="font-manrope text-amber-300/70 text-xs mt-1">
                              Some data may not be up to date.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {error && !isOffline && (
                      <div className="rounded-xl bg-red-900/30 border border-red-500/50 p-4">
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="size-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-red-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-red-200 text-sm">
                              Something went wrong
                            </p>
                            <p className="font-manrope text-red-300/70 text-xs mt-1">
                              {error}
                            </p>
                          </div>
                          <button
                            onClick={refresh}
                            className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    )}

                    <SimCard
                      sim={simCards[currentSimIndex]}
                      onTopUp={(sim) => {
                        setModalSim(sim);
                        setModalOpen(true);
                      }}
                      onActivate={handleActivate}
                      onRename={handleRename}
                      canActivate={
                        canActivate[
                          simCards[currentSimIndex]?.phoneNumber ||
                            simCards[currentSimIndex]?.id
                        ] || false
                      }
                      isActivating={
                        activatingSim === simCards[currentSimIndex]?.phoneNumber
                      }
                      isActive={
                        simIsActive[
                          simCards[currentSimIndex]?.phoneNumber ||
                            simCards[currentSimIndex]?.id
                        ]
                      }
                      activationStatusLoading={activationStatusLoading}
                    />
                    <PlanDetails
                      sim={simCards[currentSimIndex]}
                      onPortMyNumber={() => setPortNumberModalOpen(true)}
                      onSwitchToContract={() =>
                        setSwitchToContractModalOpen(true)
                      }
                      isPortingInProgress={
                        !!portingInProgressMsisdns[
                          simCards[currentSimIndex]?.phoneNumber ?? ""
                        ]
                      }
                    />
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <TransactionHistory
                transactions={transactions}
                loading={transactionsLoading}
                className="flex-1"
                onOpenFullView={() => setTransactionsModalOpen(true)}
              />
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export default Dashboard;
