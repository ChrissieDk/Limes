import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import WhyChoose from './WhyChoose';

const meta = {
  title: 'Marketing/WhyChoose',
  component: WhyChoose,
  parameters: designerMeta({
    subtitle: 'Reasons to switch',
    purpose:
      'Benefit grid (no lock-in, cash back, keep your number, and similar) that sits between social proof and packages.',
    states: 'Default.',
    usage: 'Full width. Four-or-so equal tiles; do not promote one benefit as a nested CTA.',
    fullBleed: true,
  }),
} satisfies Meta<typeof WhyChoose>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Default benefit tiles. Check icon + heading + one-line support copy, and wrapping at tablet width.'),
};
