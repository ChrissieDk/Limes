import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import { TransactionHistory } from './TransactionsComponents'
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
  {
    id: '5',
    reference: 'REF005',
    amountInCents: 7900,
    amountInRands: 79,
    currency: 'ZAR',
    status: 'success',
    channel: 'card',
    paidAt: '2024-01-11T16:45:00Z',
    createdAt: '2024-01-11T16:45:00Z',
  },
  {
    id: '6',
    reference: 'REF006',
    amountInCents: 19900,
    amountInRands: 199,
    currency: 'ZAR',
    status: 'pending',
    channel: 'bank',
    paidAt: '2024-01-10T11:00:00Z',
    createdAt: '2024-01-10T11:00:00Z',
  },
]

const meta = {
  title: 'Dashboard/TransactionHistory',
  component: TransactionHistory,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TransactionHistory>

export default meta
type Story = StoryObj<typeof meta>

export const WithTransactions: Story = {
  args: {
    transactions: mockTransactions,
    onOpenFullView: fn(),
  },
}

export const Loading: Story = {
  args: {
    transactions: [],
    loading: true,
    onOpenFullView: fn(),
  },
}

export const Empty: Story = {
  args: {
    transactions: [],
    onOpenFullView: fn(),
  },
}

export const SingleTransaction: Story = {
  args: {
    transactions: mockTransactions.slice(0, 1),
    onOpenFullView: fn(),
  },
}
