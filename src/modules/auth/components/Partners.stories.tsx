import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import Partners from './Partners';

const meta = {
  title: 'Marketing/Partners',
  component: Partners,
  parameters: designerMeta({
    subtitle: 'For Businesses benefits grid',
    purpose:
      'Intro and six benefit cards for prospective business partners, ending in an Explore Simpal CTA.',
    states: 'Default.',
    usage: 'Dark page background; cards are neutral-800 tiles in a 3-column grid on desktop.',
    fullBleed: true,
  }),
} satisfies Meta<typeof Partners>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Default grid. Check card copy wrapping and icon alignment.'),
};
