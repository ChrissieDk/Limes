import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import SavedCardSelector from './SavedCardSelector';
import { withPaymentMock } from '../../../test/withPaymentMock';
import type { SavedCard } from '../../../types/payment';

const cards: SavedCard[] = [
  { id: 'card-1', cardType: 'visa', brand: 'visa', last4: '4242', expMonth: '12', expYear: '2028', bank: 'Test Bank', isDefault: true },
  { id: 'card-2', cardType: 'mastercard', brand: 'mastercard', last4: '1234', expMonth: '06', expYear: '2027', bank: 'Capitec', isDefault: false },
];

const meta = {
  title: 'Payment/SavedCardSelector',
  component: SavedCardSelector,
  decorators: [withPaymentMock],
  args: {
    selectedCardId: 'card-1',
    onSelect: () => {},
  },
  parameters: designerMeta({
    subtitle: 'Pick a card at checkout',
    purpose:
      'Radio-style chooser between saved cards and “use a new card”. Smaller than the account wallet list; lives inside a payment sheet.',
    states: 'With cards, New card selected, Disabled, Loading, Load error.',
    usage: 'Selected card should be obvious. Disabled is for when payment is already submitting.',
  }),
  render: (args) => (
    <div className="max-w-md">
      <SavedCardSelector {...args} />
    </div>
  ),
} satisfies Meta<typeof SavedCardSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCards: Story = {
  parameters: {
    ...designerStory('Default card pre-selected. Customer can switch to another saved card or add new.'),
    paymentMock: { savedCards: cards },
  },
};

export const NewCardSelected: Story = {
  args: { selectedCardId: null },
  parameters: {
    ...designerStory('“New card” chosen. Saved cards stay visible but none is highlighted as the payer.'),
    paymentMock: { savedCards: cards },
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: {
    ...designerStory('Locked while a charge is running. No selection changes until the request settles.'),
    paymentMock: { savedCards: cards },
  },
};

export const Loading: Story = {
  parameters: {
    ...designerStory('Wallet still loading at checkout. Do not flash the empty state.'),
    paymentMock: { savedCards: cards, delayMs: 60000 },
  },
};

export const LoadError: Story = {
  parameters: {
    ...designerStory('Could not load cards. Offer new-card checkout as the way forward.'),
    paymentMock: { savedCards: 'error' },
  },
};
