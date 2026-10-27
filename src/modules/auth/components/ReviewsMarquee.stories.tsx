import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import ReviewsMarquee from './ReviewsMarquee';

const meta = {
  title: 'Marketing/ReviewsMarquee',
  component: ReviewsMarquee,
  parameters: designerMeta({
    subtitle: 'Moving social proof',
    purpose:
      'Horizontal marquee of customer quotes. Adds energy after static benefit tiles without asking anyone to click.',
    states: 'Default.',
    usage: 'Full width. Quotes must remain readable while moving; pause on hover if the implementation allows.',
    fullBleed: true,
  }),
} satisfies Meta<typeof ReviewsMarquee>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Default ticker. Watch speed, duplicate seams, and contrast of quote cards on the page background.'),
};
