import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import ShippingModal, { type SelectedPackage } from './ShippingModal';
import { withPaymentMock } from '../../../test/withPaymentMock';

const needsSimPackage: SelectedPackage = {
  productId: '7029225P',
  name: 'Flex 25',
  price: 299,
  priceInCents: 29900,
  packageType: 'contract',
  simStatus: 'needs-sim',
  planChargeType: 'monthly',
  features: { mobileData: '25GB' },
};

const hasSimPackage: SelectedPackage = {
  productId: '7023225P',
  name: 'Lite 10',
  price: 199,
  priceInCents: 19900,
  packageType: 'prepaid',
  simStatus: 'has-sim',
  iccid: '8955012345678901234',
  features: { mobileData: '10GB' },
};

const meta = {
  title: 'Payment/ShippingModal',
  component: ShippingModal,
  decorators: [withPaymentMock],
  args: {
    open: true,
    onClose: () => {},
    customerEmail: 'demo@limes.co.za',
    customerName: 'Demo User',
    customerPhone: '0820000000',
  },
  parameters: designerMeta({
    subtitle: 'Delivery vs activate-on-existing-SIM',
    purpose:
      'Checkout step after a package is chosen. New SIM customers capture a shipping address; existing SIM customers skip to free activation.',
    states: 'Needs a SIM (shipping form), Already has a SIM (free delivery).',
    usage: 'Full-bleed overlay. Pre-fill name, email, and phone from the account. Do not ask for ICCID when they need a SIM posted.',
    fullBleed: true,
  }),
} satisfies Meta<typeof ShippingModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NeedsSimWithShipping: Story = {
  args: { selectedPackage: needsSimPackage },
  parameters: designerStory('New SIM. Address fields are required because a physical SIM has to be posted.'),
};

export const HasSimFreeDelivery: Story = {
  args: { selectedPackage: hasSimPackage },
  parameters: designerStory('SIM already in hand. No address form — confirm activation on the existing ICCID.'),
};
