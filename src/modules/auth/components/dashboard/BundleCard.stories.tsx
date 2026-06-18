import type { Meta, StoryObj } from '@storybook/react-vite';
import { BundleCard } from './BundleCard';
import type { Bundle } from './dashboardTypes';

const meta = {
  title: 'Dashboard/BundleCard',
  component: BundleCard,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
} satisfies Meta<typeof BundleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockFlexBundle: Bundle = {
  name: 'Flex Bundle',
  type: 'flex',
  dayData: '5GB Anytime Data',
  nightData: '5GB Night Owl Data',
  cashback: 'R50 Cashback',
};

const mockLiteBundle: Bundle = {
  name: 'Lite Bundle',
  type: 'lite',
  dayData: '2GB Anytime Data',
};

const mockThreeMonthBundle: Bundle = {
  name: '3-Month Bundle',
  type: '3-month',
  dayData: '10GB Data per month',
  cashback: 'R100 Cashback',
  isOnceOff: true,
};

export const Flex: Story = {
  args: { bundle: mockFlexBundle },
};

export const Lite: Story = {
  args: { bundle: mockLiteBundle },
};

export const ThreeMonth: Story = {
  args: { bundle: mockThreeMonthBundle },
};
