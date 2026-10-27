import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import Partners from './Partners';

const meta = {
  title: 'Marketing/Partners',
  component: Partners,
  parameters: designerMeta({
    subtitle: 'Network and brand logos',
    purpose:
      'Quiet logo row for coverage partners and payment marks. Supports trust without another paragraph of copy.',
    states: 'Default.',
    usage: 'Full width, low contrast against the page. Logos should be optically aligned, not stretched.',
    fullBleed: true,
  }),
} satisfies Meta<typeof Partners>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Default logo row. Check greyscale treatment, spacing, and that no logo dominates.'),
};
