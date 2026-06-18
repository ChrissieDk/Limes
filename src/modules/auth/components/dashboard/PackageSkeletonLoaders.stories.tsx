import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BundleCategorySkeleton,
  PackageCardSkeleton,
  CompactPackageCardSkeleton,
} from './PackageSkeletonLoaders';

const meta = {
  title: 'Dashboard/PackageSkeletonLoaders',
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
} satisfies Meta;

export default meta;

export const BundleCategory: StoryObj = {
  render: () => (
    <div className="max-w-xs">
      <BundleCategorySkeleton />
    </div>
  ),
};

export const PackageCard: StoryObj = {
  render: () => (
    <div className="max-w-sm">
      <PackageCardSkeleton />
    </div>
  ),
};

export const PackageCardVariant1: StoryObj = {
  render: () => (
    <div className="max-w-sm">
      <PackageCardSkeleton variant={1} />
    </div>
  ),
};

export const PackageCardVariant2: StoryObj = {
  render: () => (
    <div className="max-w-sm">
      <PackageCardSkeleton variant={2} />
    </div>
  ),
};

export const CompactPackageCard: StoryObj = {
  render: () => (
    <div className="max-w-xs">
      <CompactPackageCardSkeleton />
    </div>
  ),
};

export const AllPackageSkeletons: StoryObj = {
  render: () => (
    <div className="space-y-6 p-6">
      <div className="max-w-xs">
        <BundleCategorySkeleton />
      </div>
      <div className="max-w-sm">
        <PackageCardSkeleton />
      </div>
      <div className="max-w-xs">
        <CompactPackageCardSkeleton />
      </div>
    </div>
  ),
};
