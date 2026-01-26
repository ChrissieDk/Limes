import { MoreHorizontal, Star } from 'lucide-react';
import type { SimCard as SimCardModel } from './dashboardTypes.ts';

interface SimCardProps {
  sim: SimCardModel;
  onTopUp: (sim: SimCardModel) => void;
  onActivate: (sim: SimCardModel) => void;
  canActivate?: boolean;
  isActivating?: boolean;
  isActive?: boolean;
  activationStatusLoading?: boolean;
}

export function SimCard({ sim, onTopUp, onActivate, canActivate = false, isActivating = false, isActive, activationStatusLoading = false }: SimCardProps) {
  return (
    <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-white font-semibold text-base">{sim.name}</h3>
              {activationStatusLoading ? (
                <span className="bg-neutral-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  Checking...
                </span>
              ) : isActive === true ? (
                <span className="bg-green-400 text-gray-900 text-xs px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              ) : isActive === false ? (
                <span className="bg-orange-400 text-gray-900 text-xs px-2 py-0.5 rounded-full font-medium">
                  Inactive
                </span>
              ) : null}
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
          disabled={activationStatusLoading || isActive !== true}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activationStatusLoading || isActive !== true
              ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
              : 'bg-lime-400 text-gray-900 hover:bg-lime-300'
          }`}
        >
          {activationStatusLoading ? 'Checking Status...' : isActive === false ? 'Awaiting Activation' : 'Top Up +'}
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
  const getBalanceValue = (grouping: string, definitionCode?: string) => {
    if (!sim.balances) return null;
    const balance = sim.balances.find((b) => 
      definitionCode ? b.definitionCode === definitionCode : b.grouping === grouping
    );
    return balance?.formattedParts?.value || null;
  };

  // Fetch all balance types from API
  const mobileData = getBalanceValue('data', 'DATA') || sim.plan.mobileData;
  // Try AIRTIME_ADVANCE first, fall back to GPA_CREDIT, then default
  const airtime = getBalanceValue('gpa', 'AIRTIME_ADVANCE') || getBalanceValue('gpa', 'GPA_CREDIT') || sim.plan.airtime;
  const voiceMinutes = getBalanceValue('voice', 'VOICE') || sim.plan.phone;
  const smsCount = getBalanceValue('sms', 'SMS') || sim.plan.messaging;

  return (
    <div className="bg-white rounded-2xl p-5">
      <h4 className="text-neutral-900 font-extrabold text-2xl mb-4">Sim Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-lime-400 rounded-2xl p-4">
          <div className="text-neutral-900 text-sm font-medium mb-1">Mobile Data</div>
          <div className="text-neutral-900 font-semibold text-xl leading-none">{mobileData}</div>
        </div>
        <div className="bg-purple-400 rounded-2xl p-4">
          <div className="text-neutral-900 text-sm font-medium mb-1">Airtime</div>
          <div className="text-neutral-900 font-semibold text-xl leading-none">{airtime}</div>
        </div>
        <div className="bg-blue-500 rounded-2xl p-4">
          <div className="text-neutral-900 text-sm font-medium mb-1">Voice Minutes</div>
          <div className="text-neutral-900 font-semibold text-xl leading-none">{voiceMinutes}</div>
        </div>
        <div className="bg-pink-400 rounded-2xl p-4">
          <div className="text-neutral-900 text-sm font-medium mb-1">SMS</div>
          <div className="text-neutral-900 font-semibold text-xl leading-none">{smsCount}</div>
        </div>
      </div>
    </div>
  );
}
