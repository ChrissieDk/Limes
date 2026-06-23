import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Star,
  FileText,
  RefreshCw,
} from "lucide-react";
import { paymentService } from "../services/paymentService";
import { getAxiosErrorMessage } from "../../../utils/errorMessage";
import { toCents } from "../utils/dynamicPricing";
import { trackPurchase } from "../../analytics/services/analyticsService";
import { log } from "../../../lib/sentry-logger";
import type { SavedCard } from "../../../types/payment";
import { deduplicateCards } from "../utils/cardUtils";

interface SavedCardsProps {
  onCardSelected?: (cardId: string) => void;
  showChargeButton?: boolean;
  chargeAmount?: number;
}

export default function SavedCards({
  onCardSelected,
  showChargeButton = false,
  chargeAmount,
}: SavedCardsProps) {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [chargingCardId, setChargingCardId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    log.info("payment_methods_page_view");
    loadCards();
  }, []);

  const loadCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentService.getSavedCards();
      const uniqueCards = deduplicateCards(data);
      setCards(uniqueCards);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else {
        setError(getAxiosErrorMessage(err, "Failed to load saved cards"));
      }
      log.error("payment_methods_load_failed", { status: status ?? "unknown" });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultCard = async (cardId: string) => {
    setSettingDefaultId(cardId);
    setError(null);

    const card = cards.find((c) => c.id === cardId);
    log.info("payment_methods_set_default", {
      card_last4: card?.last4 ?? "unknown",
      card_bank: card?.bank ?? "unknown",
    });

    try {
      await paymentService.setDefaultCard(cardId);
      setCards(
        cards.map((c) => ({
          ...c,
          isDefault: c.id === cardId,
        })),
      );
      setSuccessMessage("Default card updated successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      log.error("payment_methods_set_default_failed", {
        card_last4: card?.last4 ?? "unknown",
        status: status ?? "unknown",
      });
      if (status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else {
        setError(getAxiosErrorMessage(err, "Failed to set default card"));
      }
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    setConfirmingDeleteId(null);
    setDeletingCardId(cardId);
    setError(null);

    const card = cards.find((c) => c.id === cardId);
    log.info("payment_methods_delete_card", {
      card_last4: card?.last4 ?? "unknown",
      card_bank: card?.bank ?? "unknown",
    });

    try {
      await paymentService.deleteSavedCard(cardId);
      setCards(cards.filter((c) => c.id !== cardId));
      setSuccessMessage("Card deleted successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      log.error("payment_methods_delete_card_failed", {
        card_last4: card?.last4 ?? "unknown",
        status: status ?? "unknown",
      });
      if (status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else {
        setError(getAxiosErrorMessage(err, "Failed to delete card"));
      }
    } finally {
      setDeletingCardId(null);
    }
  };

  const handleChargeCard = async (cardId: string) => {
    if (!chargeAmount) return;

    setChargingCardId(cardId);
    setError(null);

    try {
      const response = await paymentService.chargeSavedCard({
        paymentMethodId: cardId,
        amount: toCents(chargeAmount),
      });

      if (response.success) {
        setSuccessMessage(`Payment of R${chargeAmount} successful!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        if (onCardSelected) {
          onCardSelected(cardId);
        }
        if (response.transaction) {
          trackPurchase({
            transactionId: response.transaction.reference,
            value: chargeAmount,
            currency: response.transaction.currency || "ZAR",
            items: [
              {
                item_id: response.transaction.reference,
                item_name: "Saved Card Payment",
                price: chargeAmount,
                quantity: 1,
              },
            ],
            paymentType: response.transaction.channel || "card",
          });
        }
      } else {
        setError(response.error || "Payment failed");
      }
    } catch (err: unknown) {
      setError(getAxiosErrorMessage(err, "Failed to charge card"));
    } finally {
      setChargingCardId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#ABFF63]" />
        <span className="ml-3 text-neutral-400 font-manrope">
          Loading saved cards...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {successMessage && (
        <div
          className="flex items-center gap-3 p-4 bg-[#ABFF63]/10 rounded-xl text-[#ABFF63]"
          role="alert"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium font-manrope">
            {successMessage}
          </span>
        </div>
      )}

      {error && (
        <div
          className="flex items-center gap-3 p-4 bg-red-500/10 rounded-xl text-red-400"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium font-manrope flex-1">
            {error}
          </span>
          {!error.includes("sign in again") && (
            <button
              onClick={loadCards}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          )}
        </div>
      )}

      {cards.length === 0 ? (
        <div className="rounded-[26px] bg-neutral-800 px-6 py-14 text-center">
          <FileText className="w-7 h-7 text-neutral-400 mx-auto mb-4" />
          <div className="text-white font-grotesque font-semibold">
            No saved cards
          </div>
          <div className="font-manrope mt-1 text-sm text-neutral-500">
            Save a card during your next payment for faster checkout
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {cards.map((card) => {
            return (
              <div key={card.id} className="space-y-2">
                {/* Virtual bank card — Limes branded */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`relative overflow-hidden rounded-2xl border ${
                    card.isDefault
                      ? "border-[#ABFF63]/30 shadow-[0_0_40px_-12px_rgba(171,255,99,0.15)]"
                      : "border-white/[0.08]"
                  } p-4 sm:p-5 flex flex-col justify-between select-none transition-all duration-300 hover:shadow-xl`}
                  aria-label={`${card.brand} card ending in ${card.last4}${card.isDefault ? ", default payment method" : ""}`}
                  style={{
                    touchAction: "manipulation",
                    aspectRatio: "1.586 / 1",
                    background:
                      "linear-gradient(145deg, #1c1c1e 0%, #26252c 40%, #1a1920 100%)",
                  }}
                >
                  {/* Subtle lime-tinted shine sweep */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 38%, rgba(171,255,99,0.02) 44%, rgba(171,255,99,0.04) 50%, rgba(171,255,99,0.02) 56%, transparent 62%)",
                    }}
                  />

                  {/* Radial glow accents */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(ellipse at 15% 85%, rgba(171,255,99,0.04) 0%, transparent 50%), radial-gradient(ellipse at 85% 15%, rgba(255,255,255,0.03) 0%, transparent 50%)",
                    }}
                  />

                  {/* Top row: Chip + Contactless + Default badge */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* EMV Chip */}
                      <svg
                        width="36"
                        height="28"
                        viewBox="0 0 36 28"
                        fill="none"
                        className="drop-shadow-sm flex-shrink-0"
                        aria-hidden="true"
                      >
                        <rect
                          x="0.5"
                          y="0.5"
                          width="35"
                          height="27"
                          rx="4"
                          fill={`url(#chipGrad-${card.id})`}
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="0.5"
                        />
                        <line
                          x1="0"
                          y1="10"
                          x2="36"
                          y2="10"
                          stroke="rgba(180,160,100,0.3)"
                          strokeWidth="0.5"
                        />
                        <line
                          x1="0"
                          y1="18"
                          x2="36"
                          y2="18"
                          stroke="rgba(180,160,100,0.3)"
                          strokeWidth="0.5"
                        />
                        <line
                          x1="12"
                          y1="0"
                          x2="12"
                          y2="28"
                          stroke="rgba(180,160,100,0.3)"
                          strokeWidth="0.5"
                        />
                        <line
                          x1="24"
                          y1="0"
                          x2="24"
                          y2="28"
                          stroke="rgba(180,160,100,0.3)"
                          strokeWidth="0.5"
                        />
                        <defs>
                          <linearGradient
                            id={`chipGrad-${card.id}`}
                            x1="0"
                            y1="0"
                            x2="36"
                            y2="28"
                          >
                            <stop offset="0%" stopColor="#c9a84c" />
                            <stop offset="50%" stopColor="#f0d77b" />
                            <stop offset="100%" stopColor="#b8942e" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Contactless / NFC icon */}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-white/40"
                        aria-hidden="true"
                      >
                        <path
                          d="M6.5 17.5C4.5 15.5 4.5 12 6.5 10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10 15c-1-1-1-3 0-4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M3 20.5C-0.5 17-0.5 10.5 3 7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    {/* Default badge */}
                    {card.isDefault && (
                      <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-[#ABFF63] text-neutral-900 rounded-full shadow-lg shadow-[#ABFF63]/20 uppercase tracking-wider">
                        <Star className="w-3 h-3 fill-current" />
                        Default
                      </span>
                    )}
                  </div>

                  {/* Card number — hero */}
                  <div className="relative z-10 flex-1 flex items-center px-0.5 py-2">
                    <p className="font-mono text-sm sm:text-base text-white/90 tracking-[2px] sm:tracking-[4px]">
                      ••••{"  "}••••{"  "}••••{"  "}
                      <span className="text-white font-semibold tracking-[2px] sm:tracking-[4px]">
                        {card.last4}
                      </span>
                    </p>
                  </div>

                  {/* Bottom row: card holder / bank + expiry + brand logo */}
                  <div className="relative z-10 flex items-end justify-between gap-3">
                    {/* Left: Bank name + expiry stacked */}
                    <div className="min-w-0 flex-1">
                      {card.bank && (
                        <p className="font-manrope text-[10px] sm:text-[11px] text-white/40 uppercase tracking-[1.5px] truncate mb-1">
                          {card.bank}
                        </p>
                      )}
                      {card.expMonth && card.expYear && (
                        <div>
                          <p className="font-manrope text-[8px] text-white/30 uppercase tracking-[1px] leading-none mb-0.5">
                            Valid thru
                          </p>
                          <p className="font-mono text-sm sm:text-base text-white/70 tracking-[2px]">
                            {card.expMonth}/{card.expYear.slice(-2)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Brand logo */}
                    <div className="flex-shrink-0">
                      {(card.brand || card.cardType)
                        .toLowerCase()
                        .includes("visa") && (
                        <span
                          className="text-white/80 font-bold text-xl sm:text-2xl tracking-[2px] italic"
                          style={{ fontFamily: "serif" }}
                        >
                          VISA
                        </span>
                      )}
                      {(card.brand || card.cardType)
                        .toLowerCase()
                        .includes("master") && (
                        <div className="flex items-center -space-x-2">
                          <span className="w-[26px] h-[26px] sm:w-[30px] sm:h-[30px] rounded-full bg-[#eb001b]/90" />
                          <span className="w-[26px] h-[26px] sm:w-[30px] sm:h-[30px] rounded-full bg-[#f79e1b]/90" />
                        </div>
                      )}
                      {(card.brand || card.cardType)
                        .toLowerCase()
                        .includes("amex") && (
                        <span className="text-white/70 font-bold text-[11px] sm:text-xs tracking-[2px] leading-tight text-right">
                          AMERICAN
                          <br />
                          EXPRESS
                        </span>
                      )}
                      {!["visa", "master", "amex"].some((b) =>
                        (card.brand || card.cardType).toLowerCase().includes(b),
                      ) && (
                        <span className="text-white/50 font-bold text-xs tracking-[1px]">
                          {(card.brand || card.cardType).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Limes signature: lime green accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ABFF63]/40 to-transparent" />
                </motion.div>

                {/* Action buttons below card */}
                <div className="flex items-center gap-2 px-1">
                  {!card.isDefault && (
                    <button
                      onClick={() => handleSetDefaultCard(card.id)}
                      disabled={settingDefaultId === card.id}
                      className="flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold bg-white/5 text-neutral-300 rounded-xl hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.96] sm:px-3 sm:py-2"
                      title="Set as default payment method"
                      style={{ touchAction: "manipulation" }}
                    >
                      {settingDefaultId === card.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Star className="w-3.5 h-3.5" />
                      )}
                      <span>Set Default</span>
                    </button>
                  )}

                  {showChargeButton && chargeAmount && (
                    <button
                      onClick={() => handleChargeCard(card.id)}
                      disabled={chargingCardId === card.id}
                      className="flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold bg-[#ABFF63] text-neutral-900 rounded-xl hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.96] sm:px-3 sm:py-2"
                      style={{ touchAction: "manipulation" }}
                    >
                      {chargingCardId === card.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        `Pay R${chargeAmount}`
                      )}
                    </button>
                  )}

                  {confirmingDeleteId === card.id ? (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="text-[10px] text-neutral-500 font-manrope">
                        Delete?
                      </span>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        disabled={deletingCardId === card.id}
                        className="px-3 py-2 text-[11px] font-semibold bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 transition-all active:scale-[0.96]"
                        style={{ touchAction: "manipulation" }}
                      >
                        {deletingCardId === card.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Confirm"
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmingDeleteId(null)}
                        className="px-3 py-2 text-[11px] font-semibold bg-white/5 text-neutral-400 rounded-lg hover:bg-white/10 transition-all active:scale-[0.96]"
                        style={{ touchAction: "manipulation" }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingDeleteId(card.id)}
                      disabled={card.isDefault}
                      className="ml-auto p-2.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.96] sm:p-2"
                      style={{ touchAction: "manipulation" }}
                      title={
                        card.isDefault
                          ? "Cannot delete default card - set another card as default first"
                          : "Delete card"
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
