import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../../storybook/designerDocs';
import { TransactionsModal } from './TransactionsComponents';
import { sampleTransactions } from './dashboardTransactionMocks';

const meta = {
  title: 'Dashboard/TransactionsModal',
  component: TransactionsModal,
  args: {
    open: true,
    onClose: () => {},
    transactions: sampleTransactions,
  },
  parameters: designerMeta({
    subtitle: 'Full payment history',
    purpose:
      'Expanded transaction list launched from “view all” on the dashboard card. Same rows, more of them, in a modal.',
    states: 'Open with history, Open empty.',
    usage: 'Keep sorting consistent with the dashboard preview. Empty should feel like a new account, not a failure.',
    fullBleed: true,
  }),
} satisfies Meta<typeof TransactionsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  parameters: designerStory('History available. Full sortable list over a dimmed dashboard.'),
};

export const OpenEmpty: Story = {
  args: { transactions: [] },
  parameters: designerStory('No payments in the account yet. Same chrome, empty body.'),
};
