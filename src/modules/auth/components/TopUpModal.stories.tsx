import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import { vi } from 'vitest'
import type { CatalogProduct, CatalogCategoryNode } from '../../../types'

// Mock useTopUpData to return pre-loaded bundle categories and products
vi.mock('./useTopUpData', () => ({
  useTopUpData: (_open: boolean, _kind: string) => ({
    bundleCategories: [
      { id: 'data', name: 'Data', displayOrder: 1, children: [], productCount: 5, hasProducts: true },
      { id: 'voice', name: 'Voice', displayOrder: 2, children: [], productCount: 3, hasProducts: true },
      { id: 'sms', name: 'SMS', displayOrder: 3, children: [], productCount: 2, hasProducts: true },
    ] as CatalogCategoryNode[],
    selectedCategory: 'data',
    products: [
      {
        id: 'p1',
        sku: 'DATA-1GB',
        name: '1GB Data',
        description: '1GB anytime data valid for 30 days',
        price: 29,
        brand: 'Limes',
        displayOrder: 1,
        isAdHoc: false,
        productId: '7029225D1',
      },
      {
        id: 'p2',
        sku: 'DATA-5GB',
        name: '5GB Data',
        description: '5GB anytime data valid for 30 days',
        price: 99,
        brand: 'Limes',
        displayOrder: 2,
        isAdHoc: false,
        productId: '7029225D5',
      },
      {
        id: 'p3',
        sku: 'DATA-10GB',
        name: '10GB Data',
        description: '10GB anytime data valid for 30 days',
        price: 149,
        brand: 'Limes',
        displayOrder: 3,
        isAdHoc: false,
        productId: '7029225D10',
      },
    ] as CatalogProduct[],
    selectedProduct: null,
    loading: false,
    error: null,
    setSelectedCategory: vi.fn(),
    setSelectedProduct: vi.fn(),
    handleBackToCategories: vi.fn(),
  }),
}))

// Mock paymentService to prevent saved card API calls
vi.mock('../../payment/services/paymentService', () => ({
  paymentService: {
    getSavedCards: vi.fn().mockResolvedValue([]),
  },
}))

import TopUpModal from './TopUpModal'

const mockPhoneNumbers = ['0823234500', '0988988989', '0711234567']

const meta = {
  title: 'Auth/TopUpModal',
  component: TopUpModal,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
} satisfies Meta<typeof TopUpModal>

export default meta
type Story = StoryObj<typeof meta>

/** Modal open showing the bundle purchase view with data products loaded. */
export const BundleView: Story = {
  args: {
    open: true,
    onClose: fn(),
    phoneNumbers: mockPhoneNumbers,
  },
}

/** Modal open showing the bundle view with a specific phone pre-selected. */
export const WithPreSelectedPhone: Story = {
  args: {
    open: true,
    onClose: fn(),
    phoneNumbers: mockPhoneNumbers,
    phoneNumber: '0988988989',
  },
}

/** Modal open with single phone number. */
export const SinglePhone: Story = {
  args: {
    open: true,
    onClose: fn(),
    phoneNumbers: ['0823234500'],
  },
}
