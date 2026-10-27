import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../../storybook/designerDocs';
import { TransactionHistory } from './TransactionsComponents';
import { sampleTransactions } from './dashboardTransactionMocks';

const meta = {
  title: 'Dashboard/TransactionHistory',
  component: TransactionHistory,
  args: {
    transactions: sampleTransactions,
    onOpenFullView: () => {},
  },
  parameters: designerMeta({
    subtitle: 'Recent payments on the dashboard',
    purpose:
      'Preview of the last few transactions with a “view all” link into the full modal. Loading and empty are first-class states.',
    states: 'Populated, Loading, Empty.',
    usage: 'Cap the list at a handful of rows. The empty state should invite a first top-up, not look like an error.',
  }),
  render: (args) => (
    <div className="max-w-xl">
      <TransactionHistory {...args} />
    </div>
  ),
} satisfies Meta<typeof TransactionHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {
  parameters: designerStory('Has payments. Shows the most recent five plus a view-all control.'),
};

export const Loading: Story = {
  args: { loading: true },
  parameters: designerStory('Pulse placeholders while history is fetched. Keep the card chrome so the layout does not jump.'),
};

export const Empty: Story = {
  args: { transactions: [] },
  parameters: designerStory('No payments yet. Quiet empty copy, not an error illustration.'),
};
