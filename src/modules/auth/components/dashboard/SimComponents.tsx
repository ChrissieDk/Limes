import { MoreHorizontal } from 'lucide-react';
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
    <div className="rounded-[24px] bg-white/5 ring-1 ring-white/10 p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-white font-semibold text-lg">{sim.name}</h3>
            {!activationStatusLoading && isActive !== undefined && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                isActive 
                  ? 'bg-[#ABFF63]/20 text-[#ABFF63]' 
                  : 'bg-neutral-600/50 text-neutral-400'
              }`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>
          <p className="text-neutral-400 text-base tracking-wide mb-3 sm:mb-0">{sim.phoneNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTopUp(sim)}
            disabled={activationStatusLoading || isActive !== true}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
              activationStatusLoading || isActive !== true
                ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
                : 'bg-[#ABFF63] text-neutral-900 hover:brightness-95'
            }`}
          >
            {activationStatusLoading ? 'Checking Status...' : isActive === false ? 'Awaiting Activation' : 'Top up +'}
          </button>
          {canActivate && (
            <button
              onClick={() => onActivate(sim)}
              disabled={isActivating}
              className="px-4 py-2 ring-1 ring-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActivating ? 'Activating...' : 'Activate'}
            </button>
          )}
          <button className="text-neutral-400 hover:text-white">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
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
    <div className="rounded-[24px] bg-white/5 ring-1 ring-white/10 p-4">
      <h4 className="text-white font-semibold text-lg mb-3">Balance</h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#D8B0FF] rounded-[16px] p-3 flex flex-col gap-0.5">
          <div className="text-neutral-900 text-xs font-medium">Airtime</div>
          <div className="text-neutral-900 font-bold text-xl leading-none">{airtime}</div>
        </div>
        <div className="bg-[#ABFF63] rounded-[16px] p-3 flex flex-col gap-0.5">
          <div className="text-neutral-900 text-xs font-medium">Mobile data</div>
          <div className="text-neutral-900 font-bold text-xl leading-none">{mobileData}</div>
        </div>
        <div className="bg-[#629BFC] rounded-[16px] p-3 flex flex-col gap-0.5">
          <div className="text-neutral-900 text-xs font-medium">SMS</div>
          <div className="text-neutral-900 font-bold text-xl leading-none">{smsCount}</div>
        </div>
        <div className="bg-pink-300 rounded-[16px] p-3 flex flex-col gap-0.5">
          <div className="text-neutral-900 text-xs font-medium">Voice minutes</div>
          <div className="text-neutral-900 font-bold text-xl leading-none">{voiceMinutes}</div>
        </div>
      </div>
    </div>
  );
}
