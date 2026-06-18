import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import TransactionList from './TransactionList'
import type { Transaction } from './dashboardTypes'

const mockTransactions: Transaction[] = [
  {
    id: '1',
    reference: 'REF001',
    amountInCents: 9900,
    amountInRands: 99,
    currency: 'ZAR',
    status: 'success',
    channel: 'card',
    paidAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    reference: 'REF002',
    amountInCents: 2900,
    amountInRands: 29,
    currency: 'ZAR',
    status: 'pending',
    channel: 'card',
    paidAt: '2024-01-14T08:00:00Z',
    createdAt: '2024-01-14T08:00:00Z',
  },
  {
    id: '3',
    reference: 'REF003',
    amountInCents: 16900,
    amountInRands: 169,
    currency: 'ZAR',
    status: 'failed',
    channel: 'bank',
    paidAt: '2024-01-13T14:00:00Z',
    createdAt: '2024-01-13T14:00:00Z',
  },
  {
    id: '4',
    reference: 'REF004',
    amountInCents: 49900,
    amountInRands: 499,
    currency: 'ZAR',
    status: 'success',
    channel: 'card',
    paidAt: '2024-01-12T09:15:00Z',
    createdAt: '2024-01-12T09:15:00Z',
  },
]

function getTransactionTypeLabel(t: Transaction): string {
  if (t.channel === 'card') return 'Card Payment'
  return 'Bank Payment'
}

const meta = {
  title: 'Dashboard/TransactionList',
  component: TransactionList,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TransactionList>

export default meta
type Story = StoryObj<typeof meta>

export const DefaultUnsorted: Story = {
  args: {
    transactions: mockTransactions,
    sortKey: null,
    sortDir: 'asc',
    onSort: fn(),
    getTransactionTypeLabel,
  },
}

export const SortedByAmountAsc: Story = {
  args: {
    transactions: mockTransactions,
    sortKey: 'amount',
    sortDir: 'asc',
    onSort: fn(),
    getTransactionTypeLabel,
  },
}

export const SortedByDateDesc: Story = {
  args: {
    transactions: mockTransactions,
    sortKey: 'date',
    sortDir: 'desc',
    onSort: fn(),
    getTransactionTypeLabel,
  },
}

export const SortedByStatus: Story = {
  args: {
    transactions: mockTransactions,
    sortKey: 'status',
    sortDir: 'asc',
    onSort: fn(),
    getTransactionTypeLabel,
  },
}

export const Empty: Story = {
  args: {
    transactions: [],
    sortKey: null,
    sortDir: 'asc',
    onSort: fn(),
    getTransactionTypeLabel,
  },
}
