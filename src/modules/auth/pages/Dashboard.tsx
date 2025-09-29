import { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  ExternalLink, 
  Plus,
  Send,
  User,
  Smartphone,
  MessageSquare,
  Phone,
  Zap,
  Database,
  Star,
  CheckCircle,
  Clock,
  XCircle
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
    phoneNumber: '087 334 4455',
    isActive: true,
    hasVoiceTopUp: true,
    plan: {
      mobileData: '12GB',
      airtime: 'R120',
      messaging: '20SMS',
      phone: '102 Min'
    }
  },
  {
    id: '2',
    name: 'Sim 2',
    phoneNumber: '087 334 4455',
    isActive: true,
    hasVoiceTopUp: true,
    plan: {
      mobileData: '12GB',
      airtime: 'R120',
      messaging: '20SMS',
      phone: '102 Min'
    }
  }
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

  const getStatusIcon = () => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="w-3 h-3" />;
      case 'In Progress':
        return <Clock className="w-3 h-3" />;
      case 'Failed':
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      {getStatusIcon()}
      <span>{status}</span>
    </div>
  );
}

// SIM Card Component
function SimCard({ sim }: { sim: SimCard }) {
  return (
    <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-8 bg-green-400 rounded flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-gray-900" />
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
        <button className="flex-1 bg-green-400 text-gray-900 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-300 transition-colors">
          Top Up +
        </button>
        <button className="px-4 py-2 border border-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
          Verify
        </button>
      </div>
    </div>
  );
}

// Plan Details Component
function PlanDetails({ sim }: { sim: SimCard }) {
  return (
    <div className="bg-neutral-100 rounded-xl p-4">
      <h4 className="text-neutral-900 font-semibold text-base mb-4">Sim Details</h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-400 rounded-lg p-3">
          <div className="text-white text-xs font-medium mb-1">Mobile data</div>
          <div className="text-white font-bold text-lg">{sim.plan.mobileData}</div>
        </div>
        <div className="bg-purple-500 rounded-lg p-3">
          <div className="text-white text-xs font-medium mb-1">Airtime</div>
          <div className="text-white font-bold text-lg">{sim.plan.airtime}</div>
        </div>
        <div className="bg-blue-500 rounded-lg p-3">
          <div className="text-white text-xs font-medium mb-1">Messaging</div>
          <div className="text-white font-bold text-lg">{sim.plan.messaging}</div>
        </div>
        <div className="bg-pink-500 rounded-lg p-3">
          <div className="text-white text-xs font-medium mb-1">Phone</div>
          <div className="text-white font-bold text-lg">{sim.plan.phone}</div>
        </div>
      </div>
    </div>
  );
}

// Current Plan Component
function CurrentPlan({ plan, className }: { plan: Plan; className?: string }) {
  return (
    <div className={`bg-neutral-800 rounded-xl p-6 h-full border border-neutral-700 ${className ?? ''}`}> 
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Current Plan</h3>
        <div className="flex items-center space-x-2">
          <span className="bg-neutral-200 text-neutral-900 text-xs px-2 py-1 rounded">SIM 1</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
            <span className="text-lime-600 text-xs font-medium">Subscription</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-start space-x-4 mb-6">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
          <Zap className="w-6 h-6 text-gray-900" />
        </div>
        <div>
          <h4 className="text-white font-bold text-lg">{plan.name}</h4>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-green-500 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-white text-sm mb-2">
            <Database className="w-4 h-4" />
            <span>Mobile data</span>
          </div>
          <div className="text-white font-bold text-lg">{plan.mobileData}</div>
        </div>
        <div className="bg-blue-500 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-white text-sm mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>Messaging</span>
          </div>
          <div className="text-white font-bold text-lg">{plan.messaging}</div>
        </div>
        <div className="bg-pink-500 rounded-xl p-4 col-span-2">
          <div className="flex items-center space-x-2 text-white text-sm mb-2">
            <Phone className="w-4 h-4" />
            <span>Phone</span>
          </div>
          <div className="text-white font-bold text-lg">{plan.phone}</div>
        </div>
      </div>
      
      <div className="flex space-x-3 mb-6">
        <button className="flex-1 bg-green-400 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-green-300 transition-colors flex items-center justify-center">
          <span>Edit</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
        <button className="flex-1 border border-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors">
          View Billing
        </button>
      </div>
      
      <div className="text-center">
        <div className="text-neutral-400 text-sm mb-1">Plan pricing</div>
        <div className="text-white font-bold text-2xl">R{plan.price}</div>
      </div>
    </div>
  );
}

// Wallet Component
function Wallet({ className }: { className?: string }) {
  return (
    <div className={`bg-lime-400 rounded-xl p-6 relative overflow-hidden border-2 border-lime-500 h-full ${className ?? ''}`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 font-semibold text-lg">Wallet</h3>
          <ExternalLink className="w-5 h-5 text-gray-900" />
        </div>
        
        <div className="mb-4">
          <div className="text-lime-900/90 text-sm mb-2">My balance</div>
          <div className="text-neutral-900 font-bold text-5xl mb-3">R250.60</div>
          <div className="flex items-center space-x-2">
            <div className="bg-neutral-900 text-white text-xs px-3 py-1 rounded-full">
              R11.50 in 🍋 Limes
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-6">
          <div className="text-neutral-700 text-sm">Lowest remittance transfer fee in SA!</div>
          <div className="w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">?</span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-neutral-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-neutral-800 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Money</span>
          </button>
          <button className="flex items-center space-x-2 border-2 border-neutral-900 text-neutral-900 px-4 py-2 rounded-lg font-medium hover:bg-neutral-900 hover:text-white transition-colors">
            <Send className="w-4 h-4" />
            <span>Send Money</span>
          </button>
        </div>
      </div>
      
      {/* Decorative elements - dashed border effect */}
      <div className="absolute inset-2 border-2 border-dashed border-gray-700 rounded-lg opacity-30"></div>
      
      {/* Background circles */}
      <div className="absolute bottom-4 right-4 opacity-20">
        <div className="w-24 h-24 border-4 border-white rounded-full"></div>
        <div className="absolute top-2 left-2 w-16 h-16 border-2 border-white rounded-full"></div>
      </div>
    </div>
  );
}

// Bundle Card Component
function BundleCard({ bundle }: { bundle: Bundle }) {
  const getBundleStyles = () => {
    switch (bundle.type) {
      case 'flex':
        return 'bg-yellow-400 text-gray-900';
      case 'lite':
        return 'bg-blue-500 text-white';
      case '3-month':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className={`${getBundleStyles()} rounded-xl p-4 relative min-h-[200px]`}>
      {bundle.featured && (
        <div className="flex justify-end mb-2">
          <Star className="w-5 h-5 text-yellow-600" />
        </div>
      )}

      <h4 className="font-bold text-lg mb-4">{bundle.name}</h4>

      <div className="space-y-2 mb-4">
        <div className="flex items-start space-x-2">
          <div className="w-4 h-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center mt-0.5">
            <div className="w-2 h-2 bg-current rounded-full"></div>
          </div>
          <span className="text-sm leading-tight">{bundle.dayData}</span>
        </div>
        {bundle.nightData && (
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 bg-current rounded-full"></div>
            </div>
            <span className="text-sm leading-tight">{bundle.nightData}</span>
          </div>
        )}
        {bundle.cashback && (
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 bg-current rounded-full"></div>
            </div>
            <span className="text-sm leading-tight">{bundle.cashback}</span>
          </div>
        )}
      </div>

      {/* Person image for featured bundle */}
      {bundle.hasImage && (
        <div className="absolute bottom-4 right-4">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
        </div>
      )}

      <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2">
        <span>View Bundle</span>
        <ExternalLink className="w-4 h-4" />
      </button>
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

  const nextSim = () => {
    setCurrentSimIndex((prev) => (prev + 1) % mockSimCards.length);
  };
  const prevSim = () => {
    setCurrentSimIndex((prev) => (prev - 1 + mockSimCards.length) % mockSimCards.length);
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <DashboardNavbar />
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
                  {currentSimIndex + 1} of {mockSimCards.length}
                </span>
                <button
                  onClick={nextSim}
                  className="p-1 text-neutral-400 hover:text-white transition-colors"
                  disabled={currentSimIndex === mockSimCards.length - 1}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <SimCard sim={mockSimCards[currentSimIndex]} />
            <PlanDetails sim={mockSimCards[currentSimIndex]} />
          </div>

          {/* Right: Transaction History */}
          <div className="flex flex-col">
            <TransactionHistory transactions={mockTransactions} className="flex-1" />
          </div>
          </div>
        </section>

        {/* Bottom Section - three equal sections with equal heights in gray block */}
        <section className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="flex flex-col">
              <CurrentPlan plan={mockCurrentPlan} className="flex-1" />
            </div>
            <div className="flex flex-col">
              <Wallet className="flex-1" />
            </div>
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