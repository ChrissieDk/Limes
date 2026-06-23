import { useState, useRef, useEffect } from "react";
import type { SimCard as SimCardModel } from "./dashboardTypes.ts";

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

export function SimCard({
  sim,
  onTopUp,
  onActivate,
  onRename,
  canActivate = false,
  isActivating = false,
  isActive,
  activationStatusLoading = false,
}: SimCardProps) {
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
    if (e.key === "Enter") handleSaveRename();
    if (e.key === "Escape") {
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
              <h3 className="font-grotesque text-white font-medium text-base">
                {sim.name}
              </h3>
            )}
            {!activationStatusLoading && isActive !== undefined && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                  isActive
                    ? "bg-[#ABFF63]/20 text-[#ABFF63]"
                    : "bg-amber-900/40 text-amber-200"
                }`}
              >
                {isActive ? "Active" : "Activation in progress"}
              </span>
            )}
          </div>
          <p className="font-manrope text-neutral-400 text-base tracking-wide mb-3 sm:mb-0">
            {sim.phoneNumber}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            {activationStatusLoading ? (
              <span className="font-manrope inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold bg-neutral-600 text-neutral-400">
                Checking Status...
              </span>
            ) : isAwaitingActivation && !canActivate ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-neutral-900"
                    style={{ backgroundColor: "#F9A1D9" }}
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
                      <img
                        src={`${import.meta.env.BASE_URL}images/edit.svg`}
                        alt=""
                        className="w-3.5 h-3.5"
                      />
                    </button>
                  )}
                </div>
                <p className="font-manrope text-neutral-500 text-[10px] leading-tight mt-0.5">
                  This could take up to 5min
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onTopUp(sim)}
                  disabled={isActive !== true}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                    isActive !== true
                      ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                      : "bg-[#ABFF63] text-neutral-900 hover:brightness-95"
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
                    {isActivating ? "Activating..." : "Activate"}
                  </button>
                )}
                {onRename && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-neutral-400 hover:text-white transition-colors p-1"
                    aria-label="Rename SIM"
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}images/edit.svg`}
                      alt=""
                      className="w-3.5 h-3.5"
                    />
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
  onSwitchToContract?: () => void;
  isPortingInProgress?: boolean;
}

interface BalanceCardProps {
  icon: string;
  label: string;
  value: string | null;
  bgClass: string;
  colSpan?: boolean;
}

export function BalanceCard({
  icon,
  label,
  value,
  bgClass,
  colSpan,
}: BalanceCardProps) {
  return (
    <div
      className={`${bgClass} ${colSpan ? "col-span-2" : ""} rounded-[16px] p-3 flex items-center gap-2`}
    >
      <img
        src={`${import.meta.env.BASE_URL}images/${icon}`}
        alt=""
        className="w-7 h-7 flex-shrink-0"
      />
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="font-manrope text-neutral-900 text-xs font-medium">
          {label}
        </div>
        <div className="font-grotesque text-neutral-900 font-bold text-xl leading-none">
          {value ?? "0 MB"}
        </div>
      </div>
    </div>
  );
}

export function PlanDetails({
  sim,
  onPortMyNumber,
  onSwitchToContract,
  isPortingInProgress = false,
}: PlanDetailsProps) {
  const getBalanceValue = (grouping: string, definitionCode?: string) => {
    if (!sim.balances) return null;
    const balance = sim.balances.find((b) =>
      definitionCode
        ? b.definitionCode === definitionCode
        : b.grouping === grouping,
    );
    return balance?.formattedParts?.value || null;
  };

  const mobileData = getBalanceValue("data", "DATA") || sim.plan.mobileData;
  const airtime = getBalanceValue("gpa", "GPA_CREDIT") || sim.plan.airtime;
  const voiceMinutes = getBalanceValue("voice", "VOICE") || sim.plan.phone;
  const smsCount = getBalanceValue("sms", "SMS") || sim.plan.messaging;
  const whatsappData = getBalanceValue("whatsapp", "WHATSAPP");

  return (
    <>
      <div className="rounded-[24px] bg-white/5 ring-1 ring-white/10 p-4">
        <h4 className="font-grotesque text-white font-semibold text-lg mb-3">
          Balance
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <BalanceCard
            icon="plan_data.svg"
            label="Mobile data"
            value={mobileData}
            bgClass="bg-[#FDDA36]"
            colSpan
          />
          <BalanceCard
            icon="plan_lime.svg"
            label="Airtime"
            value={airtime}
            bgClass="bg-[#D8B0FF]"
          />
          <BalanceCard
            icon="plan_sms.svg"
            label="SMS"
            value={smsCount}
            bgClass="bg-[#629BFC]"
          />
          <BalanceCard
            icon="plan_phone.svg"
            label="Voice minutes"
            value={voiceMinutes}
            bgClass="bg-pink-300"
          />
          <BalanceCard
            icon="whatsapp_icon_small.svg"
            label="WhatsApp"
            value={whatsappData}
            bgClass="bg-[#ABFF63]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-[24px] bg-white/5 ring-1 ring-white/10 px-6 py-4">
          <div className="flex flex-col justify-between h-full gap-6">
            <div>
              <h4 className="font-grotesque text-white font-semibold text-xl leading-snug mb-2">
                Ready to keep your number?
              </h4>
              <p className="font-manrope text-neutral-400 text-[13px] leading-relaxed">
                Insert your Limes SIM and dial *140# to start porting.
                <br className="hidden sm:block" /> Follow the prompts, quick and
                easy.
              </p>
            </div>
            {isPortingInProgress ? (
              <span
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] px-5 text-sm font-semibold text-neutral-900 self-start"
                style={{ backgroundColor: "#F9A1D9" }}
              >
                In progress
              </span>
            ) : (
              <button
                type="button"
                onClick={onPortMyNumber}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] bg-[#ABFF63] px-5 text-sm font-semibold text-neutral-900 shadow-[0_8px_18px_rgba(0,0,0,0.22)] hover:brightness-95 transition-all self-start"
              >
                Port my number
                <span aria-hidden="true" className="text-base leading-none">
                  →
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="rounded-[24px] bg-white/5 ring-1 ring-white/10 px-6 py-4">
          <div className="flex flex-col justify-between h-full gap-6">
            <div>
              <h4 className="font-grotesque text-white font-semibold text-xl leading-snug mb-2">
                Looking for long-term subscriptions?
              </h4>
              <p className="font-manrope text-neutral-400 text-[13px] leading-relaxed">
                You can now change your SIM from Prepaid to Subscription.
                <br className="hidden sm:block" /> Get everything you need,
                every month.
              </p>
            </div>
            {/* BACKEND TODO: sim.packageType should come from MsisdnData.packageType.
                Until then we fall back to inferPackageType() which only recognises
                the original SIM-package IDs (ending in P). Users who bought extra
                bundles will show as enabled even if they are prepaid. */}
            <button
              type="button"
              onClick={onSwitchToContract}
              disabled={sim.packageType === "contract"}
              title={
                sim.packageType === "contract"
                  ? "You are already on a subscription"
                  : undefined
              }
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-[14px] bg-[#FDDA36] px-5 text-sm font-semibold text-neutral-900 shadow-[0_8px_18px_rgba(0,0,0,0.22)] transition-all self-start ${
                sim.packageType === "contract"
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:brightness-95"
              }`}
            >
              Switch to Subscription
              <span aria-hidden="true" className="text-base leading-none">
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
