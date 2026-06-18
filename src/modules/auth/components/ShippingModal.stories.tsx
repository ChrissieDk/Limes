import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import { vi } from 'vitest'
import type { SelectedPackage, Address, RicaData } from './ShippingModal'

// Mock the useShippingPayment hook to prevent API calls
vi.mock('../../payment/hooks/useShippingPayment', () => ({
  useShippingPayment: () => ({
    isInitializing: false,
    isVerifyingPayment: false,
    verificationError: null,
    paymentSuccess: false,
    refundRequested: false,
    initializePayment: vi.fn(),
  }),
}))

import ShippingModal from './ShippingModal'

const mockSelectedPackage: SelectedPackage = {
  productId: '7029225P',
  simPackageProductId: '7029225P',
  name: 'Prepaid 5GB Data Bundle',
  price: 99,
  priceInCents: 9900,
  packageType: 'prepaid',
  simStatus: 'needs-sim',
  planChargeType: 'once-off',
  features: {
    mobileData: '5GB',
  },
}

const mockDefaultAddress: Address = {
  streetNo: '42',
  streetName: 'Main Road',
  suburb: 'Rondebosch',
  city: 'Cape Town',
  stateOrProvince: 'Western Cape',
  postCode: '7700',
  country: 'South Africa',
}

const mockRicaData: RicaData = {
  address: {
    streetNo: '42',
    streetName: 'Main Road',
    suburb: 'Rondebosch',
    city: 'Cape Town',
    stateOrProvince: 'Western Cape',
    postCode: '7700',
    country: 'South Africa',
  },
  customerInfo: {
    firstname: 'John',
    lastname: 'Doe',
    billEmail: 'john@example.com',
    phoneNumber: '0823234500',
  },
}

const meta = {
  title: 'Auth/ShippingModal',
  component: ShippingModal,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
} satisfies Meta<typeof ShippingModal>

export default meta
type Story = StoryObj<typeof meta>

/** Modal showing order summary with a SIM that needs delivery (includes R65 shipping). */
export const WithSimDelivery: Story = {
  args: {
    open: true,
    onClose: fn(),
    selectedPackage: mockSelectedPackage,
    defaultAddress: mockDefaultAddress,
    customerEmail: 'john@example.com',
    customerName: 'John Doe',
    customerPhone: '0823234500',
    ricaData: mockRicaData,
  },
}

/** Modal showing order for a user who already has a SIM (no shipping cost). */
export const HasSimNoShipping: Story = {
  args: {
    open: true,
    onClose: fn(),
    selectedPackage: {
      ...mockSelectedPackage,
      simStatus: 'has-sim',
      iccid: '8923400000000000001',
    },
    defaultAddress: mockDefaultAddress,
    customerEmail: 'john@example.com',
    customerName: 'John Doe',
    customerPhone: '0823234500',
    ricaData: mockRicaData,
  },
}

/** Modal for a contract subscription with monthly billing. */
export const ContractSubscription: Story = {
  args: {
    open: true,
    onClose: fn(),
    selectedPackage: {
      ...mockSelectedPackage,
      name: 'Contract Unlimited Plan',
      price: 499,
      priceInCents: 49900,
      packageType: 'contract',
      planChargeType: 'monthly',
      isDynamicPlan: true,
      planAllocation: {
        data: 200,
        airtime: 50,
        sms: 25,
        voice: 100,
        whatsapp: 25,
      },
    },
    defaultAddress: mockDefaultAddress,
    customerEmail: 'john@example.com',
    customerName: 'John Doe',
    customerPhone: '0823234500',
    ricaData: mockRicaData,
  },
}
