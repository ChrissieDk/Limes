import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import type { Transaction } from "./dashboardTypes";
import { useTransactionSort } from "./useTransactionSort";
import TransactionList from "./TransactionList";

interface StatusBadgeProps {
  status: Transaction["status"];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, { text: string; bg: string; dot: string }> = {
    success: {
      text: "text-green-400",
      bg: "bg-green-400/10",
      dot: "bg-green-400",
    },
    pending: {
      text: "text-yellow-400",
      bg: "bg-yellow-400/10",
      dot: "bg-yellow-400",
    },
    failed: { text: "text-red-400", bg: "bg-red-400/10", dot: "bg-red-400" },
  };
  const s = styles[status.toLowerCase()] || {
    text: "text-gray-400",
    bg: "bg-gray-400/10",
    dot: "bg-gray-400",
  };
  return (
    <div
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${s.text} ${s.bg}`}
    >
      <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
      <span className="capitalize">{status}</span>
    </div>
  );
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  loading?: boolean;
  className?: string;
  onOpenFullView?: () => void;
  infiniteScroll?: boolean;
  /** Strip container chrome and header — caller provides its own. */
  hideHeader?: boolean;
}

const PAGE_SIZE = 10;

export function TransactionHistory({
  transactions,
  loading,
  className,
  onOpenFullView,
  infiniteScroll = false,
  hideHeader = false,
}: TransactionHistoryProps) {
  const { sortKey, sortDir, handleSort, sorted, getTransactionTypeLabel } =
    useTransactionSort(transactions);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = infiniteScroll && visibleCount < sorted.length;
  const visibleTransactions = infiniteScroll
    ? sorted.slice(0, visibleCount)
    : sorted.slice(0, 5);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, sorted.length));
  }, [sorted.length]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sorted.length]);

  useEffect(() => {
    if (!infiniteScroll || !hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "100px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [infiniteScroll, hasMore, loadMore]);

  const LoadMoreButton = () => (
    <button
      onClick={loadMore}
      className="w-full py-2.5 rounded-xl bg-white/5 text-neutral-400 text-sm font-medium hover:bg-white/10 transition-colors"
    >
      Load more
    </button>
  );

  return (
    <div
      className={`${hideHeader ? "" : "rounded-2xl border border-white/10"} ${infiniteScroll && !hideHeader ? "" : hideHeader ? "" : "bg-neutral-800 p-3 md:p-6 h-full border-neutral-700"} ${className ?? ""}`}
    >
      {!hideHeader && (
        <div
          className={`flex items-center justify-between ${infiniteScroll ? "px-4 pt-4 pb-2" : "mb-4 md:mb-6"}`}
        >
          <h3 className="font-grotesque text-white font-semibold text-base md:text-lg">
            {infiniteScroll ? "Transactions" : "Recent Transaction History"}
          </h3>
          {onOpenFullView && (
            <button
              type="button"
              onClick={onOpenFullView}
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors"
            >
              <span className="hidden sm:inline">View all</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className={infiniteScroll && !hideHeader ? "px-4" : ""}>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse flex items-center justify-between py-3"
              >
                <div className="flex-1">
                  <div className="h-4 bg-neutral-700 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-neutral-700 rounded w-1/4" />
                </div>
                <div className="h-4 bg-neutral-700 rounded w-20" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <p>No transactions yet</p>
          </div>
        ) : (
          <>
            <TransactionList
              transactions={visibleTransactions}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              getTransactionTypeLabel={getTransactionTypeLabel}
              mobileCardClass="rounded-xl border border-white/5 px-4 py-3"
              hideSortHeaders={infiniteScroll}
            />
            {infiniteScroll && (
              <div ref={sentinelRef} className="pb-4 pt-2">
                {hasMore && <LoadMoreButton />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface TransactionsModalProps {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export function TransactionsModal({
  open,
  onClose,
  transactions,
}: TransactionsModalProps) {
  const [page, setPage] = useState(1);
  const { sortKey, sortDir, handleSort, sorted, getTransactionTypeLabel } =
    useTransactionSort(transactions);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pageItems = sorted.slice(startIndex, startIndex + pageSize);
  useEffect(() => {
    setPage(1);
  }, [sortKey, sortDir]);
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [sorted.length, totalPages]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-3xl mx-0 sm:mx-4 rounded-2xl bg-neutral-900 text-white shadow-2xl max-h-[82vh] sm:max-h-[85vh] flex flex-col border border-neutral-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 sticky top-0 bg-neutral-900 z-10 rounded-t-2xl">
          <div>
            <h2 className="font-grotesque font-extrabold text-lg">
              All Transactions
            </h2>
            <p className="font-manrope text-xs sm:text-sm text-neutral-400">
              A detailed view of your recent activity.
            </p>
          </div>
          <button
            aria-label="Close"
            className="size-10 grid place-items-center rounded-lg text-neutral-400 hover:bg-neutral-800 text-2xl"
            onClick={onClose}
          >
            x
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-5 pt-4 pb-5 space-y-4">
            <TransactionList
              transactions={pageItems}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              getTransactionTypeLabel={getTransactionTypeLabel}
              mobileCardClass="rounded-xl border border-neutral-700 bg-neutral-900/60 px-4 py-3"
            />
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs sm:text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <div className="font-manrope text-xs sm:text-sm text-neutral-400">
                Page <span className="font-semibold text-white">{page}</span> of{" "}
                <span className="font-semibold text-white">{totalPages}</span>
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs sm:text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
