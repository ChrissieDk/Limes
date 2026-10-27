import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import HowToJoin from './HowToJoin';

const meta = {
  title: 'Marketing/HowToJoin',
  component: HowToJoin,
  parameters: designerMeta({
    subtitle: 'Three-step onboarding explainer',
    purpose:
      'Shows how a new customer gets a Limes number in a short numbered sequence. Reduces “is this complicated?” before the join CTA.',
    states: 'Default.',
    usage: 'Full width section. Keep steps to three; the labels should be outcomes, not internal process names.',
    fullBleed: true,
  }),
} satisfies Meta<typeof HowToJoin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Default three steps. Check numbering, icon alignment, and that the section still reads in one glance on mobile.'),
};
