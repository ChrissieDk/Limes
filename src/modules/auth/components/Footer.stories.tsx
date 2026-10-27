import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import Footer from './Footer';

const meta = {
  title: 'Marketing/Footer',
  component: Footer,
  parameters: designerMeta({
    subtitle: 'Site-wide footer',
    purpose:
      'Closes every marketing page: legal links, product links, and brand mark. Quiet, not a second hero.',
    states: 'Default.',
    usage: 'Full width. Keep link groups scannable; do not add a competing CTA here.',
    fullBleed: true,
  }),
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Standard footer. Check column stacking on small widths and that legal links stay reachable.'),
};
