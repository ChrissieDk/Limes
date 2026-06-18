import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import ComboBundleCard from './ComboBundleCard';
import type { EnrichedComboPackage } from '../../../catalog/utils/packageEnricher';

const meta = {
  title: 'Dashboard/ComboBundleCard',
  component: ComboBundleCard,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
  args: {
    onSelect: fn(),
  },
} satisfies Meta<typeof ComboBundleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockComboBundle: EnrichedComboPackage = {
  id: '40891',
  sku: 'SKU-40891',
  name: 'Limes69',
  description: '1GB zero-rated data (90 days), R90 airtime, and 200MB WhatsApp data',
  price: 69,
  brand: 'Limes',
  displayOrder: 1,
  isAdHoc: false,
  isEnriched: true,
  actualPrice: 69,
  actualPriceCents: 6900,
  comboDetails: {
    productId: '40891',
    name: 'Limes69',
    monthlyCostCents: 6900,
    monthlyCostRands: 69,
    validity: '30 Days',
    shortSummary: '1GB Zero-Rated + R90 Airtime + 200MB WhatsApp',
    displayDescription: '1GB zero-rated data (90 days), R90 airtime, and 200MB WhatsApp data',
    benefits: [
      {
        type: 'zero_rated_data',
        label: 'Zero Rated Data',
        value: 1073741824,
        formattedValue: '1GB',
        validity: '90 days',
      },
      {
        type: 'gpa_credit',
        label: 'General Purpose Airtime',
        value: 9000,
        formattedValue: 'R90',
        validity: '30 days',
      },
      {
        type: 'whatsapp',
        label: 'WhatsApp Data',
        value: 209715200,
        formattedValue: '200MB',
        validity: '30 days',
        description: 'FUP applies',
      },
    ],
  },
};

const mockUnlimitedBundle: EnrichedComboPackage = {
  id: '40020',
  sku: 'SKU-40020',
  name: 'Unlimited Voice + 10GB Data',
  description: 'Unlimited voice calls to all networks plus 10GB of high-speed data',
  price: 399,
  brand: 'Limes',
  displayOrder: 2,
  isAdHoc: false,
  isEnriched: true,
  actualPrice: 399,
  actualPriceCents: 39900,
  comboDetails: {
    productId: '40020',
    name: 'Unlimited Voice + 10GB Data',
    monthlyCostCents: 39900,
    monthlyCostRands: 399,
    validity: '30 Days',
    shortSummary: 'Unlimited Voice Calls + 10GB Data',
    displayDescription: 'Unlimited voice calls to all networks plus 10GB of high-speed data',
    benefits: [
      {
        type: 'voice',
        label: 'Voice Minutes',
        value: -1,
        formattedValue: 'Unlimited',
        validity: '30 days',
        description: 'Unlimited calls to all networks',
      },
      {
        type: 'data',
        label: 'Data',
        value: 10737418240,
        formattedValue: '10GB',
        validity: '30 days',
      },
    ],
  },
};

export const Default: Story = {
  args: {
    bundle: mockComboBundle,
    colorClass: 'bg-white',
  },
};

export const Unlimited: Story = {
  args: {
    bundle: mockUnlimitedBundle,
    colorClass: 'bg-white',
  },
};
