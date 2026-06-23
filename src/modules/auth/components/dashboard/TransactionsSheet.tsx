import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { X } from "lucide-react";
import type { Transaction } from "./dashboardTypes";
import { TransactionHistory } from "./TransactionsComponents";

interface TransactionsSheetProps {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
  loading?: boolean;
}

const DISMISS_THRESHOLD = 100;
const MAX_DRAG = 250;

/**
 * Mobile-native bottom sheet for transactions.
 *
 * Portaled to document.body to avoid CSS transform containment
 * from the page-enter animation wrapper.
 */
export default function TransactionsSheet({
  open,
  onClose,
  transactions,
  loading = false,
}: TransactionsSheetProps) {
  const sheetY = useMotionValue(0);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);

  // Reset Y when sheet opens
  useEffect(() => {
    if (open) {
      sheetY.set(0);
    }
  }, [open, sheetY]);

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

  // Backdrop opacity tracks drag progress
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
          className="absolute bottom-0 inset-x-0 max-h-[90vh] rounded-t-2xl bg-neutral-900 flex flex-col overflow-hidden shadow-2xl"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          style={{ y: sheetY }}
        >
          {/* Drag handle */}
          <div
            className="flex-shrink-0 pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing touch-none select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ minHeight: 44 }}
          >
            <div className="w-10 h-1 rounded-full bg-neutral-600" />
          </div>

          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 pb-3">
            <div>
              <h2 className="font-grotesque font-extrabold text-lg text-white">
                Transactions
              </h2>
              <p className="font-manrope text-xs text-neutral-400">
                Your recent payment activity
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="size-11 grid place-items-center rounded-xl text-neutral-400 hover:bg-neutral-800 active:bg-neutral-700 transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {loading ? (
              <div className="px-5 py-2 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl border border-white/5 px-4 py-3 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="h-4 bg-neutral-800 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-neutral-800 rounded w-1/4" />
                    </div>
                    <div className="h-4 bg-neutral-800 rounded w-16" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <svg
                    className="w-7 h-7 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <h3 className="font-grotesque text-white text-base font-semibold">
                  No transactions yet
                </h3>
                <p className="font-manrope mt-1 text-sm text-neutral-400 max-w-xs">
                  When you make a payment or purchase a bundle, it will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="px-4 pb-8">
                <TransactionHistory
                  transactions={transactions}
                  infiniteScroll
                  hideHeader
                  className="!rounded-none !border-0"
                />
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
