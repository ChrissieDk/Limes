import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../../storybook/designerDocs';
import {
  BundleCategorySkeleton,
  PackageCardSkeleton,
  CompactPackageCardSkeleton,
} from './PackageSkeletonLoaders';

const meta = {
  title: 'Dashboard/PackageSkeletonLoaders',
  component: BundleCategorySkeleton,
  parameters: designerMeta({
    subtitle: 'Package-flow loading placeholders',
    purpose:
      'Shimmer tiles for the choose-package journey: category, full package card, and compact card.',
    states: 'Bundle category, Package card, Package card variant, Compact package card.',
    usage: 'Match the skeleton to the card that will replace it. Variant 2 is a slightly different block rhythm so a grid does not look cloned.',
  }),
} satisfies Meta<typeof BundleCategorySkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BundleCategory: Story = {
  render: () => (
    <div className="max-w-xs">
      <BundleCategorySkeleton />
    </div>
  ),
  parameters: designerStory('Placeholder for a category tile (Data, Voice, SMS…).'),
};

export const PackageCard: Story = {
  render: () => (
    <div className="max-w-sm">
      <PackageCardSkeleton />
    </div>
  ),
  parameters: designerStory('Full package card placeholder while prices and allowances load.'),
};

export const PackageCardVariant: Story = {
  render: () => (
    <div className="max-w-sm">
      <PackageCardSkeleton variant={2} />
    </div>
  ),
  parameters: designerStory('Second pulse pattern so a row of skeletons does not look like one image repeated.'),
};

export const CompactPackageCard: Story = {
  render: () => (
    <div className="max-w-sm">
      <CompactPackageCardSkeleton />
    </div>
  ),
  parameters: designerStory('Shorter card used in dense lists or comparison rows.'),
};
