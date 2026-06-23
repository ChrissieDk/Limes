import type { Meta, StoryObj } from '@storybook/react-vite'
import { vi } from 'vitest'
import SavedCards from './SavedCards'
import type { SavedCard } from '../../../types/payment'

// Mock paymentService so stories don't make real API calls
vi.mock('../services/paymentService', () => ({
  paymentService: {
    getSavedCards: vi.fn(),
    deleteSavedCard: vi.fn(),
    setDefaultCard: vi.fn(),
    chargeSavedCard: vi.fn(),
  },
}))

vi.mock('../../../lib/sentry-logger', () => ({
  log: { info: vi.fn(), error: vi.fn() },
}))

vi.mock('../../analytics/services/analyticsService', () => ({
  trackPurchase: vi.fn(),
}))

const { paymentService } = await import('../services/paymentService')

const mockCards: SavedCard[] = [
  {
    id: 'card-1',
    cardType: 'visa',
    last4: '4242',
    expMonth: '12',
    expYear: '2028',
    bank: 'Test Bank',
    brand: 'Visa',
    isDefault: true,
  },
  {
    id: 'card-2',
    cardType: 'mastercard',
    last4: '1234',
    expMonth: '06',
    expYear: '2027',
    bank: 'Another Bank',
    brand: 'Mastercard',
    isDefault: false,
  },
  {
    id: 'card-3',
    cardType: 'amex',
    last4: '0005',
    expMonth: '09',
    expYear: '2029',
    bank: 'Amex Bank',
    brand: 'American Express',
    isDefault: false,
  },
]

const meta = {
  title: 'Payment/SavedCards',
  component: SavedCards,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
} satisfies Meta<typeof SavedCards>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  beforeEach: () => {
    vi.mocked(paymentService.getSavedCards).mockResolvedValue(mockCards)
  },
}

export const Empty: Story = {
  beforeEach: () => {
    vi.mocked(paymentService.getSavedCards).mockResolvedValue([])
  },
}

export const Loading: Story = {
  beforeEach: () => {
    vi.mocked(paymentService.getSavedCards).mockReturnValue(new Promise(() => {}))
  },
}

export const WithError: Story = {
  beforeEach: () => {
    vi.mocked(paymentService.getSavedCards).mockRejectedValue(
      new Error('Failed to load saved cards'),
    )
  },
}

export const SessionExpired: Story = {
  beforeEach: () => {
    const err = { response: { status: 401 } }
    vi.mocked(paymentService.getSavedCards).mockRejectedValue(err)
  },
}
