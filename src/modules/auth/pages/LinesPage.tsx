import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MobilePage from "../../../components/MobilePage";
import { Smartphone, CheckCircle, Plus } from "lucide-react";
import { subscriptionService } from "../../subscription/services/subscriptionService";

interface SimCardData {
  id: string;
  name: string;
  phoneNumber: string;
  isActive?: boolean;
  packageType?: "prepaid" | "contract";
}

/**
 * Lines page — shows all mobile SIMs in a grid.
 * Tapping a different SIM navigates back to the dashboard
 * and switches the selected line.
 */
export default function LinesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as Record<string, unknown> | null;

  const [simCards, setSimCards] = useState<SimCardData[]>([]);
  const [currentSimIndex, setCurrentSimIndex] = useState(0);
  const [simIsActive, setSimIsActive] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Read data passed from the dashboard via navigation state
    const cards = navState?.simCards as SimCardData[] | undefined;
    const index = navState?.currentSimIndex as number | undefined;
    const active = navState?.simIsActive as Record<string, boolean> | undefined;

    if (cards) setSimCards(cards);
    if (index !== undefined) setCurrentSimIndex(index);
    if (active) setSimIsActive(active);
  }, [navState]);

  // Fetch activation status for SIMs missing from the snapshot
  useEffect(() => {
    if (simCards.length === 0) return;

    const msisdnsToFetch = simCards
      .map((s) => s.phoneNumber)
      .filter((msisdn) => msisdn && simIsActive[msisdn] === undefined);

    if (msisdnsToFetch.length === 0) return;

    let cancelled = false;

    Promise.allSettled(
      msisdnsToFetch.map((msisdn) =>
        subscriptionService.checkSimActive(msisdn),
      ),
    ).then((results) => {
      if (cancelled) return;
      results.forEach((result, idx) => {
        const msisdn = msisdnsToFetch[idx];
        if (result.status === "fulfilled") {
          setSimIsActive((prev) => ({
            ...prev,
            [msisdn]: result.value.isActive,
          }));
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [simCards, simIsActive]);

  // Fallback if user lands here without state — shouldn't happen via normal flow
  if (!simCards.length) {
    return (
      <MobilePage title="Manage Lines" backTo="/dashboard">
        <div className="px-4 pt-4">
          <div className="rounded-2xl bg-neutral-800 border border-white/10 p-6 text-center">
            <h3 className="font-grotesque text-white text-base font-semibold">
              No SIMs found
            </h3>
            <p className="font-manrope mt-2 text-sm text-neutral-400">
              {navState
                ? "Could not load your lines. Please go back and try again."
                : "Open this page from the dashboard to see your lines."}
            </p>
          </div>
        </div>
      </MobilePage>
    );
  }

  const handleSelectSim = (index: number) => {
    if (index === currentSimIndex) {
      // Same SIM — just go back
      navigate("/dashboard");
      return;
    }
    // Navigate to dashboard with the selected SIM index
    navigate("/dashboard", {
      state: { selectedSimIndex: index },
    });
  };

  return (
    <MobilePage title="Manage Lines" backTo="/dashboard">
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          {simCards.map((sim, index) => {
            const isSelected = index === currentSimIndex;
            const active = simIsActive[sim.phoneNumber || sim.id];
            const statusLabel =
              active === undefined
                ? "Checking…"
                : active
                  ? "Active"
                  : "Setting up";
            const statusColor =
              active === undefined ? "#666" : active ? "#ABFF63" : "#F9A1D9";

            return (
              <button
                key={sim.phoneNumber || sim.id}
                onClick={() => handleSelectSim(index)}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-all active:scale-[0.97] ${
                  isSelected
                    ? "border-[#ABFF63] bg-[#ABFF63]/10 ring-1 ring-[#ABFF63]/30"
                    : "border-white/10 bg-neutral-800 hover:bg-neutral-700/80"
                }`}
              >
                {/* Selected badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-[#ABFF63]" />
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`flex items-center justify-center size-12 rounded-xl ${
                    isSelected
                      ? "bg-[#ABFF63]/20 text-[#ABFF63]"
                      : "bg-white/10 text-neutral-400"
                  }`}
                >
                  <Smartphone className="w-6 h-6" strokeWidth={1.8} />
                </div>

                {/* Phone number */}
                <span className="font-manrope text-white text-sm font-semibold tracking-wider truncate w-full">
                  {sim.phoneNumber}
                </span>

                {/* SIM name */}
                <span className="font-manrope text-neutral-400 text-xs truncate w-full -mt-1">
                  {sim.name}
                </span>

                {/* Plan type */}
                <span className="font-manrope text-neutral-500 text-[10px] font-semibold uppercase tracking-wider -mt-1">
                  {sim.packageType === "contract" ? "Subscription" : "Prepaid"}
                </span>

                {/* Status badge */}
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{
                    backgroundColor: `${statusColor}20`,
                    color: statusColor,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: statusColor }}
                  />
                  {statusLabel}
                </span>
              </button>
            );
          })}

          {/* Add new SIM */}
          <Link
            to="/dashboard/packages"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-neutral-800/50 p-5 text-center transition-all hover:bg-neutral-700/60 active:scale-[0.97] min-h-[208px]"
          >
            <div className="flex items-center justify-center size-12 rounded-xl bg-white/5 text-neutral-500">
              <Plus className="w-6 h-6" strokeWidth={2} />
            </div>
            <span className="font-manrope text-neutral-400 text-sm font-semibold">
              Add new SIM
            </span>
          </Link>
        </div>
      </div>
    </MobilePage>
  );
}
