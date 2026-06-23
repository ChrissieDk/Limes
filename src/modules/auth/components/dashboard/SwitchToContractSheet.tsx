import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { X } from "lucide-react";

interface SwitchToContractSheetProps {
  open: boolean;
  onClose: () => void;
  msisdn: string;
  productId: string;
  onConfirm: (msisdn: string, productId: string) => void | Promise<void>;
}

const DISMISS_THRESHOLD = 100;
const MAX_DRAG = 250;
const CONFIRM_TIMEOUT_MS = 30_000;

/**
 * Mobile-native bottom sheet for switching from Prepaid to Subscription.
 *
 * Portaled to document.body to avoid CSS transform containment.
 */
export default function SwitchToContractSheet({
  open,
  onClose,
  msisdn,
  productId,
  onConfirm,
}: SwitchToContractSheetProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sheetY = useMotionValue(0);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);

  const resetState = useCallback(() => {
    setIsSuccess(false);
    setIsLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (open) {
      sheetY.set(0);
      resetState();
    }
  }, [open, sheetY, resetState]);

  // Lock body scroll and notify tab bar.
  // Preserve scrollbar width to prevent layout shift.
  useEffect(() => {
    if (open) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      window.dispatchEvent(new CustomEvent("sheet:open"));

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        window.dispatchEvent(new CustomEvent("sheet:close"));
      };
    }
  }, [open]);

  // Android back button — closes the sheet instead of navigating away
  useEffect(() => {
    if (!open) return;

    window.history.pushState({ sheet: true }, "");

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [open, onClose]);

  const backdropOpacity = useTransform(sheetY, [0, MAX_DRAG], [1, 0]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    dragStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current) return;
      const diff = e.touches[0].clientY - dragStartY.current;
      if (diff > 0) {
        if (e.cancelable) e.preventDefault();
        sheetY.set(Math.min(diff, MAX_DRAG));
      }
    },
    [sheetY],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const offset = sheetY.get();
    if (offset > DISMISS_THRESHOLD) {
      await animate(sheetY, MAX_DRAG, {
        type: "spring",
        stiffness: 300,
        damping: 30,
        onComplete: () => {
          onClose();
        },
      });
    } else {
      animate(sheetY, 0, { type: "spring", stiffness: 400, damping: 35 });
    }
  }, [sheetY, onClose]);

  const handleConfirm = async () => {
    if (!msisdn || !productId) return;

    setIsLoading(true);
    setError(null);

    try {
      const timeout = new Promise<{ timedOut: true }>((resolve) =>
        setTimeout(() => resolve({ timedOut: true }), CONFIRM_TIMEOUT_MS),
      );
      const result = await Promise.race([
        Promise.resolve(onConfirm(msisdn, productId)),
        timeout,
      ]);
      if (result && typeof result === "object" && "timedOut" in result) {
        throw new Error("Request timed out — please try again");
      }
      setIsSuccess(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to switch to subscription",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = () => {
    resetState();
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[60]">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ opacity: backdropOpacity }}
          onClick={onClose}
        />

        {/* Sheet */}
        <motion.div
          className="absolute bottom-0 inset-x-0 max-h-[85vh] rounded-t-2xl bg-neutral-900 flex flex-col overflow-hidden shadow-2xl"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          style={{ y: sheetY }}
        >
          {/* Drag handle */}
          <div
            className="flex-shrink-0 pt-3 pb-2 flex justify-center select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              minHeight: 44,
              cursor: isLoading ? "default" : "grab",
            }}
            aria-hidden
          >
            <div className="w-10 h-1 rounded-full bg-neutral-600" />
          </div>

          {/* Header */}
          <div className="flex-shrink-0 flex items-start justify-between px-5 pb-3">
            <div>
              <h2 className="font-grotesque font-extrabold text-lg text-white">
                Switch to Subscription
              </h2>
              <p className="font-manrope text-xs text-neutral-400">
                Upgrade your SIM from Prepaid to Subscription
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="size-11 grid place-items-center rounded-xl text-neutral-400 hover:bg-neutral-800 active:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
            {isSuccess ? (
              <div className="flex flex-col items-center pt-6 pb-4 text-center">
                <img
                  src={`${import.meta.env.BASE_URL}images/favicon.svg`}
                  alt="Limes"
                  className="w-14 h-14 mb-4"
                />
                <h3 className="font-grotesque text-xl font-semibold text-white">
                  Upgrade in progress!
                </h3>
                <p className="font-manrope mt-2 text-sm text-neutral-400 leading-relaxed max-w-xs">
                  Your SIM{" "}
                  <span className="font-semibold text-white">{msisdn}</span> is
                  being upgraded to Subscription. This may take a few moments to
                  complete.
                </p>
                <button
                  type="button"
                  onClick={handleDone}
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-[#ABFF63] px-12 text-sm font-semibold text-neutral-900 hover:brightness-95 active:scale-[0.98] transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-manrope text-sm text-neutral-400">
                      SIM Number
                    </span>
                    <span className="font-manrope text-sm font-semibold text-white">
                      {msisdn}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-manrope text-sm text-neutral-400">
                      Target Subscription ID
                    </span>
                    <span className="font-manrope text-[13px] font-semibold text-white break-all text-right max-w-[180px]">
                      {productId}
                    </span>
                  </div>
                </div>

                <p className="font-manrope text-sm text-neutral-400 leading-relaxed">
                  You are about to switch this SIM from Prepaid to Subscription.
                  Your monthly billing will begin once the upgrade is processed.
                </p>

                {error && (
                  <p
                    role="alert"
                    className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-3"
                  >
                    {error}
                  </p>
                )}

                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!msisdn || !productId || isLoading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#FDDA36] px-12 text-sm font-semibold text-neutral-900 hover:brightness-95 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="inline-block size-4 border-2 border-neutral-900/30 border-t-neutral-900 rounded-full animate-spin"
                          aria-hidden
                        />
                        Processing…
                      </>
                    ) : (
                      "Confirm Upgrade"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Safe area bottom padding */}
          <div
            className="flex-shrink-0 bg-neutral-900"
            style={{
              height: "env(safe-area-inset-bottom, 0px)",
              minHeight: 0,
            }}
          />
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
