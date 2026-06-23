import { useState, useRef, useCallback, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface Props {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  /** Pull distance in px before refresh triggers. Default 80. */
  threshold?: number;
}

/**
 * Pull-to-refresh wrapper for mobile content areas.
 * Detects vertical drag, shows an animated arrow → spinner indicator,
 * and calls `onRefresh` when released past the threshold.
 *
 * Framer-motion powered. No external dependencies.
 */
export default function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
}: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const pullY = useMotionValue(0);
  const pullStartY = useRef(0);
  const isPulling = useRef(false);

  const arrowOpacity = useTransform(pullY, [0, threshold], [0, 1]);
  const arrowRotate = useTransform(pullY, [0, threshold], [0, 180]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (refreshing) return;
      // Only allow pull-to-refresh if we are at the very top of the page
      if (window.scrollY > 0) return;
      pullStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    },
    [refreshing],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling.current || refreshing) return;
      const diff = e.touches[0].clientY - pullStartY.current;
      if (diff > 0) {
        // Prevent scroll when pulling down
        if (e.cancelable) e.preventDefault();
        pullY.set(Math.min(diff * 0.4, threshold + 20));
      }
    },
    [refreshing, pullY, threshold],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || refreshing) return;
    isPulling.current = false;

    const distance = pullY.get();
    if (distance >= threshold) {
      setRefreshing(true);
      animate(pullY, threshold, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        animate(pullY, 0, { type: "spring", stiffness: 300, damping: 30 });
      }
    } else {
      animate(pullY, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  }, [refreshing, pullY, onRefresh, threshold]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      <motion.div style={{ y: pullY }} className="relative">
        {/* Pull indicator — hidden above viewport when idle */}
        <div className="flex justify-center pb-2">
          <motion.div style={{ opacity: refreshing ? 1 : arrowOpacity }}>
            {refreshing ? (
              <div className="size-6 rounded-full border-2 border-[#ABFF63] border-t-transparent animate-spin" />
            ) : (
              <motion.svg
                className="size-5 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                style={{ rotate: arrowRotate }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </motion.svg>
            )}
          </motion.div>
        </div>

        {children}
      </motion.div>
    </div>
  );
}
