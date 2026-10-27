import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import BundleCategoryGrid from './BundleCategoryGrid';
import type { CatalogCategoryNode } from '../../../types';

const categories: CatalogCategoryNode[] = [
  { id: 'data', name: 'Data', displayOrder: 1, children: [], productCount: 12, hasProducts: true },
  { id: 'voice', name: 'Voice', displayOrder: 2, children: [], productCount: 4, hasProducts: true },
  { id: 'sms', name: 'SMS', displayOrder: 3, children: [], productCount: 1, hasProducts: true },
  { id: 'whatsapp', name: 'WhatsApp', displayOrder: 4, children: [], productCount: 3, hasProducts: true },
];

const meta = {
  title: 'Dashboard/BundleCategoryGrid',
  component: BundleCategoryGrid,
  args: {
    categories,
    onSelect: () => {},
  },
  parameters: designerMeta({
    subtitle: 'Pick a bundle type',
    purpose:
      'Category tiles in the package flow. Each tile is a type of value (data, voice, SMS, WhatsApp) and leads to that catalogue.',
    states: 'All categories, Single option, Unknown category.',
    usage: 'One tap selects a category. Icons are mapped for known types; unknown names fall back to a generic tile.',
  }),
  render: (args) => (
    <div className="max-w-lg">
      <BundleCategoryGrid {...args} />
    </div>
  ),
} satisfies Meta<typeof BundleCategoryGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllCategories: Story = {
  parameters: designerStory('Full set of catalogue types. This is the typical “what do you want to buy?” step.'),
};

export const SingleOption: Story = {
  args: {
    categories: [
      { id: 'sms', name: 'SMS', displayOrder: 1, children: [], productCount: 1, hasProducts: true },
    ],
  },
  parameters: designerStory('Only one category in stock. The grid still renders as a tile, not a pre-selected skip, so the choice stays visible.'),
};

export const UnknownCategory: Story = {
  args: {
    categories: [
      { id: 'video', name: 'Video', displayOrder: 1, children: [], productCount: 2, hasProducts: true },
    ],
  },
  parameters: designerStory('Unmapped catalogue name. Uses the fallback illustration so a new product type does not break the grid.'),
};
