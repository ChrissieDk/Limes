import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import HowLimesWorks from './HowLimesWorks';

const meta = {
  title: 'Marketing/HowLimesWorks',
  component: HowLimesWorks,
  parameters: designerMeta({
    subtitle: 'Four-step product explainer',
    purpose:
      'Replaces the old trust marquee under the hero. Four equal cards walk through choosing airtime, allocating bundles, topping up, and changing the setup.',
    states: 'Default.',
    usage: 'Full width, directly under the hero. Cards stay in a row on desktop; stacking on mobile is expected.',
    fullBleed: true,
  }),
} satisfies Meta<typeof HowLimesWorks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Default four steps. Check icon block size, step numbers, and that the cards stay equal height in a row.'),
};
