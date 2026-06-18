import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import ChoosePackageModal from './ChoosePackageModal'
import type { CatalogProduct } from '../../../types'

const mockCatalogProduct: CatalogProduct = {
  id: 'prod-001',
  sku: 'SKU-PREPAID-5GB',
  name: 'Prepaid 5GB Data Bundle',
  description: '5GB anytime data valid for 30 days',
  price: 99,
  brand: 'Limes',
  displayOrder: 1,
  isAdHoc: false,
  productId: '7029225P',
  simPackageProductId: '7029225P',
  packageType: 'prepaid',
  simStatus: 'needs-sim',
  planChargeType: 'once-off',
  features: {
    mobileData: '5GB',
  },
}

const meta = {
  title: 'Auth/ChoosePackageModal',
  component: ChoosePackageModal,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
} satisfies Meta<typeof ChoosePackageModal>

export default meta
type Story = StoryObj<typeof meta>

/** Modal open at step 1 (Personal Details). */
export const Step1PersonalDetails: Story = {
  args: {
    open: true,
    onClose: fn(),
    selectedPackage: mockCatalogProduct,
  },
}

/** Modal open at step 1 without a selected package. */
export const WithoutPackage: Story = {
  args: {
    open: true,
    onClose: fn(),
    selectedPackage: null,
  },
}
