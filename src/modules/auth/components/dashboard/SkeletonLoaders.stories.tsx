import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../../storybook/designerDocs';
import {
  SimCardSkeleton,
  PlanDetailsSkeleton,
  BundleCardSkeleton,
  SubscriptionCardSkeleton,
} from './SkeletonLoaders';

const meta = {
  title: 'Dashboard/SkeletonLoaders',
  component: SimCardSkeleton,
  parameters: designerMeta({
    subtitle: 'Dashboard loading placeholders',
    purpose:
      'Shimmer stand-ins that match the shape of dashboard cards so the page does not jump when data arrives.',
    states: 'SIM card, Plan details, Bundle card, Subscription card.',
    usage: 'Use the skeleton that mirrors the real component. Never mix a compact skeleton with a tall card.',
  }),
} satisfies Meta<typeof SimCardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimCard: Story = {
  render: () => (
    <div className="max-w-sm">
      <SimCardSkeleton />
    </div>
  ),
  parameters: designerStory('Placeholder for the SIM identity card while activation status and plan load.'),
};

export const PlanDetails: Story = {
  render: () => (
    <div className="max-w-md">
      <PlanDetailsSkeleton />
    </div>
  ),
  parameters: designerStory('Placeholder for remaining balances under the SIM.'),
};

export const BundleCard: Story = {
  render: () => (
    <div className="max-w-sm">
      <BundleCardSkeleton />
    </div>
  ),
  parameters: designerStory('Placeholder in a bundle grid while the catalogue returns.'),
};

export const SubscriptionCard: Story = {
  render: () => (
    <div className="max-w-3xl">
      <SubscriptionCardSkeleton />
    </div>
  ),
  parameters: designerStory('Wide placeholder for the subscription management block.'),
};
