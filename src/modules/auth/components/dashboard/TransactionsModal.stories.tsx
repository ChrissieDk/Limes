import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import { TransactionsModal } from './TransactionsComponents'
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
  {
    id: '7',
    reference: 'REF007',
    amountInCents: 34900,
    amountInRands: 349,
    currency: 'ZAR',
    status: 'success',
    channel: 'card',
    paidAt: '2024-01-09T08:30:00Z',
    createdAt: '2024-01-09T08:30:00Z',
  },
  {
    id: '8',
    reference: 'REF008',
    amountInCents: 12900,
    amountInRands: 129,
    currency: 'ZAR',
    status: 'failed',
    channel: 'card',
    paidAt: '2024-01-08T14:00:00Z',
    createdAt: '2024-01-08T14:00:00Z',
  },
  {
    id: '9',
    reference: 'REF009',
    amountInCents: 24900,
    amountInRands: 249,
    currency: 'ZAR',
    status: 'success',
    channel: 'bank',
    paidAt: '2024-01-07T10:00:00Z',
    createdAt: '2024-01-07T10:00:00Z',
  },
  {
    id: '10',
    reference: 'REF010',
    amountInCents: 59900,
    amountInRands: 599,
    currency: 'ZAR',
    status: 'pending',
    channel: 'card',
    paidAt: '2024-01-06T16:30:00Z',
    createdAt: '2024-01-06T16:30:00Z',
  },
  {
    id: '11',
    reference: 'REF011',
    amountInCents: 8900,
    amountInRands: 89,
    currency: 'ZAR',
    status: 'success',
    channel: 'card',
    paidAt: '2024-01-05T12:00:00Z',
    createdAt: '2024-01-05T12:00:00Z',
  },
  {
    id: '12',
    reference: 'REF012',
    amountInCents: 44900,
    amountInRands: 449,
    currency: 'ZAR',
    status: 'failed',
    channel: 'card',
    paidAt: '2024-01-04T09:45:00Z',
    createdAt: '2024-01-04T09:45:00Z',
  },
]

const meta = {
  title: 'Dashboard/TransactionsModal',
  component: TransactionsModal,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
} satisfies Meta<typeof TransactionsModal>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    open: true,
    onClose: fn(),
    transactions: mockTransactions,
  },
}

export const SinglePage: Story = {
  args: {
    open: true,
    onClose: fn(),
    transactions: mockTransactions.slice(0, 5),
  },
}

export const Empty: Story = {
  args: {
    open: true,
    onClose: fn(),
    transactions: [],
  },
}
