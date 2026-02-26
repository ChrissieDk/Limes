import { useState, useRef, useEffect } from 'react';
import type { SimCard as SimCardModel } from './dashboardTypes.ts';

interface SimCardProps {
  sim: SimCardModel;
  onTopUp: (sim: SimCardModel) => void;
  onActivate: (sim: SimCardModel) => void;
  onRename?: (sim: SimCardModel, newName: string) => void;
  canActivate?: boolean;
  isActivating?: boolean;
  isActive?: boolean;
  activationStatusLoading?: boolean;
}

export function SimCard({ sim, onTopUp, onActivate, onRename, canActivate = false, isActivating = false, isActive, activationStatusLoading = false }: SimCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(sim.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAwaitingActivation = isActive === false;

  useEffect(() => {
    setEditValue(sim.name);
  }, [sim.id, sim.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== sim.name && onRename) {
      onRename(sim, trimmed);
    }
    setEditValue(sim.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveRename();
    if (e.key === 'Escape') {
      setEditValue(sim.name);
      setIsEditing(false);
    }
  };

  return (
    <div className="rounded-[24px] bg-white/5 ring-1 ring-white/10 p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSaveRename}
                onKeyDown={handleKeyDown}
                className="bg-white/10 text-white rounded-lg px-2 py-1 text-base font-medium w-full max-w-[180px] focus:outline-none focus:ring-1 focus:ring-white/30"
                maxLength={50}
              />
            ) : (
              <h3 className="text-white font-medium text-base">{sim.name}</h3>
            )}
            {!activationStatusLoading && isActive !== undefined && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                isActive
                  ? 'bg-[#ABFF63]/20 text-[#ABFF63]'
                  : 'bg-amber-900/40 text-amber-200'
              }`}>
                {isActive ? 'Active' : 'Activation in progress'}
              </span>
            )}
          </div>
          <p className="text-neutral-400 text-base tracking-wide mb-3 sm:mb-0">{sim.phoneNumber}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            {activationStatusLoading ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold bg-neutral-600 text-neutral-400">
                Checking Status...
              </span>
            ) : isAwaitingActivation && !canActivate ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-neutral-900"
                    style={{ backgroundColor: '#F9A1D9' }}
                  >
                    We&apos;re setting it up
                  </span>
                  {onRename && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center justify-center p-1 text-neutral-400 hover:text-white transition-colors"
                      aria-label="Rename SIM"
                    >
                      <img src={`${import.meta.env.BASE_URL}images/edit.svg`} alt="" className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-neutral-500 text-[10px] leading-tight mt-0.5">This could take up to 5min</p>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onTopUp(sim)}
                  disabled={isActive !== true}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                    isActive !== true
                      ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
                      : 'bg-[#ABFF63] text-neutral-900 hover:brightness-95'
                  }`}
                >
                  Top up +
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
                {onRename && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-neutral-400 hover:text-white transition-colors p-1"
                    aria-label="Rename SIM"
                  >
                    <img src={`${import.meta.env.BASE_URL}images/edit.svg`} alt="" className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlanDetailsProps {
  sim: SimCardModel;
  onPortMyNumber?: () => void;
}

export function PlanDetails({ sim, onPortMyNumber }: PlanDetailsProps) {
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
  // Try GPA_CREDIT first, fall back to GPA_CREDIT, then default
  const airtime = getBalanceValue('gpa', 'GPA_CREDIT') || getBalanceValue('gpa', 'GPA_CREDIT') || sim.plan.airtime;
  const voiceMinutes = getBalanceValue('voice', 'VOICE') || sim.plan.phone;
  const smsCount = getBalanceValue('sms', 'SMS') || sim.plan.messaging;
  const whatsappData = getBalanceValue('whatsapp', 'WHATSAPP');

  return (
    <>
      <div className="rounded-[24px] bg-white/5 ring-1 ring-white/10 p-4">
        <h4 className="text-white font-semibold text-lg mb-3">Balance</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 bg-[#FDDA36] rounded-[16px] p-3 flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}images/plan_data.svg`} alt="" className="w-7 h-7 flex-shrink-0" />
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="text-neutral-900 text-xs font-medium">Mobile data</div>
              <div className="text-neutral-900 font-bold text-xl leading-none">{mobileData}</div>
            </div>
          </div>
          <div className="bg-[#D8B0FF] rounded-[16px] p-3 flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}images/plan_lime.svg`} alt="" className="w-7 h-7 flex-shrink-0" />
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="text-neutral-900 text-xs font-medium">Airtime</div>
              <div className="text-neutral-900 font-bold text-xl leading-none">{airtime}</div>
            </div>
          </div>
          <div className="bg-[#629BFC] rounded-[16px] p-3 flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}images/plan_sms.svg`} alt="" className="w-7 h-7 flex-shrink-0" />
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="text-neutral-900 text-xs font-medium">SMS</div>
              <div className="text-neutral-900 font-bold text-xl leading-none">{smsCount}</div>
            </div>
          </div>
          <div className="bg-pink-300 rounded-[16px] p-3 flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}images/plan_phone.svg`} alt="" className="w-7 h-7 flex-shrink-0" />
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="text-neutral-900 text-xs font-medium">Voice minutes</div>
              <div className="text-neutral-900 font-bold text-xl leading-none">{voiceMinutes}</div>
            </div>
          </div>
          <div className="bg-[#ABFF63] rounded-[16px] p-3 flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}images/whatsapp_icon_small.svg`} alt="" className="w-7 h-7 flex-shrink-0" />
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="text-neutral-900 text-xs font-medium">WhatsApp</div>
              <div className="text-neutral-900 font-bold text-xl leading-none">{whatsappData ?? '0 MB'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] bg-white/5 ring-1 ring-white/10 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h4 className="text-white font-semibold text-xl leading-snug mb-1">Ready to keep your number?</h4>
            <p className="text-neutral-400 text-[13px] leading-relaxed">
              Insert your Limes SIM and dial *140# to start porting. Follow the prompts, quick and easy.
            </p>
          </div>
          <button
            type="button"
            onClick={onPortMyNumber}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] bg-[#ABFF63] px-5 text-sm font-semibold text-neutral-900 shadow-[0_8px_18px_rgba(0,0,0,0.22)] hover:brightness-95 transition-all"
          >
            Port my number
            <span aria-hidden="true" className="text-base leading-none">→</span>
          </button>
        </div>
      </div>
    </>
  );
}
