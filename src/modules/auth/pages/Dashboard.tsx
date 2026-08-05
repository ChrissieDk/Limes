import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { CatalogProduct } from '../../../types/catalog';
import TopUpModal from '../components/TopUpModal';
import ShippingModal from '../components/ShippingModal';
import ChoosePackageModal from '../components/ChoosePackageModal';
import DashboardNavbar from '../components/DashboardNavbar';
import { subscriptionService } from '../../subscription/services/subscriptionService';
import { userService } from '../services/userService';
import type { SimCard as SimCardModel } from '../components/dashboard/dashboardTypes.ts';
import { SimCard, PlanDetails } from '../components/dashboard/SimComponents.tsx';
import { TransactionHistory, TransactionsModal } from '../components/dashboard/TransactionsComponents.tsx';
import { SimCardSkeleton, PlanDetailsSkeleton } from '../components/dashboard/SkeletonLoaders.tsx';
import { SimSearchControls } from '../components/dashboard/SimSearchControls.tsx';
import { useSimSearch } from '../components/dashboard/useSimSearch.ts';
import { PortNumberModal } from '../components/dashboard/PortNumberModal.tsx';
// Migrated product switch paused — Choose Plan is the real plan-assignment path.
// import { SwitchToContractModal } from '../components/dashboard/SwitchToContractModal.tsx';
import { normalizeMsisdn } from '../../../utils/phoneFormat';
import { getAxiosErrorMessage } from '../../../utils/errorMessage';
import { useDashboardData } from './useDashboardData';
// import { PRODUCT_IDS } from './usePackageSelection';
import Footer from '../components/Footer';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentSimIndex, setCurrentSimIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSim, setModalSim] = useState<SimCardModel | null>(null);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [choosePackageModalOpen, setChoosePackageModalOpen] = useState(false);
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
  const [portNumberModalOpen, setPortNumberModalOpen] = useState(false);
  // const [switchToContractModalOpen, setSwitchToContractModalOpen] = useState(false);
  const [activatingSim, setActivatingSim] = useState<string | null>(null);
  const [portingInProgressMsisdns, setPortingInProgressMsisdns] = useState<Record<string, true>>(() => {
    try {
      const stored = localStorage.getItem('limes_porting_in_progress')
      if (!stored) return {}
      const parsed = JSON.parse(stored) as string[]
      return Array.isArray(parsed) ? Object.fromEntries(parsed.map((m) => [m, true])) : {}
    } catch {
      return {}
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
    refresh,
  } = useDashboardData(currentSimIndex);

  // Listen for payment success events to trigger refresh
  useEffect(() => {
    const handlePaymentSuccess = () => refresh()
    window.addEventListener('limes:payment-success', handlePaymentSuccess)
    return () => window.removeEventListener('limes:payment-success', handlePaymentSuccess)
  }, [refresh]);

  // Get selected package from navigation state
  // Navigation state is runtime-unsafe; we trust the package-selection page
  // to send a well-shaped object and validate at the modal level.
  const navState = location.state as Record<string, unknown> | null
  const selectedPackageFromState = navState?.selectedPackage as CatalogProduct | undefined
  const selectedPackage = (navState?.selectedPackage as Record<string, unknown> | undefined) || {
    productId: '7029225P',
    simPackageProductId: '7029225P',
    name: 'Lite Plan',
    price: 199.99,
    packageType: 'prepaid',
    simStatus: 'has-sim',
    planChargeType: 'monthly',
    features: {
      mobileData: '10GB',
      messaging: '10 SMS',
      phone: '10 Min',
    },
  }

  // Auto-open correct modal based on RICA status when package is selected
  const packageSelectionHandledRef = useRef(false);
  useEffect(() => {
    if (packageSelectionHandledRef.current) return;
    if (selectedPackageFromState && ricaStatusChecked) {
      packageSelectionHandledRef.current = true;
      if (ricaComplete) {
        setShippingModalOpen(true);
      } else {
        setChoosePackageModalOpen(true);
      }
      window.history.replaceState({}, document.title);
    }
  }, [selectedPackageFromState, ricaComplete, ricaStatusChecked]);

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
  } = useSimSearch({
    simCards,
    currentSimIndex,
    setCurrentSimIndex,
  });

  const handleRename = async (sim: SimCardModel, newName: string) => {
    if (!sim.phoneNumber) return
    const trimmed = newName.trim()
    try {
      await userService.updateSimDescription({
        simDescription: trimmed,
        msisdn: sim.phoneNumber,
      })
      setSimCards((prev) =>
        prev.map((s) => (s.phoneNumber === sim.phoneNumber ? { ...s, name: trimmed } : s))
      )
    } catch (err) {
      console.error('[Dashboard] Error renaming SIM:', err)
    }
  }

  // const handleSwitchToContract = async (msisdn: string, _productId: string) => {
  //   try {
  //     await subscriptionService.migrateToContract(msisdn, PRODUCT_IDS.CONTRACT_SA)
  //     refresh()
  //   } catch (err) {
  //     throw new Error(getAxiosErrorMessage(err, 'Failed to switch to subscription'))
  //   }
  // }

  const handlePortConfirm = async (limesMsisdn: string, numberToPortFrom: string) => {
    const normalizedLimes = normalizeMsisdn(limesMsisdn)
    const normalizedPortFrom = normalizeMsisdn(numberToPortFrom)
    if (normalizedLimes.length < 9) throw new Error('Please enter a valid Limes number')
    if (normalizedPortFrom.length < 9) throw new Error('Please enter a valid number to port from')
    try {
      await subscriptionService.portNumber(normalizedLimes, normalizedPortFrom)
      setPortingInProgressMsisdns((prev) => {
        const next: Record<string, true> = { ...prev, [normalizedLimes]: true }
        try {
          localStorage.setItem('limes_porting_in_progress', JSON.stringify(Object.keys(next)))
        } catch {
          /* ignore */
        }
        return next
      })
      refresh()
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Failed to submit porting request'))
    }
  }

  const handleActivate = async (sim: SimCardModel) => {
    if (!sim.phoneNumber) {
      console.error('[Activate] No phone number for SIM:', sim);
      return;
    }

    setActivatingSim(sim.phoneNumber);

    try {
      const ordersResponse = await subscriptionService.processPendingOrders(sim.phoneNumber);
      const servicesResponse = await subscriptionService.processPendingDynamicServices(sim.phoneNumber);

      if (ordersResponse.success || servicesResponse.success) {
        const statusResponse = await subscriptionService.checkSimActive(sim.phoneNumber);
        setCanActivate(prev => ({
          ...prev,
          [sim.phoneNumber]: statusResponse.isActive && (statusResponse.hasPendingOrders || statusResponse.hasPendingDynamicServices || false)
        }));
        setSimIsActive(prev => ({
          ...prev,
          [sim.phoneNumber]: statusResponse.isActive
        }));

        // Trigger balance refresh by mutating simCards reference
        setSimCards(prev => [...prev])
      } else {
        console.error('[Activate] Failed to process pending items');
        console.error('[Activate] Orders:', ordersResponse.message);
        console.error('[Activate] Services:', servicesResponse.message);
      }
    } catch (err) {
      console.error('[Activate] Error processing pending items:', err);
    } finally {
      setActivatingSim(null);
    }
  };

  const handlePay = () => {
    console.log('Proceeding to payment...');
  };

  const handleChoosePlan = (sim: SimCardModel) => {
    navigate('/dashboard/packages', {
      state: {
        assignToMsisdn: sim.phoneNumber,
        packageType: 'contract',
        simPackageProductId: sim.productId,
      },
    });
  };

  const handleChoosePackageModalClose = () => {
    setChoosePackageModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <DashboardNavbar />

      <TopUpModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        phoneNumber={modalSim?.phoneNumber}
        phoneNumbers={simCards.map((s) => s.phoneNumber)}
      />
      <PortNumberModal
        open={portNumberModalOpen}
        onClose={() => setPortNumberModalOpen(false)}
        currentMsisdn={simCards[currentSimIndex]?.phoneNumber ?? ''}
        onConfirm={handlePortConfirm}
      />
      {/* <SwitchToContractModal
        open={switchToContractModalOpen}
        onClose={() => setSwitchToContractModalOpen(false)}
        msisdn={simCards[currentSimIndex]?.phoneNumber ?? ''}
        productId={PRODUCT_IDS.CONTRACT_SA}
        onConfirm={handleSwitchToContract}
      /> */}
      <ChoosePackageModal
        open={choosePackageModalOpen}
        onClose={handleChoosePackageModalClose}
        selectedPackage={selectedPackageFromState}
      />
      {shippingModalOpen && (
        <ShippingModal
          open={shippingModalOpen}
          onClose={() => {
            setShippingModalOpen(false);
          }}
          defaultAddress={customerAddress ? {
            streetNo: customerAddress.streetNo,
            streetName: customerAddress.streetName,
            suburb: customerAddress.suburb,
            city: customerAddress.city,
            stateOrProvince: customerAddress.stateOrProvince,
            postCode: customerAddress.postCode,
            country: customerAddress.country,
          } : undefined}
          selectedPackage={selectedPackage as unknown as Parameters<typeof ShippingModal>[0]['selectedPackage']}
          onPay={handlePay}
          customerEmail={customerEmail}
          customerName={customerName}
          customerPhone={customerPhone}
          ricaData={customerAddress ? {
            address: {
              streetNo: customerAddress.streetNo,
              streetName: customerAddress.streetName,
              suburb: customerAddress.suburb || '',
              city: customerAddress.city,
              stateOrProvince: customerAddress.stateOrProvince,
              postCode: customerAddress.postCode,
              country: customerAddress.country,
            },
            customerInfo: {
              firstname: customerName.split(' ')[0] || '',
              lastname: customerName.split(' ').slice(1).join(' ') || '',
              billEmail: customerEmail,
              phoneNumber: customerPhone
            }
          } : undefined}
        />
      )}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 items-stretch">
            <div className="bg-neutral-800 rounded-xl p-3 md:p-6 h-full border border-neutral-700 flex flex-col">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
                <h2 className="font-grotesque text-white font-medium text-xl whitespace-nowrap">My SIM</h2>
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
                    <h3 className="font-grotesque text-white text-lg font-semibold">No SIMs found</h3>
                    <p className="font-manrope mt-1 text-sm text-neutral-400">
                      Try a different name or number in the search bar.
                    </p>
                  </div>
                ) : (
                  <>
                    {activatingSim === simCards[currentSimIndex]?.phoneNumber && (
                      <div className="p-4 rounded-xl bg-blue-900/50 border border-blue-500/50">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="inline-block size-5 border-2 border-blue-200 border-t-blue-400 rounded-full animate-spin" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white mb-1">Activating your SIM...</div>
                            <div className="font-manrope text-sm text-blue-200">
                              This may take up to 30 seconds. Please don&apos;t close this window.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <SimCard
                      sim={simCards[currentSimIndex]}
                      onTopUp={(sim) => { setModalSim(sim); setModalOpen(true); }}
                      onActivate={handleActivate}
                      onRename={handleRename}
                      onChoosePlan={handleChoosePlan}
                      canActivate={canActivate[simCards[currentSimIndex]?.phoneNumber || simCards[currentSimIndex]?.id] || false}
                      isActivating={activatingSim === simCards[currentSimIndex]?.phoneNumber}
                      isActive={simIsActive[simCards[currentSimIndex]?.phoneNumber || simCards[currentSimIndex]?.id]}
                      activationStatusLoading={activationStatusLoading}
                    />
                    <PlanDetails
                      sim={simCards[currentSimIndex]}
                      onPortMyNumber={() => setPortNumberModalOpen(true)}
                      isPortingInProgress={!!portingInProgressMsisdns[simCards[currentSimIndex]?.phoneNumber ?? '']}
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

      <TransactionsModal
        open={transactionsModalOpen}
        onClose={() => setTransactionsModalOpen(false)}
        transactions={transactions}
      />
      <Footer />
    </div>
  );
}

export default Dashboard;
