import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  SimCardSkeleton,
  PlanDetailsSkeleton,
  BundleCardSkeleton,
  SubscriptionCardSkeleton,
} from './SkeletonLoaders';

const meta = {
  title: 'Dashboard/SkeletonLoaders',
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
} satisfies Meta;

export default meta;

export const SimCard: StoryObj = {
  render: () => <SimCardSkeleton />,
};

export const PlanDetails: StoryObj = {
  render: () => <PlanDetailsSkeleton />,
};

export const BundleCard: StoryObj = {
  render: () => <BundleCardSkeleton />,
};

export const SubscriptionCard: StoryObj = {
  render: () => <SubscriptionCardSkeleton />,
};

export const AllSkeletons: StoryObj = {
  render: () => (
    <div className="space-y-6 p-6">
      <div className="max-w-sm">
        <SimCardSkeleton />
      </div>
      <div className="max-w-md">
        <PlanDetailsSkeleton />
      </div>
      <div className="max-w-sm">
        <BundleCardSkeleton />
      </div>
      <div className="max-w-xl">
        <SubscriptionCardSkeleton />
      </div>
    </div>
  ),
};
