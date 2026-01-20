import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
import type { SimCard as SimCardModel, Bundle as BundleModel, Transaction } from '../components/dashboard/dashboardTypes.ts';
import { mockSimCards, mockCurrentPlan } from '../components/dashboard/dashboardMocks.ts';
import { SimCard, PlanDetails } from '../components/dashboard/SimComponents.tsx';
import { CurrentPlan } from '../components/dashboard/CurrentPlanCard.tsx';
import { BundleCard } from '../components/dashboard/BundleCard.tsx';
import { TransactionHistory, TransactionsModal } from '../components/dashboard/TransactionsComponents.tsx';
import { SimCardSkeleton, PlanDetailsSkeleton, BundleCardSkeleton } from '../components/dashboard/SkeletonLoaders.tsx';

// Bundles are now fetched from catalog API (see useEffect below)

// Main Dashboard Component
function Dashboard() {
  const location = useLocation();
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
  const [bundles, setBundles] = useState<BundleModel[]>([]);
  const [currentPlan, setCurrentPlan] = useState<typeof mockCurrentPlan | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [canActivate, setCanActivate] = useState<Record<string, boolean>>({});
  const [activatingSim, setActivatingSim] = useState<string | null>(null);

  // New SIM subscriber creation states (for returning users buying additional SIMs)
  const [newSimCreating, setNewSimCreating] = useState(false);
  const [newSimError, setNewSimError] = useState<string | null>(null);
  const [newlyAllocatedMsisdn, setNewlyAllocatedMsisdn] = useState<string>('');

  // Refs to prevent infinite loops in useEffects
  const balancesFetchedForRef = useRef<string>(''); // Track MSISDN we've fetched balances for
  const activationCheckedForRef = useRef<string>(''); // Track MSISDNs we've checked activation for
  const subscriberCreationTriggeredRef = useRef<boolean>(false); // Prevent double subscriber creation

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
          console.log('[Dashboard] User data:', user);
          setRicaComplete(user.ricaComplete ?? false);
          
          // Update SIM cards with real MSISDNs from user account
          if (user.msisdns && user.msisdns.length > 0) {
            console.log('[Dashboard] User MSISDNs:', user.msisdns);
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
              
              // Use amountInCents from API (convert to Rands)
              const planPrice = activeMsisdn.amountInCents / 100;
              console.log('[Dashboard] Plan price from API:', planPrice, 'Rand (from', activeMsisdn.amountInCents, 'cents)');
              
              // Try to fetch product details from catalog
              try {
                const productDetails = await catalogService.getProductById(activeMsisdn.productId);
                console.log('[Dashboard] Product details from catalog:', productDetails);
                
                setCurrentPlan({
                  name: productDetails.name || 'Current Plan',
                  mobileData: productDetails.description || '10GB',
                  messaging: '10 SMS',
                  phone: '10 Min',
                  price: planPrice, // Use price from API (amountInCents / 100)
                  productId: activeMsisdn.productId,
                  hasActiveSubscription: activeMsisdn.hasActiveSubscription,
                  isAutoRenewing: activeMsisdn.isAutoRenewing,
                  subscriptionStatus: activeMsisdn.subscriptionStatus,
                  nextPaymentDate: activeMsisdn.nextPaymentDate,
                });
              } catch (err) {
                console.error('[Dashboard] Error fetching product details:', err);
                
                // Fallback to default values if catalog fetch fails
                const productNames: Record<string, string> = {
                  '40021': 'Lite Plan',
                  '40022': '300MB Plan',
                  // Add more product mappings as needed
                };
                
                setCurrentPlan({
                  name: productNames[activeMsisdn.productId] || 'Current Plan',
                  mobileData: '10GB',
                  messaging: '10 SMS',
                  phone: '10 Min',
                  price: planPrice, // Use price from API (amountInCents / 100)
                  productId: activeMsisdn.productId,
                  hasActiveSubscription: activeMsisdn.hasActiveSubscription,
                  isAutoRenewing: activeMsisdn.isAutoRenewing,
                  subscriptionStatus: activeMsisdn.subscriptionStatus,
                  nextPaymentDate: activeMsisdn.nextPaymentDate,
                });
              }
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[Dashboard] Error fetching user data:', err);
          setRicaComplete(false);
        }
      }
    };
    fetchUserData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch bundles from catalog API
  useEffect(() => {
    let cancelled = false;
    const fetchBundles = async () => {
      try {
        // Fetch data bundles from gsm_products category
        const response = await catalogService.searchCategoryProducts('data_bundles', { page: 1, limit: 3 });
        if (!cancelled && response.data) {
          console.log('[Dashboard] Fetched data bundles:', response.data);
          
          // Filter out FWA products
          const filteredProducts = response.data.filter(product => 
            !product.name?.toUpperCase().includes('FWA') && 
            !product.description?.toUpperCase().includes('FWA')
          );
          console.log(`[Dashboard] Filtered out ${response.data.length - filteredProducts.length} FWA products`);
          
          // Map catalog products to Bundle format
          const mappedBundles: BundleModel[] = filteredProducts.map((product, index) => ({
            name: product.name,
            type: index === 0 ? 'flex' : index === 1 ? 'lite' : '3-month',
            dayData: product.description || 'Data Bundle',
            featured: index === 0,
            hasImage: index === 0,
            isOnceOff: true
          }));
          
          setBundles(mappedBundles);
        }
      } catch (err) {
        console.error('[Dashboard] Error fetching bundles:', err);
        // Keep empty bundles array on error
      }
    };
    fetchBundles();
    return () => {
      cancelled = true;
    };
  }, []);

  // Create subscriber for returning users buying a new SIM
  // This allocates a NEW MSISDN without going through RICA again
  const createSubscriberForNewSim = async (retryCount = 0) => {
    if (!selectedPackageFromState?.simPackageProductId) {
      console.error('[NewSIM] No simPackageProductId in selected package');
      setNewSimError('Package configuration error. Please try again.');
      subscriberCreationTriggeredRef.current = false; // Allow retry
      return;
    }

    // Need customer address for subscriber creation - wait for it to load
    if (!customerAddress) {
      if (retryCount < 5) {
        console.log('[NewSIM] Customer address not loaded yet, waiting... (attempt', retryCount + 1, ')');
        setNewSimCreating(true); // Show loading state while waiting
        setTimeout(() => {
          createSubscriberForNewSim(retryCount + 1);
        }, 1000);
        return;
      } else {
        console.error('[NewSIM] Customer address failed to load after 5 attempts');
        setNewSimError('Failed to load account details. Please refresh and try again.');
        setNewSimCreating(false);
        subscriberCreationTriggeredRef.current = false; // Allow retry
        return;
      }
    }

    setNewSimCreating(true);
    setNewSimError(null);

    try {
      console.log('[NewSIM] Creating new subscriber for returning user');
      console.log('[NewSIM] SIM Package Product ID:', selectedPackageFromState.simPackageProductId);
      console.log('[NewSIM] SIM Status:', selectedPackageFromState.simStatus);
      console.log('[NewSIM] Customer Address:', customerAddress);

      const subscriberPayload = {
        productId: selectedPackageFromState.simPackageProductId,
        // Include ICCID only for "has-sim" flow (user already has a SIM card)
        ...(selectedPackageFromState.simStatus === 'has-sim' && selectedPackageFromState.iccid
          ? { iccid: selectedPackageFromState.iccid }
          : {}),
        eSim: false,
        address: [
          {
            referredType: 'SUBSCRIBER',
            addressType: 'INSTALLATION',
            streetNo: customerAddress.streetNo,
            streetName: customerAddress.streetName,
            suburb: customerAddress.suburb || '',
            city: customerAddress.city,
            stateOrProvince: customerAddress.stateOrProvince,
            postCode: customerAddress.postCode,
            country: customerAddress.country,
            oneLineAddress: `${customerAddress.streetNo} ${customerAddress.streetName}, ${customerAddress.city}, ${customerAddress.stateOrProvince} ${customerAddress.postCode}`
          }
        ]
      };

      console.log('[NewSIM] Subscriber payload:', subscriberPayload);

      const subscriberResponse = await subscriptionService.createSubscription(subscriberPayload);
      console.log('[NewSIM] Subscriber created successfully:', subscriberResponse);

      // Extract allocated MSISDN from response
      const msisdn = subscriberResponse?.detail?.msisdn || subscriberResponse?.detail?.msisdnDisplay;
      if (msisdn) {
        console.log('[NewSIM] Allocated MSISDN:', msisdn);
        setNewlyAllocatedMsisdn(msisdn);
        // Now open shipping modal with the NEW MSISDN
        setShippingModalOpen(true);
      } else {
        console.error('[NewSIM] No MSISDN in subscriber response');
        setNewSimError('Failed to allocate phone number. Please try again.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create subscriber';
      console.error('[NewSIM] Subscriber creation failed:', err);
      setNewSimError(errorMessage);
      subscriberCreationTriggeredRef.current = false; // Allow retry on error
    } finally {
      setNewSimCreating(false);
    }
  };

  // Auto-open correct modal based on RICA status when package is selected
  // Uses ref to prevent double-triggering subscriber creation
  useEffect(() => {
    if (selectedPackageFromState) {
      console.log('[Dashboard] Package selected:', selectedPackageFromState);
      console.log('[Dashboard] RICA complete:', ricaComplete);
      
      if (ricaComplete) {
        // Prevent double-triggering (can happen due to re-renders)
        if (subscriberCreationTriggeredRef.current) {
          console.log('[Dashboard] Subscriber creation already triggered, skipping');
          return;
        }
        
        // RICA already done - create NEW subscriber for new SIM, then go to payment
        console.log('[Dashboard] RICA complete, creating new subscriber for additional SIM');
        subscriberCreationTriggeredRef.current = true;
        createSubscriberForNewSim();
      } else {
        // RICA not done, open RICA flow first
        console.log('[Dashboard] Opening RICA modal (RICA not complete)');
        setChoosePackageModalOpen(true);
      }
    }
  }, [selectedPackageFromState, ricaComplete]);

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
          console.log('[Account] Fetched customer details:', response);
          
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

  // Fetch balances for the SIM - uses ref to prevent infinite loops
  useEffect(() => {
    let cancelled = false;
    const fetchBalances = async () => {
      // Only fetch balances if we have at least one SIM card with a phone number
      if (simCards.length === 0 || !simCards[0].phoneNumber) {
        setBalancesLoading(false);
        return;
      }
      
      const msisdnToFetch = simCards[0].phoneNumber;
      
      // Skip if we've already fetched balances for this MSISDN
      if (balancesFetchedForRef.current === msisdnToFetch) {
        setBalancesLoading(false);
        return;
      }
      
      setBalancesLoading(true);
      
      try {
        console.log('[Balance] Fetching balances for MSISDN:', msisdnToFetch);
        const response = await subscriptionService.getBalances(msisdnToFetch);
        if (!cancelled && response.balances) {
          console.log('[Balance] Fetched balances:', response);
          
          // Mark as fetched BEFORE updating state to prevent re-trigger
          balancesFetchedForRef.current = msisdnToFetch;
          
          // Update the sim card with balances
          setSimCards(prevSims => prevSims.map((sim, idx) => {
            if (idx === 0) { // Update first sim with real data
              return {
                ...sim,
                balances: response.balances,
                plan: {
                  ...sim.plan,
                  mobileData: response.balances.find(b => b.grouping === 'data')?.formattedParts?.value || sim.plan.mobileData,
                  airtime: response.balances.find(b => b.grouping === 'gpa')?.formattedParts?.value || sim.plan.airtime,
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
  }, [simCards]);

  // Check activation status for each SIM - uses ref to prevent infinite loops
  useEffect(() => {
    let cancelled = false;
    const checkActivationStatuses = async () => {
      if (simCards.length === 0) return;
      
      // Create a key from all MSISDNs to track if we've already checked
      const msisdnsKey = simCards.map(s => s.phoneNumber).filter(Boolean).sort().join(',');
      
      // Skip if we've already checked these MSISDNs
      if (activationCheckedForRef.current === msisdnsKey) {
        return;
      }
      
      const statuses: Record<string, boolean> = {};
      
      for (const sim of simCards) {
        if (!sim.phoneNumber) {
          statuses[sim.phoneNumber || sim.id] = false;
          continue;
        }
        
        try {
          const response = await subscriptionService.checkSimActive(sim.phoneNumber);
          statuses[sim.phoneNumber] = response.isActive && response.hasPendingOrders; // Show button if SIM IS active AND has pending orders
          
          console.log(`[Activation] Full response for ${sim.phoneNumber}:`, response);
          console.log(`[Activation] Checked status for ${sim.phoneNumber}:`, {
            isActive: response.isActive,
            hasPendingOrders: response.hasPendingOrders,
            canActivate: statuses[sim.phoneNumber],
            message: response.message
          });
        } catch (err) {
          if (!cancelled) {
            console.error(`[Activation] Error checking status for ${sim.phoneNumber}:`, err);
            statuses[sim.phoneNumber] = false;
          }
        }
      }
      
      if (!cancelled) {
        // Mark as checked BEFORE updating state
        activationCheckedForRef.current = msisdnsKey;
        setCanActivate(statuses);
      }
    };
    
    checkActivationStatuses();
    return () => {
      cancelled = true;
    };
  }, [simCards]);

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

  const handleVerify = (sim: SimCardModel) => {
    setModalSim(sim);
    setShippingModalOpen(true);
  };

  const handleActivate = async (sim: SimCardModel) => {
    if (!sim.phoneNumber) {
      console.error('[Activate] No phone number for SIM:', sim);
      return;
    }

    setActivatingSim(sim.phoneNumber);
    
    try {
      console.log('[Activate] Processing pending orders for SIM:', sim.phoneNumber);
      const response = await subscriptionService.processPendingOrders(sim.phoneNumber);
      
      if (response.success) {
        console.log('[Activate] Success:', response.message);
        
        // Refresh activation status to update button visibility
        const statusResponse = await subscriptionService.checkSimActive(sim.phoneNumber);
        setCanActivate(prev => ({
          ...prev,
          [sim.phoneNumber]: statusResponse.isActive && statusResponse.hasPendingOrders
        }));
        
        // TODO: Show success message to user (toast/notification)
        // TODO: Refresh transactions if needed
      } else {
        console.error('[Activate] Failed:', response.message);
        // TODO: Show error message to user
      }
    } catch (err) {
      console.error('[Activate] Error processing pending orders:', err);
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

      {/* New SIM Creation Loading/Error Modal */}
      {(newSimCreating || newSimError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white text-neutral-900 shadow-2xl p-6">
            {newSimCreating ? (
              <div className="text-center">
                <div className="inline-block size-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mb-4" />
                <h3 className="text-xl font-bold mb-2">Setting up your new SIM</h3>
                <p className="text-neutral-600">
                  Allocating your phone number. This may take up to 30 seconds...
                </p>
              </div>
            ) : newSimError ? (
              <div className="text-center">
                <div className="size-12 rounded-full bg-red-100 grid place-items-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-red-900">Unable to create SIM</h3>
                <p className="text-neutral-600 mb-4">{newSimError}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setNewSimError(null);
                      setNewlyAllocatedMsisdn('');
                      subscriberCreationTriggeredRef.current = false; // Allow fresh attempt later
                    }}
                    className="px-4 py-2 rounded-xl bg-neutral-200 text-neutral-900 font-semibold hover:bg-neutral-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setNewSimError(null);
                      subscriberCreationTriggeredRef.current = false; // Allow retry
                      createSubscriberForNewSim();
                    }}
                    className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

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
            // Reset new SIM states when closing
            setNewlyAllocatedMsisdn('');
            setNewSimError(null);
            subscriberCreationTriggeredRef.current = false; // Allow fresh attempt later
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
          // Use newly allocated MSISDN for additional SIMs, fallback to first existing SIM
          allocatedMsisdn={newlyAllocatedMsisdn || simCards[0]?.phoneNumber || ''}
        />
      )}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Top Section - My Sims and Transaction History (equal height within gray block) */}
        <section className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left: My Sims */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">My Sims</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevSim}
                  className="p-1 text-neutral-400 hover:text-white transition-colors"
                  disabled={currentSimIndex === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-neutral-400 text-sm">
                  {currentSimIndex + 1} of {simCards.length}
                </span>
                <button
                  onClick={nextSim}
                  className="p-1 text-neutral-400 hover:text-white transition-colors"
                  disabled={currentSimIndex === simCards.length - 1}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {balancesLoading ? (
              <>
                <SimCardSkeleton />
                <PlanDetailsSkeleton />
              </>
            ) : (
              <>
                {/* Loading message for SIM activation */}
                {activatingSim === simCards[currentSimIndex]?.phoneNumber && (
                  <div className="mb-4 p-4 rounded-xl bg-blue-900/50 border border-blue-500/50">
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
                  onVerify={handleVerify}
                  onActivate={handleActivate}
                  canActivate={canActivate[simCards[currentSimIndex]?.phoneNumber || simCards[currentSimIndex]?.id] || false}
                  isActivating={activatingSim === simCards[currentSimIndex]?.phoneNumber}
                />
                <PlanDetails sim={simCards[currentSimIndex]} />
              </>
            )}
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

      {/* Bottom Section - two equal sections */}
      <section className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="flex flex-col">
              {currentPlan ? (
                <CurrentPlan plan={currentPlan} className="flex-1" />
              ) : (
                <div className="bg-neutral-800 rounded-2xl p-6 h-full border border-neutral-700">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-neutral-700 rounded w-1/3"></div>
                    <div className="h-8 bg-neutral-700 rounded w-1/2"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-neutral-700 rounded-2xl"></div>
                      <div className="h-24 bg-neutral-700 rounded-2xl"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* <div className="flex flex-col">
              <Wallet className="flex-1" />
            </div> */}
            <div className="flex flex-col">
              <div className="grid grid-cols-1 gap-4 flex-1">
                {bundles.length > 0 ? (
                  <>
                    <BundleCard bundle={bundles[0]} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bundles[1] && <BundleCard bundle={bundles[1]} />}
                      {bundles[2] && <BundleCard bundle={bundles[2]} />}
                    </div>
                  </>
                ) : (
                  <>
                    <BundleCardSkeleton />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <BundleCardSkeleton />
                      <BundleCardSkeleton />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <TransactionsModal
        open={transactionsModalOpen}
        onClose={() => setTransactionsModalOpen(false)}
        transactions={transactions}
      />
    </div>
  );
}

export default Dashboard;