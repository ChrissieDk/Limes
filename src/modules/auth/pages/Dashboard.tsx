import { useEffect, useState } from 'react';
import TopUpModal from '../components/TopUpModal';
import ShippingModal from '../components/ShippingModal';
import DashboardNavbar from '../components/DashboardNavbar';
import { catalogService } from '../../catalog/services/catalogService';
import { subscriptionService } from '../../subscription/services/subscriptionService';
import type { Balance } from '../../../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  ExternalLink, 
  Phone,
  Star,
} from 'lucide-react';

// Types
interface SimCard {
  id: string;
  name: string;
  phoneNumber: string;
  isActive: boolean;
  hasVoiceTopUp: boolean;
  plan: {
    mobileData: string;
    airtime: string;
    messaging: string;
    phone: string;
  };
  balances?: Balance[];
}

interface Transaction {
  id: string;
  type: string;
  status: 'Success' | 'In Progress' | 'Failed';
  date: string;
  amount: number;
}

interface Plan {
  name: string;
  mobileData: string;
  messaging: string;
  phone: string;
  price: number;
}

interface Bundle {
  name: string;
  type: 'flex' | 'lite' | '3-month';
  dayData: string;
  nightData?: string;
  cashback?: string;
  isOnceOff?: boolean;
  featured?: boolean;
  hasImage?: boolean;
}

// Mock Data
const mockSimCards: SimCard[] = [
  {
    id: '1',
    name: 'Sim 1',
    phoneNumber: '27644038847', // Real MSISDN
    isActive: true,
    hasVoiceTopUp: true,
    plan: {
      mobileData: '0GB',
      airtime: 'R0',
      messaging: '0SMS',
      phone: '0 Min'
    }
  },
];

const mockTransactions: Transaction[] = [
  { id: '1', type: 'Wallet Top-Up', status: 'Success', date: '8/2/2025', amount: 102.45 },
  { id: '2', type: 'Wallet Top-Up', status: 'In Progress', date: '8/2/2025', amount: 102.45 },
  { id: '3', type: 'Send Airtime', status: 'Success', date: '8/2/2025', amount: -102.45 },
  { id: '4', type: 'Wallet Top-Up', status: 'In Progress', date: '8/2/2025', amount: 102.45 },
  { id: '5', type: 'Send Airtime', status: 'Failed', date: '8/2/2025', amount: -102.45 }
];

const mockCurrentPlan: Plan = {
  name: 'Lite Plan',
  mobileData: '10GB',
  messaging: '10 SMS',
  phone: '10 Min',
  price: 199.99
};

const mockBundles: Bundle[] = [
  {
    name: '1-month flex',
    type: 'flex',
    dayData: '10 GB day data + 10 GB night data (once-off)',
    cashback: 'R20 cashback into your Limes wallet',
    isOnceOff: true,
    featured: true,
    hasImage: true
  },
  {
    name: 'Lite Plan',
    type: 'lite',
    dayData: '10 GB day data + 10 GB',
    nightData: 'night data (once-off)'
  },
  {
    name: '3-month',
    type: '3-month',
    dayData: '10 GB day data + 10 GB',
    nightData: 'night data (once-off)'
  }
];

// Status Badge Component
function StatusBadge({ status }: { status: Transaction['status'] }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'Success':
        return 'text-green-400 bg-green-400/10';
      case 'In Progress':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'Failed':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusDotClass = () => {
    switch (status) {
      case 'Success':
        return 'bg-green-400';
      case 'In Progress':
        return 'bg-yellow-400';
      case 'Failed':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotClass()}`} />
      <span>{status}</span>
    </div>
  );
}

// SIM Card Component
function SimCard({ sim, onTopUp, onVerify }: { sim: SimCard; onTopUp: (sim: SimCard) => void; onVerify: (sim: SimCard) => void }) {
  return (
    <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-8 rounded overflow-hidden border border-neutral-600">
            <img src={`${import.meta.env.BASE_URL}images/limes_sim.png`} alt="Limes SIM" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-white font-semibold text-base">{sim.name}</h3>
              {sim.isActive && (
                <span className="bg-green-400 text-gray-900 text-xs px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              )}
            </div>
            <p className="text-neutral-500 text-xs mb-1">Phone Number</p>
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">{sim.phoneNumber}</span>
              {sim.hasVoiceTopUp && (
                <span className="text-yellow-400 text-xs flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Voice Top Up
                </span>
              )}
            </div>
          </div>
        </div>
        <button className="text-neutral-400 hover:text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex space-x-2">
        <button onClick={() => onTopUp(sim)} className="flex-1 bg-green-400 text-gray-900 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-300 transition-colors">
          Top Up +
        </button>
        <button onClick={() => onVerify(sim)} className="px-4 py-2 border border-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
          Verify
        </button>
      </div>
    </div>
  );
}

// Plan Details Component (stacked)
function PlanDetails({ sim }: { sim: SimCard }) {
  // Get balances from sim.balances or use defaults
  const getBalanceValue = (grouping: string) => {
    if (!sim.balances) return null
    const balance = sim.balances.find(b => b.grouping === grouping)
    return balance?.formattedParts?.value || null
  }

  const mobileData = getBalanceValue('data') || sim.plan.mobileData
  const airtime = getBalanceValue('gpa') || sim.plan.airtime
  const messaging = sim.plan.messaging // No specific balance for messaging in API
  const phone = sim.plan.phone // No specific balance for phone minutes in API

  return (
    <div className="bg-white rounded-2xl p-5">
      <h4 className="text-neutral-900 font-extrabold text-2xl mb-4">Sim Details</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-lime-400 rounded-2xl p-4">
          <div className="text-neutral-900 text-sm font-medium mb-1">Mobile data</div>
          <div className="text-neutral-900 font-semibold text-xl leading-none">{mobileData}</div>
        </div>
        <div className="bg-purple-400 rounded-2xl p-4">
          <div className="text-neutral-900 text-sm font-medium mb-1">Airtime</div>
          <div className="text-neutral-900 font-semibold text-xl leading-none">{airtime}</div>
        </div>
        <div className="bg-blue-500 rounded-2xl p-4">
          <div className="text-neutral-900 text-sm font-medium mb-1">Messaging</div>
          <div className="text-neutral-900 font-semibold text-xl leading-none">{messaging}</div>
        </div>
        <div className="bg-pink-400 rounded-2xl p-4">
          <div className="text-neutral-900 text-sm font-medium mb-1">Phone</div>
          <div className="text-neutral-900 font-semibold text-xl leading-none">{phone}</div>
        </div>
      </div>
    </div>
  );
}

// SimRow removed; using stacked SimCard + PlanDetails

// Current Plan Component
function CurrentPlan({ plan, className }: { plan: Plan; className?: string }) {
  return (
    <div className={`bg-neutral-800 rounded-2xl p-6 h-full border border-neutral-700 ${className ?? ''}`}> 
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-white font-semibold text-lg">Current Plan</h3>
          <span className="bg-white text-neutral-900 text-xs px-2.5 py-1 rounded-full">SIM1</span>
        </div>
        <div className="inline-flex items-center space-x-2 bg-neutral-900 border border-neutral-700 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-lime-400" />
          <span className="text-white text-xs font-medium">Subscription</span>
        </div>
      </div>

      {/* Plan title */}
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-12 h-12 bg-transparent rounded-xl flex items-center justify-center">
          <img src={`${import.meta.env.BASE_URL}images/plan_logo.png`} alt="Plan" className="w-7 h-7" />
        </div>
        <h4 className="text-white font-bold text-xl">{plan.name}</h4>
      </div>

      {/* Feature tiles */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-lime-400 rounded-2xl p-4">
          <div className="flex items-center space-x-2 text-neutral-900 text-sm mb-1.5">
            <img src={`${import.meta.env.BASE_URL}images/data.png`} alt="Mobile data" className="w-5 h-5" />
            <span>Mobile data</span>
          </div>
          <div className="text-neutral-900 font-semibold text-xl">{plan.mobileData}</div>
        </div>
        <div className="bg-blue-500 rounded-2xl p-4">
          <div className="flex items-center space-x-2 text-neutral-900 text-sm mb-1.5">
            <img src={`${import.meta.env.BASE_URL}images/sms.png`} alt="Messaging" className="w-5 h-5" />
            <span>Messaging</span>
          </div>
          <div className="text-neutral-900 font-semibold text-xl">{plan.messaging}</div>
        </div>
        <div className="bg-pink-400 rounded-2xl p-4 col-span-2">
          <div className="flex items-center space-x-2 text-neutral-900 text-sm mb-1.5">
            <Phone className="w-4 h-4" />
            <span>Phone</span>
          </div>
          <div className="text-neutral-900 font-semibold text-xl">{plan.phone}</div>
        </div>
      </div>

      {/* Actions and pricing */}
      <div className="flex items-end justify-between">
        {/* Button block with offset shadow frame */}
        <div className="relative">
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl bg-neutral-900" />
          <div className="relative bg-white rounded-2xl p-2 flex items-center space-x-3">
            <button className="bg-lime-400 text-neutral-900 py-2 px-4 rounded-xl font-medium hover:bg-lime-300 transition-colors inline-flex items-center">
              <span>Edit</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
            <button className="bg-white text-neutral-900 py-2 px-4 rounded-xl font-medium border-2 border-neutral-900 hover:bg-neutral-100 transition-colors">
              View Billing
            </button>
          </div>
        </div>

        <div className="text-right">
          <div className="text-neutral-400 text-sm mb-1">Plan pricing</div>
          <div className="text-white font-bold text-3xl">R{plan.price}</div>
        </div>
      </div>
    </div>
  );
}

// Bundle Card Component
function BundleCard({ bundle }: { bundle: Bundle }) {
  const isFlex = bundle.type === 'flex';
  const isLite = bundle.type === 'lite';
  const isThreeMonth = bundle.type === '3-month';

  const containerClasses = (() => {
    if (isFlex) return 'bg-yellow-400';
    if (isLite) return 'bg-blue-500';
    if (isThreeMonth) return 'bg-purple-400';
    return 'bg-gray-600';
  })();

  const titleIcon = (() => {
    if (isFlex) return `${import.meta.env.BASE_URL}images/star.png`;
    if (isLite) return `${import.meta.env.BASE_URL}images/plan_logo.png`;
    if (isThreeMonth) return `${import.meta.env.BASE_URL}images/bundle_3.png`;
    return `${import.meta.env.BASE_URL}images/plan-line.png`;
  })();

  return (
    <div className={`${containerClasses} relative rounded-2xl p-6 min-h-[220px] border-2 border-neutral-900 overflow-hidden`}> 
      {/* Decorative plus cluster */}
      <div className="absolute top-3 right-4 text-neutral-900/70 select-none">
        <div className="leading-3">
          <span>+</span>
          <span className="ml-2">+</span>
          <span className="ml-2">+</span>
        </div>
        <div className="leading-3 mt-1">
          <span>+</span>
          <span className="ml-2">+</span>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center mb-4">
          <img src={titleIcon} alt="bundle icon" className="w-6 h-6 mr-2" />
        <h4 className="text-neutral-900 font-extrabold text-2xl">{bundle.name}</h4>
      </div>

      {/* Bullet list */}
      <div className="space-y-3 mb-6 max-w-[80%]">
        <div className="flex items-start">
          <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="bullet" className="w-7 h-5 mr-3 mt-0.5" />
          <span className="text-neutral-900 text-base leading-snug">{bundle.dayData}</span>
        </div>
        {bundle.cashback && (
          <div className="flex items-start">
            <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="bullet" className="w-7 h-5 mr-3 mt-0.5" />
            <span className="text-neutral-900 text-base leading-snug">{bundle.cashback}</span>
          </div>
        )}
        {bundle.nightData && !bundle.cashback && (
          <div className="flex items-start">
            <img src={`${import.meta.env.BASE_URL}images/plan_line.png`} alt="bullet" className="w-7 h-5 mr-3 mt-0.5" />
            <span className="text-neutral-900 text-base leading-snug">{bundle.nightData}</span>
          </div>
        )}
      </div>

      {/* Pointing man image */}
      {isFlex && (
        <img src={`${import.meta.env.BASE_URL}images/pointing_man.png`} alt="Pointing man" className="pointer-events-none select-none absolute -bottom-6 -right-4 h-44 object-contain" />
      )}

      {/* CTA with offset shadow */}
      <div className="relative inline-block">
        <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl bg-neutral-900" />
        <button className="relative bg-white text-neutral-900 border-2 border-neutral-900 rounded-2xl px-4 py-2 font-semibold inline-flex items-center">
          <span>View Bundle</span>
          <ExternalLink className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}

// Transaction History Component
function TransactionHistory({ transactions, className }: { transactions: Transaction[]; className?: string }) {
  return (
    <div className={`bg-neutral-800 rounded-xl p-6 h-full border border-neutral-700 ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Recent Transaction History</h3>
        <ExternalLink className="w-5 h-5 text-neutral-400" />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-neutral-500 text-sm border-b border-neutral-200">
              <th className="text-left pb-3">
                <div className="flex items-center space-x-1">
                  <span>Type</span>
                  <div className="flex flex-col">
                    <ChevronLeft className="w-3 h-3 rotate-90 text-neutral-400" />
                    <ChevronRight className="w-3 h-3 -rotate-90 text-neutral-400" />
                  </div>
                </div>
              </th>
              <th className="text-left pb-3">
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <div className="flex flex-col">
                    <ChevronLeft className="w-3 h-3 rotate-90 text-neutral-400" />
                    <ChevronRight className="w-3 h-3 -rotate-90 text-neutral-400" />
                  </div>
                </div>
              </th>
              <th className="text-left pb-3">
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <div className="flex flex-col">
                    <ChevronLeft className="w-3 h-3 rotate-90 text-neutral-400" />
                    <ChevronRight className="w-3 h-3 -rotate-90 text-neutral-400" />
                  </div>
                </div>
              </th>
              <th className="text-right pb-3">
                <div className="flex items-center justify-end space-x-1">
                  <span>Amount</span>
                  <div className="flex flex-col">
                    <ChevronLeft className="w-3 h-3 rotate-90 text-neutral-400" />
                    <ChevronRight className="w-3 h-3 -rotate-90 text-neutral-400" />
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={transaction.id} className={index > 0 ? 'border-t border-neutral-200' : ''}>
                <td className="py-3 text-white text-sm">{transaction.type}</td>
                <td className="py-3">
                  <StatusBadge status={transaction.status} />
                </td>
                <td className="py-3 text-neutral-500 text-sm">{transaction.date}</td>
                <td className={`py-3 text-sm text-right font-medium ${
                  transaction.amount > 0 ? 'text-lime-400' : 'text-white'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}R{Math.abs(transaction.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main Dashboard Component
function Dashboard() {
  const [currentSimIndex, setCurrentSimIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSim, setModalSim] = useState<SimCard | null>(null);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [simCards, setSimCards] = useState<SimCard[]>(mockSimCards);
  const [balancesLoading, setBalancesLoading] = useState(true);

  // Mock data for shipping modal (this would come from your API/state in production)
  const mockAddress = {
    streetNo: '1',
    streetName: 'Sterlig',
    suburb: 'Eversdal',
    city: 'Cape Town',
    stateOrProvince: 'Western-Cape',
    postCode: '7550',
    country: 'South Africa',
  }

  const mockSelectedPackage = {
    productId: '7029225P',
    name: 'Lite Plan',
    price: 199.99,
    features: {
      mobileData: '10GB',
      messaging: '10 SMS',
      phone: '10 Min',
    },
  }

  // Fetch balances for the SIM
  useEffect(() => {
    let cancelled = false;
    const fetchBalances = async () => {
      setBalancesLoading(true);
      try {
        const response = await subscriptionService.getBalances('27644038847');
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
  }, []);

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

  const handleVerify = (sim: SimCard) => {
    setModalSim(sim);
    setShippingModalOpen(true);
  };

  const handlePay = () => {
    console.log('Proceeding to payment...');
    // TODO: Integrate payment flow
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
      <ShippingModal
        open={shippingModalOpen}
        onClose={() => setShippingModalOpen(false)}
        defaultAddress={mockAddress}
        selectedPackage={mockSelectedPackage}
        onPay={handlePay}
        customerEmail="customer@example.com" // TODO: Get from user account
        customerName="Customer Name" // TODO: Get from user account
        customerPhone="27644038847" // Using the MSISDN
      />
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
              <div className="bg-neutral-800 rounded-xl p-8 border border-neutral-700 text-center">
                <div className="inline-block size-8 border-4 border-neutral-600 border-t-lime-400 rounded-full animate-spin mb-3" />
                <p className="text-neutral-400 text-sm">Loading SIM details...</p>
              </div>
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
            <TransactionHistory transactions={mockTransactions} className="flex-1" />
          </div>
          </div>
        </section>

      {/* Bottom Section - two equal sections (wallet removed) */}
      <section className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="flex flex-col">
              <CurrentPlan plan={mockCurrentPlan} className="flex-1" />
            </div>
            {/* <div className="flex flex-col">
              <Wallet className="flex-1" />
            </div> */}
            <div className="flex flex-col">
              <div className="grid grid-cols-1 gap-4 flex-1">
                <BundleCard bundle={mockBundles[0]} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <BundleCard bundle={mockBundles[1]} />
                  <BundleCard bundle={mockBundles[2]} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;