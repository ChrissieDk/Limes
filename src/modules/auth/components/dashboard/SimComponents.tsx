import { MoreHorizontal, Star } from 'lucide-react';
import type { SimCard as SimCardModel } from './dashboardTypes.ts';

interface SimCardProps {
  sim: SimCardModel;
  onTopUp: (sim: SimCardModel) => void;
  onVerify: (sim: SimCardModel) => void;
  onActivate: (sim: SimCardModel) => void;
  canActivate?: boolean;
  isActivating?: boolean;
}

export function SimCard({ sim, onTopUp, onVerify, onActivate, canActivate = false, isActivating = false }: SimCardProps) {
  return (
    <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-8 rounded overflow-hidden border border-neutral-600">
            <img
              src={`${import.meta.env.BASE_URL}images/limes_sim.png`}
              alt="Limes SIM"
              className="w-full h-full object-cover"
            />
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
        <button
          onClick={() => onTopUp(sim)}
          className="flex-1 bg-green-400 text-gray-900 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-300 transition-colors"
        >
          Top Up +
        </button>
        <button
          onClick={() => onVerify(sim)}
          className="px-4 py-2 border border-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Verify
        </button>
        {canActivate && (
          <button
            onClick={() => onActivate(sim)}
            disabled={isActivating}
            className="px-4 py-2 border border-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isActivating ? 'Activating...' : 'Activate'}
          </button>
        )}
      </div>
    </div>
  );
}

interface PlanDetailsProps {
  sim: SimCardModel;
}

export function PlanDetails({ sim }: PlanDetailsProps) {
  // Get balances from sim.balances or use defaults
  const getBalanceValue = (grouping: string) => {
    if (!sim.balances) return null;
    const balance = sim.balances.find((b) => b.grouping === grouping);
    return balance?.formattedParts?.value || null;
  };

  const mobileData = getBalanceValue('data') || sim.plan.mobileData;
  const airtime = getBalanceValue('gpa') || sim.plan.airtime;
  const messaging = sim.plan.messaging; // No specific balance for messaging in API
  const phone = sim.plan.phone; // No specific balance for phone minutes in API

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
