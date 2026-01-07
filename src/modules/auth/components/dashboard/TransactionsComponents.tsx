import { useState } from 'react';
import type React from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { Transaction } from './dashboardTypes.ts';

interface StatusBadgeProps {
  status: Transaction['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusDotClass = () => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-400';
      case 'pending':
        return 'bg-yellow-400';
      case 'failed':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}
    >
      <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotClass()}`} />
      <span className="capitalize">{status}</span>
    </div>
  );
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  loading?: boolean;
  className?: string;
  onOpenFullView?: () => void;
}

export function TransactionHistory({ transactions, loading, className, onOpenFullView }: TransactionHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTransactionType = (transaction: Transaction) => {
    // Map payment channel to display type
    if (transaction.channel === 'card') {
      return `Card Payment`;
    }
    return 'Payment';
  };

  return (
    <div className={`bg-neutral-800 rounded-xl p-6 h-full border border-neutral-700 ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Recent Transaction History</h3>
        <button
          type="button"
          onClick={onOpenFullView}
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <span className="hidden sm:inline">View all</span>
          <ExternalLink className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between py-3">
              <div className="flex-1">
                <div className="h-4 bg-neutral-700 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-neutral-700 rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-neutral-700 rounded w-20"></div>
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-neutral-400">
          <p>No transactions yet</p>
        </div>
      ) : (
        <>
          {/* Desktop/tablet table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-neutral-500 text-sm border-b border-neutral-700/60">
                  <th className="text-left pb-3">
                    <div className="flex items-center space-x-1">
                      <span>Type</span>
                      <div className="flex flex-col">
                        <ChevronLeft className="w-3 h-3 rotate-90 text-neutral-400" />
                        <ChevronRight className="w-3 h-3 -rotate-90 text-neutral-400" />
                      </div>
                    </div>
                  </th>
                  <th className="text-left pb-3">
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <div className="flex flex-col">
                        <ChevronLeft className="w-3 h-3 rotate-90 text-neutral-400" />
                        <ChevronRight className="w-3 h-3 -rotate-90 text-neutral-400" />
                      </div>
                    </div>
                  </th>
                  <th className="text-left pb-3">
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      <div className="flex flex-col">
                        <ChevronLeft className="w-3 h-3 rotate-90 text-neutral-400" />
                        <ChevronRight className="w-3 h-3 -rotate-90 text-neutral-400" />
                      </div>
                    </div>
                  </th>
                  <th className="text-right pb-3">
                    <div className="flex items-center justify-end space-x-1">
                      <span>Amount</span>
                      <div className="flex flex-col">
                        <ChevronLeft className="w-3 h-3 rotate-90 text-neutral-400" />
                        <ChevronRight className="w-3 h-3 -rotate-90 text-neutral-400" />
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((transaction, index) => (
                  <tr key={transaction.id} className={index > 0 ? 'border-t border-neutral-800' : ''}>
                    <td className="py-3 text-white text-sm">{getTransactionType(transaction)}</td>
                    <td className="py-3">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="py-3 text-neutral-400 text-sm">{formatDate(transaction.paidAt || transaction.createdAt)}</td>
                    <td className="py-3 text-sm text-right font-medium text-lime-400">
                      +R{transaction.amountInRands.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked view */}
          <div className="space-y-3 md:hidden">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="rounded-xl border border-neutral-700 bg-neutral-900/40 px-4 py-3 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{getTransactionType(transaction)}</span>
                    <StatusBadge status={transaction.status} />
                  </div>
                  <div className="mt-1 text-xs text-neutral-400">{formatDate(transaction.paidAt || transaction.createdAt)}</div>
                </div>
                <div className="text-sm font-semibold text-lime-400">
                  +R{transaction.amountInRands.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface TransactionsModalProps {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export function TransactionsModal({ open, onClose, transactions }: TransactionsModalProps) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));

  const startIndex = (page - 1) * pageSize;
  const pageItems = transactions.slice(startIndex, startIndex + pageSize);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTransactionType = (transaction: Transaction) => {
    if (transaction.channel === 'card') {
      return `Card Payment`;
    }
    return 'Payment';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-3xl mx-0 sm:mx-4 rounded-2xl bg-neutral-900 text-white shadow-2xl max-h-[82vh] sm:max-h-[85vh] flex flex-col border border-neutral-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 sticky top-0 bg-neutral-900 z-10 rounded-t-2xl">
          <div>
            <h2 className="font-extrabold text-lg">All Transactions</h2>
            <p className="text-xs sm:text-sm text-neutral-400">A detailed view of your recent activity.</p>
          </div>
          <button
            aria-label="Close"
            className="size-10 grid place-items-center rounded-lg text-neutral-400 hover:bg-neutral-800 text-2xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-5 pt-4 pb-5 space-y-4">
            {/* Desktop/tablet table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-neutral-500 text-sm border-b border-neutral-800">
                    <th className="text-left pb-3">Type</th>
                    <th className="text-left pb-3">Status</th>
                    <th className="text-left pb-3">Date</th>
                    <th className="text-right pb-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((transaction, index) => (
                    <tr key={transaction.id} className={index > 0 ? 'border-t border-neutral-800' : ''}>
                      <td className="py-3 text-sm text-white">{getTransactionType(transaction)}</td>
                      <td className="py-3">
                        <StatusBadge status={transaction.status} />
                      </td>
                      <td className="py-3 text-sm text-neutral-400">{formatDate(transaction.paidAt || transaction.createdAt)}</td>
                      <td className="py-3 text-sm text-right font-semibold text-lime-400">
                        +R{transaction.amountInRands.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked list */}
            <div className="space-y-3 md:hidden">
              {pageItems.map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-xl border border-neutral-700 bg-neutral-900/60 px-4 py-3 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{getTransactionType(transaction)}</span>
                      <StatusBadge status={transaction.status} />
                    </div>
                    <div className="mt-1 text-xs text-neutral-400">{formatDate(transaction.paidAt || transaction.createdAt)}</div>
                  </div>
                  <div className="text-sm font-semibold text-lime-400">
                    +R{transaction.amountInRands.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
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
              <div className="text-xs sm:text-sm text-neutral-400">
                Page <span className="font-semibold text-white">{page}</span> of{' '}
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
