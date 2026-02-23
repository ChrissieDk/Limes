import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopUpModal from '../components/TopUpModal';
import ShippingModal from '../components/ShippingModal';
import ChoosePackageModal from '../components/ChoosePackageModal';
import DashboardNavbar from '../components/DashboardNavbar';
import { catalogService } from '../../catalog/services/catalogService';
import { subscriptionService } from '../../subscription/services/subscriptionService';
import { crmService } from '../../crm/services/crmService';
import { userService } from '../services/userService';
import { paymentService } from '../../payment/services/paymentService';
import type { RicaAddress } from '../../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SimCard as SimCardModel, Transaction } from '../components/dashboard/dashboardTypes.ts';
import { mockSimCards } from '../components/dashboard/dashboardMocks.ts';
import { SimCard, PlanDetails } from '../components/dashboard/SimComponents.tsx';
import { TransactionHistory, TransactionsModal } from '../components/dashboard/TransactionsComponents.tsx';
import { SimCardSkeleton, PlanDetailsSkeleton } from '../components/dashboard/SkeletonLoaders.tsx';
import Footer from '../components/Footer';

// Bundles are now fetched from catalog API (see useEffect below)

// Main Dashboard Component
function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentSimIndex, setCurrentSimIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSim, setModalSim] = useState<SimCardModel | null>(null);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [choosePackageModalOpen, setChoosePackageModalOpen] = useState(false);
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
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

  // Refs to prevent infinite loops in useEffects
  const balancesFetchedForRef = useRef<string>(''); // Track MSISDN we've fetched balances for
  const activationCheckedForRef = useRef<string>(''); // Track MSISDNs we've checked activation for
  const packageSelectionHandledRef = useRef<boolean>(false); // Track if we've handled package selection
  const activationPollInFlightRef = useRef<boolean>(false); // Prevent overlapping activation polls

  // Refresh dashboard data after successful payment
  // This function resets all data-fetching refs to trigger fresh API calls
  const refreshDashboardData = () => {
    
    // Reset refs to allow data to be re-fetched
    balancesFetchedForRef.current = ''
    activationCheckedForRef.current = ''
    
    // Force re-fetch by updating state (triggers dependent useEffects)
    // We do this by fetching user data again, which will update simCards and trigger cascading refreshes
    const fetchUserData = async () => {
      try {
        const user = await userService.getCurrentUser()
        
        // Update SIM cards with potentially new MSISDNs
        if (user.msisdns && user.msisdns.length > 0) {
          const updatedSimCards = user.msisdns.map((msisdnData, index: number) => ({
            id: String(index + 1),
            name: `Sim ${index + 1}`,
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
        
        // Re-fetch transactions
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
          
          // Update SIM cards with real MSISDNs from user account
          if (user.msisdns && user.msisdns.length > 0) {
            const updatedSimCards = user.msisdns.map((msisdnData, index: number) => ({
              id: String(index + 1),
              name: `Sim ${index + 1}`,
              phoneNumber: msisdnData.msisdn,
              isActive: msisdnData.hasActiveSubscription,
              hasVoiceTopUp: false,
              plan: {
                mobileData: '0GB',
                airtime: 'R0',
                messaging: '0SMS',
                phone: '0 Min'
              }
            }));
            setSimCards(updatedSimCards);
            
            // Extract subscription data from the first active MSISDN
            const activeMsisdn = user.msisdns.find((m) => m.hasActiveSubscription);
            if (activeMsisdn) {
              console.log('[Dashboard] Active subscription found:', activeMsisdn);
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[Dashboard] Error fetching user data:', err);
          setRicaComplete(false);
        }
      } finally {
        if (!cancelled) {
          // Mark RICA status as checked (whether successful or not)
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
      // Only fetch balances if we have a SIM card at the current index with a phone number
      if (simCards.length === 0 || !simCards[currentSimIndex]?.phoneNumber) {
        setBalancesLoading(false);
        return;
      }
      
      const msisdnToFetch = simCards[currentSimIndex].phoneNumber;
      
      // Skip if we've already fetched balances for this MSISDN
      if (balancesFetchedForRef.current === msisdnToFetch) {
        setBalancesLoading(false);
        return;
      }
      
      setBalancesLoading(true);
      
      try {
        const response = await subscriptionService.getBalances(msisdnToFetch);
        if (!cancelled && response.balances) {
          
          // Mark as fetched BEFORE updating state to prevent re-trigger
          balancesFetchedForRef.current = msisdnToFetch;
          
          // Update the currently selected sim card with balances
          setSimCards(prevSims => prevSims.map((sim, idx) => {
            if (idx === currentSimIndex) { // Update currently selected sim with real data
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
      
      // Create a key from all MSISDNs to track if we've already checked
      const msisdnsKey = simCards.map(s => s.phoneNumber).filter(Boolean).sort().join(',');
      
      // Skip if we've already checked these MSISDNs
      if (activationCheckedForRef.current === msisdnsKey) {
        setActivationStatusLoading(false);
        return;
      }
      
      // Start loading
      setActivationStatusLoading(true);
      
      const canActivateStatuses: Record<string, boolean> = {};
      const isActiveStatuses: Record<string, boolean> = {};
      
      // Check all SIMs in parallel for better performance
      const checkPromises = simCards.map(async (sim) => {
        if (!sim.phoneNumber) {
          return {
            phoneNumber: sim.phoneNumber || sim.id,
            canActivate: false,
            isActive: false
          };
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
          return {
            phoneNumber: sim.phoneNumber,
            canActivate: false,
            isActive: false
          };
        }
      });
      
      // Wait for all checks to complete in parallel
      const results = await Promise.all(checkPromises);
      
      // Build status objects from results
      results.forEach(result => {
        canActivateStatuses[result.phoneNumber] = result.canActivate;
        isActiveStatuses[result.phoneNumber] = result.isActive;
      });
      
      if (!cancelled) {
        // Mark as checked BEFORE updating state
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
      } catch (err) {
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

  // TEMP: Log catalog endpoints to verify connectivity
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const tree = await catalogService.getCategoryTree({ groupCode: 123, groupOnly: true });
        if (!cancelled) console.log('[Catalog] getCategoryTree', tree);
      } catch (err) {
        if (!cancelled) console.error('[Catalog] getCategoryTree error', err);
      }

      try {
        const byId = await catalogService.getCategoryById('data_bundles');
        if (!cancelled) console.log('[Catalog] getCategoryById(data_bundles)', byId);
      } catch (err) {
        if (!cancelled) console.error('[Catalog] getCategoryById error', err);
      }

      try {
        const search = await catalogService.searchCategoryProducts('website', { page: 1, limit: 20 });
        if (!cancelled) console.log('[Catalog] searchCategoryProducts(website)', search);
      } catch (err) {
        if (!cancelled) console.error('[Catalog] searchCategoryProducts error', err);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const nextSim = () => {
    setCurrentSimIndex((prev) => (prev + 1) % simCards.length);
  };
  const prevSim = () => {
    setCurrentSimIndex((prev) => (prev - 1 + simCards.length) % simCards.length);
  };

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
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-white font-semibold text-2xl">My SIM</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevSim}
                  className="p-1 text-neutral-400 hover:text-white transition-colors"
                  disabled={currentSimIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-neutral-400 text-sm font-medium">
                  {currentSimIndex + 1} of {simCards.length}
                </span>
                <button
                  onClick={nextSim}
                  className="p-1 text-neutral-400 hover:text-white transition-colors"
                  disabled={currentSimIndex === simCards.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3">
              {balancesLoading ? (
                <>
                  <SimCardSkeleton />
                  <PlanDetailsSkeleton />
                </>
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
                    canActivate={canActivate[simCards[currentSimIndex]?.phoneNumber || simCards[currentSimIndex]?.id] || false}
                    isActivating={activatingSim === simCards[currentSimIndex]?.phoneNumber}
                    isActive={simIsActive[simCards[currentSimIndex]?.phoneNumber || simCards[currentSimIndex]?.id]}
                    activationStatusLoading={activationStatusLoading}
                  />
                  <PlanDetails sim={simCards[currentSimIndex]} />
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

      {/* Bottom Section - Packages Grid (left) and Top Deals (right) */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        {/* Left: Packages Grid (70-75% width) */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-1.5">
            {/* Limes99 */}
            <div className="md:col-span-3 rounded-[20px] border-2 border-black/70 shadow-[3px_3px_0_0_rgba(0,0,0,0.7)] bg-yellow-300 p-4 flex flex-col min-h-[140px]">
              <div className="font-grotesque font-bold text-[22px] leading-[1.0] tracking-tight text-neutral-900">
                Limes99
              </div>
              <ul className="mt-2 space-y-1.5 text-[13px] leading-snug font-manrope text-neutral-900">
                <li className="flex items-start gap-2">
                  <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="" className="h-3.5 w-4 mt-[2px] object-contain" />
                  <span>R99 airtime + R31 FREE</span>
                </li>
                <li className="flex items-start gap-2">
                  <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="" className="h-3.5 w-4 mt-[2px] object-contain" />
                  <span>Unlimited WhatsApp text</span>
                </li>
              </ul>
              <div className="mt-auto pt-3">
                <button
                  onClick={() => navigate('/dashboard/packages')}
                  className="inline-flex items-center justify-center h-8 px-3.5 rounded-xl bg-white text-neutral-900 text-xs font-semibold border border-black/60"
                >
                  Buy now
                </button>
              </div>
            </div>

            {/* Limes29 */}
            <div className="md:col-span-3 rounded-[20px] border-2 border-black/70 shadow-[3px_3px_0_0_rgba(0,0,0,0.7)] bg-[#5BA0FF] p-4 flex flex-col min-h-[140px]">
              <div className="font-grotesque font-bold text-[22px] leading-[1.0] tracking-tight text-neutral-900">
                Limes29
              </div>
              <ul className="mt-2 space-y-1.5 text-[13px] leading-snug font-manrope text-neutral-900">
                <li className="flex items-start gap-2">
                  <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="" className="h-3.5 w-4 mt-[2px] object-contain" />
                  <span>R29 airtime + R6 FREE</span>
                </li>
              </ul>
              <div className="mt-auto pt-3">
                <button
                  onClick={() => navigate('/dashboard/packages')}
                  className="inline-flex items-center justify-center h-8 px-3.5 rounded-xl bg-white text-neutral-900 text-xs font-semibold border border-black/60"
                >
                  Buy now
                </button>
              </div>
            </div>

            {/* Limes69 */}
            <div className="md:col-span-2 rounded-[20px] border-2 border-black/70 shadow-[3px_3px_0_0_rgba(0,0,0,0.7)] bg-[#CDA7FC] p-4 flex flex-col min-h-[130px]">
              <div className="font-grotesque font-bold text-[22px] leading-[1.0] tracking-tight text-neutral-900">
                Limes69
              </div>
              <ul className="mt-2 space-y-1.5 text-[13px] leading-snug font-manrope text-neutral-900">
                <li className="flex items-start gap-2">
                  <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="" className="h-3.5 w-4 mt-[2px] object-contain" />
                  <span>R69 airtime + R21 FREE</span>
                </li>
                <li className="flex items-start gap-2">
                  <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="" className="h-3.5 w-4 mt-[2px] object-contain" />
                  <span>Unlimited WhatsApp text</span>
                </li>
              </ul>
              <div className="mt-auto pt-3">
                <button
                  onClick={() => navigate('/dashboard/packages')}
                  className="inline-flex items-center justify-center h-8 px-3.5 rounded-xl bg-white text-neutral-900 text-xs font-semibold border border-black/60"
                >
                  Buy now
                </button>
              </div>
            </div>

            {/* Limes169 */}
            <div className="md:col-span-2 rounded-[20px] border-2 border-black/70 shadow-[3px_3px_0_0_rgba(0,0,0,0.7)] bg-pink-300 p-4 flex flex-col min-h-[130px]">
              <div className="font-grotesque font-bold text-[22px] leading-[1.0] tracking-tight text-neutral-900">
                Limes169
              </div>
              <ul className="mt-2 space-y-1.5 text-[13px] leading-snug font-manrope text-neutral-900">
                <li className="flex items-start gap-2">
                  <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="" className="h-3.5 w-4 mt-[2px] object-contain" />
                  <span>R169 airtime + R31 FREE</span>
                </li>
                <li className="flex items-start gap-2">
                  <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="" className="h-3.5 w-4 mt-[2px] object-contain" />
                  <span>Unlimited WhatsApp text</span>
                </li>
              </ul>
              <div className="mt-auto pt-3">
                <button
                  onClick={() => navigate('/dashboard/packages')}
                  className="inline-flex items-center justify-center h-8 px-3.5 rounded-xl bg-white text-neutral-900 text-xs font-semibold border border-black/60"
                >
                  Buy now
                </button>
              </div>
            </div>

            {/* Limes199 */}
            <div className="md:col-span-2 rounded-[20px] border-2 border-black/70 shadow-[3px_3px_0_0_rgba(0,0,0,0.7)] bg-lime-300 p-4 flex flex-col min-h-[130px]">
              <div className="font-grotesque font-bold text-[22px] leading-[1.0] tracking-tight text-neutral-900">
                Limes199
              </div>
              <ul className="mt-2 space-y-1.5 text-[13px] leading-snug font-manrope text-neutral-900">
                <li className="flex items-start gap-2">
                  <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="" className="h-3.5 w-4 mt-[2px] object-contain" />
                  <span>R199 airtime + R31 FREE</span>
                </li>
                <li className="flex items-start gap-2">
                  <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="" className="h-3.5 w-4 mt-[2px] object-contain" />
                  <span>Unlimited WhatsApp text</span>
                </li>
              </ul>
              <div className="mt-auto pt-3">
                <button
                  onClick={() => navigate('/dashboard/packages')}
                  className="inline-flex items-center justify-center h-8 px-3.5 rounded-xl bg-white text-neutral-900 text-xs font-semibold border border-black/60"
                >
                  Buy now
                </button>
              </div>
            </div>

            {/* Limes Unlimited */}
            <div className="md:col-span-3 rounded-[20px] border-2 border-black/70 shadow-[3px_3px_0_0_rgba(0,0,0,0.7)] bg-white p-4 flex flex-col min-h-[140px]">
              <div className="font-grotesque font-bold text-[22px] leading-[1.0] tracking-tight text-neutral-900">
                Limes Unlimited
              </div>
              <ul className="mt-2 space-y-1.5 text-[13px] leading-snug font-manrope text-neutral-900">
                <li className="flex items-start gap-2">
                  <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="" className="h-3.5 w-4 mt-[2px] object-contain" />
                  <span>Unlimited voice minutes + 10GB data</span>
                </li>
                <li className="flex items-start gap-2">
                  <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="" className="h-3.5 w-4 mt-[2px] object-contain" />
                  <span>10GB data</span>
                </li>
                <li className="flex items-start gap-2">
                  <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="" className="h-3.5 w-4 mt-[2px] object-contain" />
                  <span>Unlimited WhatsApp text</span>
                </li>
              </ul>
              <div className="mt-auto pt-3">
                <button
                  onClick={() => navigate('/dashboard/packages')}
                  className="inline-flex items-center justify-center h-8 px-3.5 rounded-xl bg-white text-neutral-900 text-xs font-semibold border border-black/60"
                >
                  Buy now
                </button>
              </div>
            </div>

            {/* LimesOne */}
            <div className="md:col-span-3 rounded-[20px] border-2 border-black/70 shadow-[3px_3px_0_0_rgba(0,0,0,0.7)] bg-white p-4 flex flex-col min-h-[140px]">
              <div className="font-grotesque font-bold text-[22px] leading-[1.0] tracking-tight text-neutral-900">
                LimesOne
              </div>
              <ul className="mt-2 space-y-1.5 text-[13px] leading-snug font-manrope text-neutral-900">
                <li className="flex items-start gap-2">
                  <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="" className="h-3.5 w-4 mt-[2px] object-contain" />
                  <span>1GB data</span>
                </li>
                <li className="flex items-start gap-2">
                  <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="" className="h-3.5 w-4 mt-[2px] object-contain" />
                  <span>1GB WhatsApp data</span>
                </li>
                <li className="flex items-start gap-2">
                  <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="" className="h-3.5 w-4 mt-[2px] object-contain" />
                  <span>R100 Airtime</span>
                </li>
              </ul>
              <div className="mt-auto pt-3">
                <button
                  onClick={() => navigate('/dashboard/packages')}
                  className="inline-flex items-center justify-center h-8 px-3.5 rounded-xl bg-white text-neutral-900 text-xs font-semibold border border-black/60"
                >
                  Buy now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Our Top Deals */}
        <div className="lg:w-[280px] rounded-[28px] bg-neutral-800 p-5 flex flex-col">
          <h3 className="text-white font-grotesque font-bold text-3xl mb-6">Our top deals</h3>
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={`${import.meta.env.BASE_URL}images/plan_pink.png`} alt="" className="w-5 h-5 object-contain" />
                <span className="text-white text-sm">1GB for R48</span>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-white text-neutral-900 text-xs font-semibold hover:bg-neutral-100 transition-colors">
                Buy now
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={`${import.meta.env.BASE_URL}images/plan_pink.png`} alt="" className="w-5 h-5 object-contain" />
                <span className="text-white text-sm">500MB for R25</span>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-white text-neutral-900 text-xs font-semibold hover:bg-neutral-100 transition-colors">
                Buy now
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={`${import.meta.env.BASE_URL}images/plan_pink.png`} alt="" className="w-5 h-5 object-contain" />
                <span className="text-white text-sm">3GB for R149</span>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-white text-neutral-900 text-xs font-semibold hover:bg-neutral-100 transition-colors">
                Buy now
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={`${import.meta.env.BASE_URL}images/plan_pink.png`} alt="" className="w-5 h-5 object-contain" />
                <span className="text-white text-sm">5GB for R189</span>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-white text-neutral-900 text-xs font-semibold hover:bg-neutral-100 transition-colors">
                Buy now
              </button>
            </div>
          </div>

          <button className="mt-6 self-start inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-[#ABFF63] text-neutral-900 text-sm font-semibold hover:brightness-95 transition-all">
            Buy
            <span className="text-base">→</span>
          </button>

          <div className="mt-auto pt-6 flex justify-center">
            <img src={`${import.meta.env.BASE_URL}images/lime_green.png`} alt="Lime" className="w-40 h-40 object-contain" />
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