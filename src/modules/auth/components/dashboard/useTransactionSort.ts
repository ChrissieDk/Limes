import { useState, useMemo } from 'react'
import type { Transaction } from './dashboardTypes'

export type TransactionSortKey = 'type' | 'status' | 'date' | 'amount'
export type SortDirection = 'asc' | 'desc'

function getTransactionTypeLabel(transaction: Transaction): string {
  if (transaction.channel === 'card') return 'Card Payment'
  return 'Payment'
}

function sortTransactions(items: Transaction[], key: TransactionSortKey, dir: SortDirection): Transaction[] {
  const factor = dir === 'asc' ? 1 : -1
  return [...items].sort((a, b) => {
    let cmp = 0
    switch (key) {
      case 'type':
        cmp = getTransactionTypeLabel(a).localeCompare(getTransactionTypeLabel(b))
        break
      case 'status':
        cmp = a.status.localeCompare(b.status)
        break
      case 'date': {
        const ta = new Date(a.paidAt || a.createdAt).getTime()
        const tb = new Date(b.paidAt || b.createdAt).getTime()
        cmp = ta - tb
        break
      }
      case 'amount':
        cmp = a.amountInRands - b.amountInRands
        break
    }
    return cmp * factor
  })
}

export function useTransactionSort(transactions: Transaction[]) {
  const [sortKey, setSortKey] = useState<TransactionSortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>('asc')

  const handleSort = (key: TransactionSortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = useMemo(() => {
    if (sortKey === null) return transactions
    return sortTransactions(transactions, sortKey, sortDir)
  }, [transactions, sortKey, sortDir])

  return { sortKey, sortDir, handleSort, sorted, getTransactionTypeLabel }
}
