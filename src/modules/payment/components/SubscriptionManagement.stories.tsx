import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import SubscriptionManagement from './SubscriptionManagement';
import { withPaymentMock } from '../../../test/withPaymentMock';
import type { SavedCard } from '../../../types/payment';

const cards: SavedCard[] = [
  { id: 'card-1', cardType: 'visa', brand: 'visa', last4: '4242', expMonth: '12', expYear: '2028', bank: 'Test Bank', isDefault: true },
];

const meta = {
  title: 'Payment/SubscriptionManagement',
  component: SubscriptionManagement,
  decorators: [withPaymentMock],
  args: {
    onSubscriptionCreated: () => {},
    onSubscriptionCancelled: () => {},
  },
  parameters: designerMeta({
    subtitle: 'Start or stop auto-renew',
    purpose:
      'Account block for managing the recurring plan: status, saved card, cancel or start. User data is stubbed in Storybook, so you will typically see the empty/error treatment.',
    states: 'Default (no live subscription data).',
    usage: 'Place on the account / plan page. Design the empty and error edges as carefully as the happy path — they are what Storybook can show without the backend.',
  }),
  render: (args) => (
    <div className="max-w-lg">
      <SubscriptionManagement {...args} />
    </div>
  ),
} satisfies Meta<typeof SubscriptionManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    ...designerStory('Stubbed user service. Use this to check how the block looks when there is nothing to manage yet, or the load failed.'),
    paymentMock: { savedCards: cards },
  },
};
