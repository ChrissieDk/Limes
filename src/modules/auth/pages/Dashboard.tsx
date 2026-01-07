import { useEffect, useState } from 'react';
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
          
          // Map catalog products to Bundle format
          const mappedBundles: BundleModel[] = response.data.map((product, index) => ({
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

  // Auto-open correct modal based on RICA status when package is selected
  useEffect(() => {
    if (selectedPackageFromState) {
      console.log('[Dashboard] Package selected:', selectedPackageFromState);
      console.log('[Dashboard] RICA complete:', ricaComplete);
      
      if (ricaComplete) {
        // RICA already done, go straight to payment
        console.log('[Dashboard] Opening shipping modal (RICA already complete)');
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

  // Fetch balances for the SIM
  useEffect(() => {
    let cancelled = false;
    const fetchBalances = async () => {
      // Only fetch balances if we have at least one SIM card with a phone number
      if (simCards.length === 0 || !simCards[0].phoneNumber) {
        setBalancesLoading(false);
        return;
      }
      
      setBalancesLoading(true);
      const msisdnToFetch = simCards[0].phoneNumber;
      
      try {
        console.log('[Balance] Fetching balances for MSISDN:', msisdnToFetch);
        const response = await subscriptionService.getBalances(msisdnToFetch);
        if (!cancelled && response.balances) {
          console.log('[Balance] Fetched balances:', response);
          
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
          onClose={() => setShippingModalOpen(false)}
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
          allocatedMsisdn={simCards[0]?.phoneNumber || ''}  // Use the actual SIM phone number
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
                <SimCard 
                  sim={simCards[currentSimIndex]} 
                  onTopUp={(sim) => { setModalSim(sim); setModalOpen(true); }}
                  onVerify={handleVerify}
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