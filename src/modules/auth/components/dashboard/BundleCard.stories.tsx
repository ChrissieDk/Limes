import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../../storybook/designerDocs';
import { BundleCard } from './BundleCard';
import type { Bundle } from './dashboardTypes';

const meta = {
  title: 'Dashboard/BundleCard',
  component: BundleCard,
  args: {
    bundle: {
      name: 'Flex 25',
      type: 'flex',
      dayData: '25GB daytime data',
    } as Bundle,
  },
  parameters: designerMeta({
    subtitle: 'Catalogue tile for a single bundle',
    purpose:
      'Sells one prepaid or contract bundle at a glance: name, type, and the data story. Used in package pickers.',
    states: 'Flex, Flex with cashback, Lite, 3-month saver.',
    usage: 'Keep one primary fact (daytime data) above the fold. Cashback is an extra line, not a new card type.',
  }),
  render: (args) => (
    <div className="max-w-sm">
      <BundleCard {...args} />
    </div>
  ),
} satisfies Meta<typeof BundleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Flex: Story = {
  parameters: designerStory('Standard Flex bundle. Daytime data is the hero line.'),
};

export const FlexWithCashback: Story = {
  args: {
    bundle: { name: 'Flex 50', type: 'flex', dayData: '50GB daytime data', cashback: 'R50 cashback monthly' },
  },
  parameters: designerStory('Flex plus monthly cashback. The cashback line should stay secondary to the data amount.'),
};

export const Lite: Story = {
  args: {
    bundle: { name: 'Lite 10', type: 'lite', dayData: '10GB anytime data', nightData: '20GB night data' },
  },
  parameters: designerStory('Lite split: anytime vs night data. Both allocations should be readable without opening the card.'),
};

export const ThreeMonth: Story = {
  args: {
    bundle: { name: 'Quarter Saver', type: '3-month', dayData: '30GB per month' },
  },
  parameters: designerStory('Multi-month saver. Emphasise the term so it is not confused with a month-to-month Flex.'),
};
