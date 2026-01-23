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
import { ChevronLeft, ChevronRight, Sparkles, Plus } from 'lucide-react';
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
  const [bundles, setBundles] = useState<BundleModel[]>([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<typeof mockCurrentPlan | null>(null);
  const [currentPlanChecked, setCurrentPlanChecked] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [canActivate, setCanActivate] = useState<Record<string, boolean>>({});
  const [activatingSim, setActivatingSim] = useState<string | null>(null);

  // Refs to prevent infinite loops in useEffects
  const balancesFetchedForRef = useRef<string>(''); // Track MSISDN we've fetched balances for
  const activationCheckedForRef = useRef<string>(''); // Track MSISDNs we've checked activation for

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
      } finally {
        // UI-only: marks the "current plan" check as complete so we can show an empty state.
        // Always set this, even if cancelled, since it's just a UI flag
        console.log('[Dashboard] Current plan check completed');
        setCurrentPlanChecked(true);
      }
    };
    fetchUserData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch bundles from catalog API (using TopUpModal's exact approach)
  useEffect(() => {
    let cancelled = false;
    const fetchBundles = async () => {
      setBundlesLoading(true);
      try {
        console.log('[Dashboard] Fetching category tree...');
        const tree = await catalogService.getCategoryTree({ groupCode: 123, groupOnly: true });
        
        if (cancelled) return;
        
        console.log('[Dashboard] Category tree:', tree);
        
        // Navigate: channel → once_off_top_up → data_bundles
        const channel = tree.find((node) => node.id === 'channel');
        if (!channel?.children) {
          console.error('[Dashboard] No channel found');
          return;
        }
        
        const onceOffTopUp = channel.children.find((node) => node.id === 'once_off_top_up');
        if (!onceOffTopUp?.children) {
          console.error('[Dashboard] No once_off_top_up found');
          return;
        }
        
        console.log('[Dashboard] Available categories:', onceOffTopUp.children.map(c => c.id));
        
        // Try to find data bundles category
        const dataBundlesCategory = onceOffTopUp.children.find((node) => 
          node.id === 'data_bundles' || node.id?.includes('data')
        );
        
        if (!dataBundlesCategory) {
          console.error('[Dashboard] No data bundles category found');
          console.log('[Dashboard] Available categories:', onceOffTopUp.children);
          return;
        }
        
        console.log('[Dashboard] Using category:', dataBundlesCategory.id);
        
        // Fetch products from the found category
        const response = await catalogService.searchCategoryProducts(dataBundlesCategory.id, { 
          page: 1, 
          limit: 100 
        });
        
        if (!cancelled) {
          console.log('[Dashboard] Bundle response:', response);
          
          if (response.data && response.data.length > 0) {
            // Filter out FWA products
            const filteredProducts = response.data.filter(product => 
              !product.name?.toUpperCase().includes('FWA') && 
              !product.description?.toUpperCase().includes('FWA')
            );
            
            console.log(`[Dashboard] Filtered ${filteredProducts.length} bundles`);
            
            // Take first 3 and map to Bundle format for display
            const mappedBundles: BundleModel[] = filteredProducts
              .slice(0, 3)
              .map((product, index) => ({
                name: product.name,
                type: index === 0 ? 'flex' : index === 1 ? 'lite' : '3-month',
                dayData: product.description || product.name,
                featured: index === 0,
                hasImage: index === 0,
                isOnceOff: true
              }));
            
            console.log('[Dashboard] Mapped bundles:', mappedBundles);
            setBundles(mappedBundles);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[Dashboard] Error fetching bundles:', err);
        }
      } finally {
        if (!cancelled) {
          setBundlesLoading(false);
        }
      }
    };
    fetchBundles();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-open correct modal based on RICA status when package is selected
  useEffect(() => {
    if (selectedPackageFromState) {
      console.log('[Dashboard] Package selected:', selectedPackageFromState);
      console.log('[Dashboard] RICA complete:', ricaComplete);
      
      if (ricaComplete) {
        // RICA already done - go straight to payment
        // Subscriber will be created AFTER payment using CRM address
        console.log('[Dashboard] RICA complete, opening shipping modal for returning user');
        setShippingModalOpen(true);
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
        console.log('[Balance] Fetching balances for MSISDN:', msisdnToFetch, '(SIM', currentSimIndex + 1, ')');
        const response = await subscriptionService.getBalances(msisdnToFetch);
        if (!cancelled && response.balances) {
          console.log('[Balance] Fetched balances for SIM', currentSimIndex + 1, ':', response);
          
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
  }, [simCards, currentSimIndex]);

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
          // Show button if SIM IS active AND has pending orders OR pending dynamic services
          statuses[sim.phoneNumber] = response.isActive && (response.hasPendingOrders || response.hasPendingDynamicServices || false);
          
          console.log(`[Activation] Full response for ${sim.phoneNumber}:`, response);
          console.log(`[Activation] Checked status for ${sim.phoneNumber}:`, {
            isActive: response.isActive,
            hasPendingOrders: response.hasPendingOrders,
            hasPendingDynamicServices: response.hasPendingDynamicServices,
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

  const handleActivate = async (sim: SimCardModel) => {
    if (!sim.phoneNumber) {
      console.error('[Activate] No phone number for SIM:', sim);
      return;
    }

    setActivatingSim(sim.phoneNumber);
    
    try {
      console.log('[Activate] Processing pending orders and services for SIM:', sim.phoneNumber);
      
      // Process pending orders
      console.log('[Activate] Step 1: Processing pending orders...');
      const ordersResponse = await subscriptionService.processPendingOrders(sim.phoneNumber);
      console.log('[Activate] Orders response:', ordersResponse);
      
      // Process pending dynamic services
      console.log('[Activate] Step 2: Processing pending dynamic services...');
      const servicesResponse = await subscriptionService.processPendingDynamicServices(sim.phoneNumber);
      console.log('[Activate] Services response:', servicesResponse);
      
      if (ordersResponse.success || servicesResponse.success) {
        console.log('[Activate] ✓ Successfully processed pending items');
        console.log('[Activate] Orders:', ordersResponse.message);
        console.log('[Activate] Services:', servicesResponse.message);
        
        // Refresh activation status to update button visibility
        const statusResponse = await subscriptionService.checkSimActive(sim.phoneNumber);
        setCanActivate(prev => ({
          ...prev,
          [sim.phoneNumber]: statusResponse.isActive && (statusResponse.hasPendingOrders || statusResponse.hasPendingDynamicServices || false)
        }));
        
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
              ) : !currentPlanChecked ? (
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
              ) : (
                <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl p-8 h-full border border-lime-500/20 relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-lime-400/5 rounded-full blur-2xl"></div>
                  <div className="absolute -left-4 -top-4 w-24 h-24 bg-lime-400/5 rounded-full blur-2xl"></div>
                  
                  <div className="relative space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-lime-400/10 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-lime-400" />
                        </div>
                        <div className="text-white font-bold text-xl">Current Plan</div>
                      </div>
                      <div className="text-neutral-400 text-sm">
                        No active plans yet.
                      </div>
                    </div>
                    
                    {/* Lime emoji/text */}
                    <div className="flex items-center gap-2 text-lime-400">
                      
                      <span className="font-medium text-base">Ready to add some zest?</span>
                      <span className="text-2xl">🍋</span>
                    </div>
                    
                    {/* CTA Button */}
                    <button
                      onClick={() => navigate('/dashboard/packages')}
                      className="w-full bg-lime-400 hover:bg-lime-300 text-neutral-900 font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg shadow-lime-400/20 hover:shadow-lime-400/30"
                    >
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                      Choose a Package
                    </button>
                    
                    <div className="text-neutral-500 text-xs text-center">
                      Start your journey with a plan that suits you best
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
                {bundlesLoading ? (
                  <>
                    <BundleCardSkeleton />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <BundleCardSkeleton />
                      <BundleCardSkeleton />
                    </div>
                  </>
                ) : bundles.length > 0 ? (
                  <>
                    {bundles[0] && <BundleCard bundle={bundles[0]} />}
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