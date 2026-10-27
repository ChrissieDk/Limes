import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../../storybook/designerDocs';
import TransactionList from './TransactionList';
import type { Transaction } from './dashboardTypes';
import { sampleTransactions } from './dashboardTransactionMocks';

const getTransactionTypeLabel = (t: Transaction) =>
  t.channel === 'card' ? 'Card Payment' : 'Payment';

const meta = {
  title: 'Dashboard/TransactionList',
  component: TransactionList,
  args: {
    transactions: sampleTransactions,
    sortKey: 'date',
    sortDir: 'desc',
    onSort: () => {},
    getTransactionTypeLabel,
  },
  parameters: designerMeta({
    subtitle: 'Sortable payment rows',
    purpose:
      'The table body used in transaction history and the full-history modal. Columns are type, date, and amount, with a status badge.',
    states: 'Newest first, Amount ascending.',
    usage: 'Always sit on a dark dashboard panel. Clicking a column header toggles sort; do not add extra filters here.',
  }),
  render: (args) => (
    <div className="max-w-xl rounded-xl border border-neutral-700 bg-neutral-800 p-6">
      <TransactionList {...args} />
    </div>
  ),
} satisfies Meta<typeof TransactionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SortedByDateDesc: Story = {
  parameters: designerStory('Default: newest payment first. This is how the dashboard and modal open.'),
};

export const SortedByAmountAsc: Story = {
  args: { sortKey: 'amount', sortDir: 'asc' },
  parameters: designerStory('Customer sorted by amount, low to high. Header affordance should show the active column.'),
};
