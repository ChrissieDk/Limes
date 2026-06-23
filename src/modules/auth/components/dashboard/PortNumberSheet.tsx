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

interface PortNumberSheetProps {
  open: boolean;
  onClose: () => void;
  currentMsisdn: string;
  onConfirm: (
    limesMsisdn: string,
    numberToPortFrom: string,
  ) => void | Promise<void>;
}

const DISMISS_THRESHOLD = 100;
const MAX_DRAG = 250;
const CONFIRM_TIMEOUT_MS = 30_000;

/**
 * Mobile-native bottom sheet for porting a number to Limes.
 *
 * Portaled to document.body to avoid CSS transform containment.
 */
export default function PortNumberSheet({
  open,
  onClose,
  currentMsisdn,
  onConfirm,
}: PortNumberSheetProps) {
  const [limesMsisdn, setLimesMsisdn] = useState("");
  const [numberToPortFrom, setNumberToPortFrom] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sheetY = useMotionValue(0);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const resetState = useCallback(() => {
    setLimesMsisdn("");
    setNumberToPortFrom("");
    setIsSuccess(false);
    setIsLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (open) {
      sheetY.set(0);
      resetState();
      setLimesMsisdn(currentMsisdn);
    }
  }, [open, sheetY, resetState, currentMsisdn]);

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

  // Keyboard avoidance — track virtual keyboard height on mobile
  useEffect(() => {
    if (!open || !window.visualViewport) return;

    const handleResize = () => {
      const viewport = window.visualViewport!;
      const height = window.innerHeight - viewport.height;
      setKeyboardHeight(Math.max(0, height));
    };

    window.visualViewport.addEventListener("resize", handleResize);
    window.visualViewport.addEventListener("scroll", handleResize);
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
    };
  }, [open]);

  // Scroll input into view when focused (keyboard open)
  const handleInputFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      // Delay to let the keyboard animation start
      setTimeout(() => {
        e.target.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 300);
    },
    [],
  );

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
    const trimmedLimes = limesMsisdn.trim();
    const trimmedPortFrom = numberToPortFrom.trim();
    if (!trimmedLimes || !trimmedPortFrom) return;

    setIsLoading(true);
    setError(null);

    try {
      const timeout = new Promise<{ timedOut: true }>((resolve) =>
        setTimeout(() => resolve({ timedOut: true }), CONFIRM_TIMEOUT_MS),
      );
      const result = await Promise.race([
        Promise.resolve(onConfirm(trimmedLimes, trimmedPortFrom)),
        timeout,
      ]);
      if (result && typeof result === "object" && "timedOut" in result) {
        throw new Error("Request timed out — please try again");
      }
      setIsSuccess(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to submit porting request",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = () => {
    resetState();
    onClose();
  };

  const canConfirm =
    limesMsisdn.trim().length > 0 &&
    numberToPortFrom.trim().length > 0 &&
    !isLoading;

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
                Port your number
              </h2>
              <p className="font-manrope text-xs text-neutral-400">
                Enter your Limes number and the number to port from
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
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto overscroll-contain px-5"
            style={{ paddingBottom: Math.max(keyboardHeight, 24) }}
          >
            {isSuccess ? (
              <div className="flex flex-col items-center pt-6 pb-4 text-center">
                <img
                  src={`${import.meta.env.BASE_URL}images/favicon.svg`}
                  alt="Limes"
                  className="w-14 h-14 mb-4"
                />
                <h3 className="font-grotesque text-xl font-semibold text-white">
                  Success!
                </h3>
                <p className="font-manrope mt-2 text-sm text-neutral-400 leading-relaxed max-w-xs">
                  Your porting request has been submitted. Porting can take
                  between 24 and 48 hours.
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
                <div>
                  <label
                    htmlFor="port-sheet-limes-msisdn"
                    className="font-manrope block text-sm text-neutral-300 font-medium mb-2"
                  >
                    1. Limes number to port to (your current Limes SIM)
                  </label>
                  <input
                    id="port-sheet-limes-msisdn"
                    type="tel"
                    value={limesMsisdn}
                    onChange={(e) => setLimesMsisdn(e.target.value)}
                    placeholder="098 898 8989"
                    className="w-full h-12 rounded-2xl bg-white/10 border border-white/10 px-5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ABFF63]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                    onFocus={handleInputFocus}
                  />
                </div>

                <div>
                  <label
                    htmlFor="port-sheet-from-msisdn"
                    className="font-manrope block text-sm text-neutral-300 font-medium mb-2"
                  >
                    2. Number you're porting from (your number at another
                    provider)
                  </label>
                  <input
                    id="port-sheet-from-msisdn"
                    type="tel"
                    value={numberToPortFrom}
                    onChange={(e) => setNumberToPortFrom(e.target.value)}
                    placeholder="082 323 4500"
                    className="w-full h-12 rounded-2xl bg-white/10 border border-white/10 px-5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ABFF63]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                    onFocus={handleInputFocus}
                    aria-invalid={!!error}
                    aria-describedby={error ? "port-sheet-error" : undefined}
                  />
                </div>

                {error && (
                  <p
                    id="port-sheet-error"
                    className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-3"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#ABFF63] px-12 text-sm font-semibold text-neutral-900 hover:brightness-95 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="inline-block size-4 border-2 border-neutral-900/30 border-t-neutral-900 rounded-full animate-spin"
                          aria-hidden
                        />
                        Submitting…
                      </>
                    ) : (
                      "Confirm"
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
