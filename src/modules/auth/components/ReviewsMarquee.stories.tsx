import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import ReviewsMarquee from './ReviewsMarquee';

const meta = {
  title: 'Marketing/ReviewsMarquee',
  component: ReviewsMarquee,
  parameters: designerMeta({
    subtitle: 'Customer quotes',
    purpose:
      'Three static testimonial cards above the business CTA. Short quotes plus a name, no avatars or motion.',
    states: 'Default.',
    usage: 'Full width, directly above the telecom profit-centre banner. Cards stay equal height in a row on desktop.',
    fullBleed: true,
  }),
} satisfies Meta<typeof ReviewsMarquee>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Default three quotes. Check equal card height, wrapping of the longest quote, and contrast of #302F35 cards on the page.'),
};
