import { useState, useRef, useEffect } from "react";
import type { SimCard as SimCardModel } from "./dashboardTypes.ts";
import { Pencil } from "lucide-react";
import { motion } from "framer-motion";

interface MobileSimCardProps {
  sim: SimCardModel;
  onTopUp: (sim: SimCardModel) => void;
  onActivate: (sim: SimCardModel) => void;
  onPort: () => void;
  onRename?: (sim: SimCardModel, newName: string) => void;
  onSwitchToContract?: () => void;
  onManageSubscription?: () => void;
  canActivate?: boolean;
  isActivating?: boolean;
  isActive?: boolean;
  activationStatusLoading?: boolean;
}

export default function MobileSimCard({
  sim,
  onTopUp,
  onActivate,
  onPort,
  onRename,
  onSwitchToContract,
  onManageSubscription,
  canActivate = false,
  isActivating = false,
  isActive,
  activationStatusLoading = false,
}: MobileSimCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(sim.name);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (trimmed && trimmed !== sim.name && onRename) onRename(sim, trimmed);
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

  const statusLabel = activationStatusLoading
    ? "Checking…"
    : isActive === false
      ? "Setting up"
      : isActive
        ? "Active"
        : "Inactive";
  const statusColor = isActive
    ? "#ABFF63"
    : isActive === false
      ? "#F9A1D9"
      : "#666";
  const simReady = isActive === true;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-850 border border-white/10 overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSaveRename}
                onKeyDown={handleKeyDown}
                className="bg-white/10 text-white rounded-lg px-2 py-1 text-xl font-bold w-full max-w-[200px] focus:outline-none focus:ring-1 focus:ring-white/30"
                maxLength={50}
              />
            ) : (
              <button
                type="button"
                onClick={() => onRename && setIsEditing(true)}
                className="flex items-center gap-1.5 text-left group"
              >
                <h2 className="font-grotesque text-white font-bold text-xl truncate">
                  {sim.name}
                </h2>
                {onRename && (
                  <Pencil className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                )}
              </button>
            )}
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold flex-shrink-0 ml-2"
            style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
            {statusLabel}
          </span>
        </div>
        <div className="mt-1">
          <span className="font-grotesque text-neutral-400 text-[13px] font-medium tracking-wide">
            {sim.packageType === "contract" ? "Subscription" : "Prepaid"}
          </span>
        </div>
      </div>

      <div className="px-5 pt-3 pb-5 flex gap-2">
        <button
          onClick={() => onTopUp(sim)}
          disabled={!simReady}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${simReady ? "bg-[#ABFF63] text-neutral-900 active:brightness-90" : "bg-neutral-700 text-neutral-500 cursor-not-allowed"}`}
        >
          Top Up
        </button>
      </div>

      {canActivate && !simReady && (
        <div className="px-5 pb-5 -mt-1">
          <button
            onClick={() => onActivate(sim)}
            disabled={isActivating}
            className="w-full py-3 rounded-xl border border-[#ABFF63]/30 text-[#ABFF63] text-sm font-semibold active:bg-[#ABFF63]/10 transition-colors disabled:opacity-50"
          >
            {isActivating ? "Activating…" : "Activate SIM"}
          </button>
        </div>
      )}
    </div>
  );
}
