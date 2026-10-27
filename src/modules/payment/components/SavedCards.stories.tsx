import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import SavedCards from './SavedCards';
import { withPaymentMock } from '../../../test/withPaymentMock';
import type { SavedCard } from '../../../types/payment';

const cards: SavedCard[] = [
  { id: 'card-1', cardType: 'visa', brand: 'visa', last4: '4242', expMonth: '12', expYear: '2028', bank: 'Test Bank', isDefault: true },
  { id: 'card-2', cardType: 'mastercard', brand: 'mastercard', last4: '1234', expMonth: '06', expYear: '2027', bank: 'Capitec', isDefault: false },
];

const meta = {
  title: 'Payment/SavedCards',
  component: SavedCards,
  decorators: [withPaymentMock],
  args: {
    onCardSelected: () => {},
  },
  parameters: designerMeta({
    subtitle: 'Cards on file',
    purpose:
      'List of stored Paystack cards: brand, last four, default, and optional charge. Also owns empty, loading, and load-error.',
    states: 'With cards, Charge button, Empty, Loading, Load error.',
    usage: 'One default card marked clearly. Empty should push “add a card”, not look broken.',
  }),
  render: (args) => (
    <div className="max-w-md">
      <SavedCards {...args} />
    </div>
  ),
} satisfies Meta<typeof SavedCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCards: Story = {
  parameters: {
    ...designerStory('Two cards, Visa default. This is the typical account rest state.'),
    paymentMock: { savedCards: cards },
  },
};

export const WithChargeButton: Story = {
  args: { showChargeButton: true, chargeAmount: 199.99 },
  parameters: {
    ...designerStory('Checkout context: a charge amount is shown so the customer knows what the selected card will pay.'),
    paymentMock: { savedCards: cards },
  },
};

export const Empty: Story = {
  parameters: {
    ...designerStory('No cards stored. Prompt to add one — this is a first-time payer.'),
    paymentMock: { savedCards: [] },
  },
};

export const Loading: Story = {
  parameters: {
    ...designerStory('Cards are still fetching. Keep the panel and show a wait state, not a blank gap.'),
    paymentMock: { savedCards: cards, delayMs: 60000 },
  },
};

export const LoadError: Story = {
  parameters: {
    ...designerStory('Wallet service failed. Error copy plus a way to retry, never a silent empty list.'),
    paymentMock: { savedCards: 'error' },
  },
};
