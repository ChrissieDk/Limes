import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import PlanBuilder from './PlanBuilder';

const meta = {
  title: 'Marketing/PlanBuilder',
  component: PlanBuilder,
  args: {
    onContinue: () => {},
    onBack: () => {},
  },
  parameters: designerMeta({
    subtitle: 'Build a custom allocation',
    purpose:
      'Interactive mixer for data (and related allowances) before checkout. Continue and back are owned by the parent flow.',
    states: 'Default.',
    usage: 'Give it the full content width of the package step. The control should feel tactile, not like a raw slider form.',
    fullBleed: true,
  }),
} satisfies Meta<typeof PlanBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Resting mixer. Check default allocation, price feedback, and the continue/back pair at the bottom.'),
};
