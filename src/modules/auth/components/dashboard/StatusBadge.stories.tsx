import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../../storybook/designerDocs';
import { StatusBadge } from './TransactionsComponents';

const meta = {
  title: 'Dashboard/StatusBadge',
  component: StatusBadge,
  parameters: designerMeta({
    subtitle: 'Payment outcome pill',
    purpose:
      'Compact status for a transaction row. Colour + label so success, pending, and failed can be scanned in a list.',
    states: 'Success, Pending, Failed.',
    usage: 'Designed for dark dashboard surfaces. Keep it next to the amount, never as a page-level banner.',
  }),
  render: (args) => (
    <div className="rounded-xl bg-neutral-900 px-4 py-3">
      <StatusBadge {...args} />
    </div>
  ),
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: { status: 'success' },
  parameters: designerStory('Paid / completed. Green dot and label. This is the healthy rest state in the history list.'),
};

export const Pending: Story = {
  args: { status: 'pending' },
  parameters: designerStory('In flight. Amber treatment. Use while Paystack or the network has not confirmed yet.'),
};

export const Failed: Story = {
  args: { status: 'failed' },
  parameters: designerStory('Did not go through. Red treatment. Pair with a retry action in the parent row or modal.'),
};
