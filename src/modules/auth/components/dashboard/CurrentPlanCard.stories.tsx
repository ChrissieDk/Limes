import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../../storybook/designerDocs';
import { CurrentPlan } from './CurrentPlanCard';
import type { Plan } from './dashboardTypes';

const basePlan: Plan = {
  name: 'Lite Plan',
  mobileData: '10GB',
  messaging: '10 SMS',
  phone: '10 Min',
  price: 199.99,
  productId: '7029225P',
};

const meta = {
  title: 'Dashboard/CurrentPlan',
  component: CurrentPlan,
  args: {
    plan: basePlan,
  },
  parameters: designerMeta({
    subtitle: 'What this SIM is on today',
    purpose:
      'Dashboard summary of the live plan: allowances, price, and whether auto-renew is on. Status changes the supporting copy, not the layout.',
    states: 'Active auto-renew, Active manual renew, Pending, Cancelled, No subscription.',
    usage: 'One card per SIM. Pending and cancelled should still show the plan name so the customer knows what is in flight or ending.',
  }),
  render: (args) => (
    <div className="max-w-md">
      <CurrentPlan {...args} />
    </div>
  ),
} satisfies Meta<typeof CurrentPlan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveAutoRenew: Story = {
  args: {
    plan: {
      ...basePlan,
      hasActiveSubscription: true,
      isAutoRenewing: true,
      subscriptionStatus: 'active',
      nextPaymentDate: '2026-11-01',
    },
  },
  parameters: designerStory('Healthy subscription. Show next payment date. This is the default logged-in rest state.'),
};

export const ActiveManualRenew: Story = {
  args: {
    plan: {
      ...basePlan,
      hasActiveSubscription: true,
      isAutoRenewing: false,
      subscriptionStatus: 'active',
    },
  },
  parameters: designerStory('Active but customer pays each cycle themselves. Do not show a next-charge date.'),
};

export const Pending: Story = {
  args: {
    plan: { ...basePlan, hasActiveSubscription: true, subscriptionStatus: 'pending' },
  },
  parameters: designerStory('Activation or first payment still confirming. Keep the plan visible; avoid success language.'),
};

export const Cancelled: Story = {
  args: {
    plan: { ...basePlan, subscriptionStatus: 'cancelled' },
  },
  parameters: designerStory('Subscription ended. Offer a path back to choose a package from the parent dashboard, not from this card.'),
};

export const NoSubscription: Story = {
  args: {
    plan: { ...basePlan, subscriptionStatus: undefined },
  },
  parameters: designerStory('SIM has plan-shaped data but no subscription yet. Treat as a prompt to pick or pay, not as billed.'),
};
