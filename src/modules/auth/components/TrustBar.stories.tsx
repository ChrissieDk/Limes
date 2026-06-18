import type { Meta, StoryObj } from '@storybook/react-vite';
import TrustBar from './TrustBar';

const meta = {
  title: 'Auth/TrustBar',
  component: TrustBar,
  parameters: {},
} satisfies Meta<typeof TrustBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
