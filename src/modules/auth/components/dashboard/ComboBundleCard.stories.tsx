import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../../storybook/designerDocs';
import ComboBundleCard from './ComboBundleCard';
import type { EnrichedComboPackage } from '../../../catalog/utils/packageEnricher';

const baseBundle: EnrichedComboPackage = {
  id: 'combo-1',
  sku: 'COMBO-1',
  name: 'Anytime Combo',
  price: 299,
  brand: 'Limes',
  displayOrder: 1,
  isAdHoc: false,
  isEnriched: true,
  actualPrice: 299,
  actualPriceCents: 29900,
  comboDetails: {
    shortSummary: '',
    benefits: [
      { type: 'data', label: 'Data', formattedValue: '20GB', validity: '30 days' },
      { type: 'voice', label: 'Voice', formattedValue: '100 Min', validity: '30 days' },
      { type: 'sms', label: 'SMS', formattedValue: '100 SMS', validity: '30 days' },
      { type: 'whatsapp', label: 'WhatsApp', formattedValue: 'Unlimited', validity: '30 days' },
    ],
  } as EnrichedComboPackage['comboDetails'],
};

const meta = {
  title: 'Dashboard/ComboBundleCard',
  component: ComboBundleCard,
  args: {
    bundle: baseBundle,
    colorClass: 'bg-[#ABFF63]',
    onSelect: () => {},
  },
  parameters: designerMeta({
    subtitle: 'All-in-one package card',
    purpose:
      'Selectable combo with data, voice, SMS, and WhatsApp on one tile. Accent colour differentiates packages in a row.',
    states: 'Lime, Blue, Orange, Summary fallback.',
    usage: 'The whole card is the hit target. If benefit rows are missing, fall back to the short summary so the card never looks empty.',
  }),
  render: (args) => (
    <div className="max-w-sm">
      <ComboBundleCard {...args} />
    </div>
  ),
} satisfies Meta<typeof ComboBundleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Lime: Story = {
  parameters: designerStory('Default Limes accent. Use as the first / recommended combo in the set.'),
};

export const Blue: Story = {
  args: { colorClass: 'bg-[#629BFC]' },
  parameters: designerStory('Alternate accent so neighbouring combos are distinguishable at a glance.'),
};

export const Orange: Story = {
  args: { colorClass: 'bg-[#FF9F66]' },
  parameters: designerStory('Third accent in the combo palette. Do not invent extra colours beyond the three product accents.'),
};

export const SummaryFallback: Story = {
  args: {
    bundle: {
      ...baseBundle,
      name: 'Mystery Bundle',
      comboDetails: { shortSummary: 'A bit of everything, once-off.' } as EnrichedComboPackage['comboDetails'],
    },
  },
  parameters: designerStory('No structured benefits. The short summary copy holds the card together until catalogue data is complete.'),
};
