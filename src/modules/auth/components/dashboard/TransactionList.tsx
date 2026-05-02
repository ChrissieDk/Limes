import { formatDate } from '../../../../utils/dateFormat'
import { StatusBadge } from './TransactionsComponents'
import type { Transaction } from './dashboardTypes'
import type { TransactionSortKey, SortDirection } from './useTransactionSort'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface SortableHeaderProps {
  label: string
  columnKey: TransactionSortKey
  activeKey: TransactionSortKey | null
  direction: SortDirection
  onSort: (key: TransactionSortKey) => void
}

function SortableHeader({ label, columnKey, activeKey, direction, onSort }: SortableHeaderProps) {
  const active = activeKey === columnKey
  return (
    <button
      type="button"
      onClick={() => onSort(columnKey)}
      className={`group inline-flex cursor-pointer items-center gap-1.5 font-inherit text-sm select-none transition-colors ${
        active ? 'text-neutral-200' : 'text-neutral-500 hover:text-neutral-300'
      }`}
    >
      <span>{label}</span>
      <span className="flex flex-col leading-none" aria-hidden>
        {active ? (
          direction === 'asc' ? (
            <ChevronUp className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
          )
        ) : (
          <span className="flex flex-col opacity-60 group-hover:opacity-90">
            <ChevronUp className="w-3 h-3 -mb-1 shrink-0" />
            <ChevronDown className="w-3 h-3 shrink-0" />
          </span>
        )}
      </span>
    </button>
  )
}

interface TransactionListProps {
  transactions: Transaction[]
  sortKey: TransactionSortKey | null
  sortDir: SortDirection
  onSort: (key: TransactionSortKey) => void
  getTransactionTypeLabel: (t: Transaction) => string
  mobileCardClass?: string
}

export default function TransactionList({
  transactions,
  sortKey,
  sortDir,
  onSort,
  getTransactionTypeLabel,
  mobileCardClass = 'rounded-lg border border-neutral-700 bg-neutral-900/40 px-3 py-2.5',
}: TransactionListProps) {
  return (
    <>
      {/* Desktop/tablet table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-sm border-b border-neutral-700/60">
              <th className="text-left pb-3 font-medium">
                <SortableHeader label="Type" columnKey="type" activeKey={sortKey} direction={sortDir} onSort={onSort} />
              </th>
              <th className="text-left pb-3 font-medium">
                <SortableHeader label="Status" columnKey="status" activeKey={sortKey} direction={sortDir} onSort={onSort} />
              </th>
              <th className="text-left pb-3 font-medium">
                <SortableHeader label="Date" columnKey="date" activeKey={sortKey} direction={sortDir} onSort={onSort} />
              </th>
              <th className="text-right pb-3 font-medium">
                <div className="flex justify-end w-full">
                  <SortableHeader label="Amount" columnKey="amount" activeKey={sortKey} direction={sortDir} onSort={onSort} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={transaction.id} className={index > 0 ? 'border-t border-neutral-800' : ''}>
                <td className="py-3 text-sm text-white">{getTransactionTypeLabel(transaction)}</td>
                <td className="py-3">
                  <StatusBadge status={transaction.status} />
                </td>
                <td className="py-3 text-neutral-400 text-sm">
                  {formatDate(transaction.paidAt || transaction.createdAt)}
                </td>
                <td className="py-3 text-sm text-right font-medium text-lime-400">
                  +R{transaction.amountInRands.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked view */}
      <div className="space-y-2 md:hidden">
        {transactions.map((transaction) => (
          <div key={transaction.id} className={`${mobileCardClass} flex items-start justify-between gap-3`}>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">{getTransactionTypeLabel(transaction)}</div>
              <div className="font-manrope mt-1 text-xs text-neutral-400">
                {formatDate(transaction.paidAt || transaction.createdAt)}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="font-grotesque text-sm font-semibold text-lime-400 whitespace-nowrap">
                +R{transaction.amountInRands.toFixed(2)}
              </div>
              <StatusBadge status={transaction.status} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
