import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import TopUpModal from '../components/TopUpModal';
import ShippingModal from '../components/ShippingModal';
import ChoosePackageModal from '../components/ChoosePackageModal';
import DashboardNavbar from '../components/DashboardNavbar';
import { subscriptionService } from '../../subscription/services/subscriptionService';
import { crmService } from '../../crm/services/crmService';
import { userService } from '../services/userService';
import { paymentService } from '../../payment/services/paymentService';
import type { RicaAddress } from '../../../types';
import type { SimCard as SimCardModel, Transaction } from '../components/dashboard/dashboardTypes.ts';
import { mockSimCards } from '../components/dashboard/dashboardMocks.ts';
import { SimCard, PlanDetails } from '../components/dashboard/SimComponents.tsx';
import { TransactionHistory, TransactionsModal } from '../components/dashboard/TransactionsComponents.tsx';
import { SimCardSkeleton, PlanDetailsSkeleton } from '../components/dashboard/SkeletonLoaders.tsx';
import { SimSearchControls } from '../components/dashboard/SimSearchControls.tsx';
import { useSimSearch } from '../components/dashboard/useSimSearch.ts';
import { PortNumberModal } from '../components/dashboard/PortNumberModal.tsx';
import { normalizeMsisdn } from '../../../utils/phoneFormat';
import Footer from '../components/Footer';

// Main Dashboard Component
function Dashboard() {
  const location = useLocation();
  const [currentSimIndex, setCurrentSimIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSim, setModalSim] = useState<SimCardModel | null>(null);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [choosePackageModalOpen, setChoosePackageModalOpen] = useState(false);
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
  const [portNumberModalOpen, setPortNumberModalOpen] = useState(false);
  const [simCards, setSimCards] = useState<SimCardModel[]>(mockSimCards);
  const [balancesLoading, setBalancesLoading] = useState(true);
  const [customerAddress, setCustomerAddress] = useState<RicaAddress | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [ricaComplete, setRicaComplete] = useState<boolean>(false);
  const [ricaStatusChecked, setRicaStatusChecked] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [canActivate, setCanActivate] = useState<Record<string, boolean>>({});
  const [simIsActive, setSimIsActive] = useState<Record<string, boolean>>({});
  const [activationStatusLoading, setActivationStatusLoading] = useState(true);
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

  // Refs to prevent infinite loops in useEffects
  const balancesFetchedForRef = useRef<string>(''); // Track MSISDN we've fetched balances for
  const activationCheckedForRef = useRef<string>(''); // Track MSISDNs we've checked activation for
  const packageSelectionHandledRef = useRef<boolean>(false); // Track if we've handled package selection
  const activationPollInFlightRef = useRef<boolean>(false); // Prevent overlapping activation polls

  // Refresh dashboard data after successful payment
  const refreshDashboardData = () => {
    balancesFetchedForRef.current = ''
    activationCheckedForRef.current = ''

    const fetchUserData = async () => {
      try {
        const user = await userService.getCurrentUser()

        if (user.msisdns && user.msisdns.length > 0) {
          setSimCards((prev) =>
            user.msisdns!.map((msisdnData, index: number) => {
              const msisdn = msisdnData.msisdn
              const existing = prev.find((s) => s.phoneNumber === msisdn)
              return {
                id: String(index + 1),
                name: msisdnData.simDescription ?? `Sim ${index + 1}`,
                phoneNumber: msisdn,
                isActive: msisdnData.hasActiveSubscription,
                hasVoiceTopUp: existing?.hasVoiceTopUp ?? false,
                plan: existing?.plan ?? {
                  mobileData: '0GB',
                  airtime: 'R0',
                  messaging: '0SMS',
                  phone: '0 Min'
                }
              }
            })
          )
        }

        const txResponse = await paymentService.getTransactionHistory(1, 10)
        setTransactions(txResponse)
      } catch (err) {
        console.error('[Dashboard] Error refreshing data after payment:', err)
      }
    }

    fetchUserData()
  }

  // Listen for payment success events to trigger refresh
  useEffect(() => {
    const handlePaymentSuccess = () => {
      refreshDashboardData()
    }
    
    window.addEventListener('limes:payment-success', handlePaymentSuccess)
    
    return () => {
      window.removeEventListener('limes:payment-success', handlePaymentSuccess)
    }
  }, []) // Empty deps - listener setup only once

  // Get selected package from navigation state or use mock as fallback
  const selectedPackageFromState = (location.state as any)?.selectedPackage;
  const selectedPackage = selectedPackageFromState || {
    productId: '7029225P',
    simPackageProductId: '7029225P',  // Default to prepaid SA
    name: 'Lite Plan',
    price: 199.99,
    packageType: 'prepaid' as const,
    simStatus: 'has-sim' as const,
    planChargeType: 'monthly' as const,
    features: {
      mobileData: '10GB',
      messaging: '10 SMS',
      phone: '10 Min',
    },
  }

  // Fetch RICA status and user MSISDNs
  useEffect(() => {
    let cancelled = false;
    const fetchUserData = async () => {
      try {
        const user = await userService.getCurrentUser();
        if (!cancelled) {
          setRicaComplete(user.ricaComplete ?? false);

          if (user.msisdns && user.msisdns.length > 0) {
            const updatedSimCards = user.msisdns.map((msisdnData, index: number) => ({
              id: String(index + 1),
              name: msisdnData.simDescription ?? `Sim ${index + 1}`,
              phoneNumber: msisdnData.msisdn,
              isActive: msisdnData.hasActiveSubscription,
              hasVoiceTopUp: false,
              plan: {
                mobileData: '0GB',
                airtime: 'R0',
                messaging: '0SMS',
                phone: '0 Min'
              }
            }))
            setSimCards(updatedSimCards)
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[Dashboard] Error fetching user data:', err);
          setRicaComplete(false);
        }
      } finally {
        if (!cancelled) {
          setRicaStatusChecked(true);
        }
      }
    };
    fetchUserData();
    return () => {
      cancelled = true;
    };
  }, []);


  // Auto-open correct modal based on RICA status when package is selected
  // This should only run ONCE when navigating from packages page, not on every reload
  useEffect(() => {
    // Skip if we've already handled the package selection
    if (packageSelectionHandledRef.current) {
      return;
    }
    
    // Only process if there's a package from navigation state AND RICA status has been checked
    if (selectedPackageFromState && ricaStatusChecked) {
      
      // Mark as handled immediately to prevent re-running
      packageSelectionHandledRef.current = true;
      
      if (ricaComplete) {
        // RICA already done - go straight to payment
        // Subscriber will be created AFTER payment using CRM address
        setShippingModalOpen(true);
      } else {
        // RICA not done, open RICA flow first
        setChoosePackageModalOpen(true);
      }
      
      // Clear the navigation state to prevent it from persisting on reload
      window.history.replaceState({}, document.title);
    }
  }, [selectedPackageFromState, ricaComplete, ricaStatusChecked]);

  // Fetch transactions
  useEffect(() => {
    let cancelled = false;
    const fetchTransactions = async () => {
      setTransactionsLoading(true);
      try {
        const response = await paymentService.getTransactionHistory(1, 10);
        if (!cancelled) {
          console.log('[Transactions] Fetched transactions:', response);
          setTransactions(response);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[Transactions] Error fetching transactions:', err);
          // Keep empty array on error
        }
      } finally {
        if (!cancelled) setTransactionsLoading(false);
      }
    };
    fetchTransactions();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch account customer details
  useEffect(() => {
    let cancelled = false;
    const fetchAccountCustomer = async () => {
      try {
        const response = await crmService.getAccountCustomer();
        if (!cancelled) {
          
          // Get postal address from customer.address
          const postalAddress = response.customer.address.find(
            (addr: RicaAddress) => addr.addressType === 'POSTAL'
          );
          
          if (postalAddress) {
            setCustomerAddress(postalAddress);
          }
          
          // Set customer details
          setCustomerEmail(response.detail.billMedia.emailAddress);
          setCustomerName(`${response.detail.firstname} ${response.detail.lastname}`);
          setCustomerPhone(response.phone.phoneNumber);
        }
      } catch (err) {
        if (!cancelled) console.error('[Account] Error fetching customer details:', err);
      } finally {
        // No specific loading state needed for account details currently
      }
    };
    fetchAccountCustomer();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch balances for the currently selected SIM - uses ref to prevent infinite loops
  useEffect(() => {
    let cancelled = false;
    const fetchBalances = async () => {
      if (simCards.length === 0 || !simCards[currentSimIndex]?.phoneNumber) {
        setBalancesLoading(false);
        return;
      }

      const msisdnToFetch = simCards[currentSimIndex].phoneNumber;

      if (balancesFetchedForRef.current === msisdnToFetch) {
        setBalancesLoading(false);
        return;
      }

      setBalancesLoading(true);

      try {
        const response = await subscriptionService.getBalances(msisdnToFetch);
        if (!cancelled && response.balances) {
          balancesFetchedForRef.current = msisdnToFetch;

          setSimCards(prevSims => prevSims.map((sim, idx) => {
            if (idx === currentSimIndex) {
              return {
                ...sim,
                balances: response.balances,
                plan: {
                  ...sim.plan,
                  mobileData: response.balances.find(b => b.grouping === 'data')?.formattedParts?.value || sim.plan.mobileData,
                  airtime: response.balances.find(b => b.grouping === 'gpa' && b.definitionCode === 'GPA_CREDIT')?.formattedParts?.value || sim.plan.airtime,
                }
              };
            }
            return sim;
          }));
        }
      } catch (err) {
        if (!cancelled) console.error('[Balance] Error fetching balances:', err);
      } finally {
        if (!cancelled) setBalancesLoading(false);
      }
    };
    fetchBalances();
    return () => {
      cancelled = true;
    };
  }, [simCards, currentSimIndex]);

  // Check activation status for each SIM - uses ref to prevent infinite loops
  useEffect(() => {
    let cancelled = false;
    const checkActivationStatuses = async () => {
      if (simCards.length === 0) {
        setActivationStatusLoading(false);
        return;
      }

      const msisdnsKey = simCards.map(s => s.phoneNumber).filter(Boolean).sort().join(',');

      if (activationCheckedForRef.current === msisdnsKey) {
        setActivationStatusLoading(false);
        return;
      }

      setActivationStatusLoading(true);

      const canActivateStatuses: Record<string, boolean> = {};
      const isActiveStatuses: Record<string, boolean> = {};

      const checkPromises = simCards.map(async (sim) => {
        if (!sim.phoneNumber) {
          return { phoneNumber: sim.phoneNumber || sim.id, canActivate: false, isActive: false };
        }
        try {
          const response = await subscriptionService.checkSimActive(sim.phoneNumber);
          return {
            phoneNumber: sim.phoneNumber,
            canActivate: response.isActive && (response.hasPendingOrders || response.hasPendingDynamicServices || false),
            isActive: response.isActive
          };
        } catch (err) {
          console.error(`[Activation] Error checking status for ${sim.phoneNumber}:`, err);
          return { phoneNumber: sim.phoneNumber, canActivate: false, isActive: false };
        }
      });

      const results = await Promise.all(checkPromises);

      results.forEach(result => {
        canActivateStatuses[result.phoneNumber] = result.canActivate;
        isActiveStatuses[result.phoneNumber] = result.isActive;
      });

      if (!cancelled) {
        activationCheckedForRef.current = msisdnsKey;
        setCanActivate(canActivateStatuses);
        setSimIsActive(isActiveStatuses);
        setActivationStatusLoading(false);
      }
    };

    checkActivationStatuses();
    return () => {
      cancelled = true;
    };
  }, [simCards]);

  // Lightweight activation status refresh for the currently viewed SIM.
  // This avoids users needing to refresh the page to see:
  // - SIM active/inactive state changes
  // - the "Activate" button appearing when pending items are ready
  //
  // Rate-limited: one request every 45s, only for the current SIM, and skipped when tab is hidden.
  useEffect(() => {
    const msisdn = simCards[currentSimIndex]?.phoneNumber
    if (!msisdn) return

    let cancelled = false

    const tick = async () => {
      if (cancelled) return
      if (document.hidden) return
      if (activationPollInFlightRef.current) return

      activationPollInFlightRef.current = true
      try {
        const response = await subscriptionService.checkSimActive(msisdn)
        if (cancelled) return

        setCanActivate(prev => ({
          ...prev,
          [msisdn]: response.isActive && (response.hasPendingOrders || response.hasPendingDynamicServices || false),
        }))
        setSimIsActive(prev => ({
          ...prev,
          [msisdn]: response.isActive,
        }))
      } catch {
        // Silent in background; initial activation checker already logs errors
      } finally {
        activationPollInFlightRef.current = false
      }
    }

    // Run once immediately, then poll gently
    tick()
    const id = window.setInterval(tick, 45_000)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [simCards, currentSimIndex]);


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
      refreshDashboardData()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      const message = axiosErr.response?.data?.message ?? axiosErr.message ?? 'Failed to submit porting request'
      throw new Error(message)
    }
  }

  const handleActivate = async (sim: SimCardModel) => {
    if (!sim.phoneNumber) {
      console.error('[Activate] No phone number for SIM:', sim);
      return;
    }

    setActivatingSim(sim.phoneNumber);
    
    try {
      
      // Process pending orders
      const ordersResponse = await subscriptionService.processPendingOrders(sim.phoneNumber);
      // Process pending dynamic services
      const servicesResponse = await subscriptionService.processPendingDynamicServices(sim.phoneNumber);
      
      if (ordersResponse.success || servicesResponse.success) {
        
        // Refresh activation status to update button visibility
        const statusResponse = await subscriptionService.checkSimActive(sim.phoneNumber);
        setCanActivate(prev => ({
          ...prev,
          [sim.phoneNumber]: statusResponse.isActive && (statusResponse.hasPendingOrders || statusResponse.hasPendingDynamicServices || false)
        }));
        setSimIsActive(prev => ({
          ...prev,
          [sim.phoneNumber]: statusResponse.isActive
        }));

        // Refresh balances after a successful activation so the UI updates without a manual reload.
        // This works by resetting the balance fetch guard ref and triggering the existing balance effect.
        balancesFetchedForRef.current = ''
        setSimCards(prev => [...prev])
        
        // TODO: Show success message to user (toast/notification)
        // TODO: Refresh transactions if needed
      } else {
        console.error('[Activate] Failed to process pending items');
        console.error('[Activate] Orders:', ordersResponse.message);
        console.error('[Activate] Services:', servicesResponse.message);
        // TODO: Show error message to user
      }
    } catch (err) {
      console.error('[Activate] Error processing pending items:', err);
      // TODO: Show error message to user
    } finally {
      setActivatingSim(null);
    }
  };

  const handlePay = () => {
    console.log('Proceeding to payment...');
    // TODO: Integrate payment flow
  };

  const handleChoosePackageModalClose = () => {
    setChoosePackageModalOpen(false);
    // After RICA completes, the ChoosePackageModal will open ShippingModal
    // We don't need to do anything here as ShippingModal is handled by ChoosePackageModal
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
          selectedPackage={selectedPackage}
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
        {/* Top Section - My Sims and Transaction History (equal height within gray block) */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 items-stretch">
          {/* Left: My Sims */}
          <div className="bg-neutral-800 rounded-xl p-3 md:p-6 h-full border border-neutral-700 flex flex-col">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
              <h2 className="text-white font-medium text-xl whitespace-nowrap">My SIM</h2>
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
                  <h3 className="text-white text-lg font-semibold">No SIMs found</h3>
                  <p className="mt-1 text-sm text-neutral-400">
                    Try a different name or number in the search bar.
                  </p>
                </div>
              ) : (
                <>
                  {/* Loading message for SIM activation */}
                  {activatingSim === simCards[currentSimIndex]?.phoneNumber && (
                    <div className="p-4 rounded-xl bg-blue-900/50 border border-blue-500/50">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="inline-block size-5 border-2 border-blue-200 border-t-blue-400 rounded-full animate-spin" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white mb-1">Activating your SIM...</div>
                          <div className="text-sm text-blue-200">
                            This may take up to 30 seconds. Please don't close this window.
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

          {/* Right: Transaction History */}
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