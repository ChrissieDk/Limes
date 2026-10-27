import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import Packages from './Packages';

const meta = {
  title: 'Marketing/Packages',
  component: Packages,
  parameters: designerMeta({
    subtitle: 'Public package line-up',
    purpose:
      'Marketing grid of the plans we sell. This is persuasion, not the logged-in catalogue — prices and names should match what checkout will honour.',
    states: 'Default.',
    usage: 'Full width. Featured plan can be visually louder; every card still needs a clear price and one CTA.',
    fullBleed: true,
  }),
} satisfies Meta<typeof Packages>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Default package grid. Compare card hierarchy, price prominence, and how many plans appear before a fold on laptop.'),
};
