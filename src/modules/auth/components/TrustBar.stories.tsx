import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import TrustBar from './TrustBar';

const meta = {
  title: 'Marketing/TrustBar',
  component: TrustBar,
  parameters: designerMeta({
    subtitle: 'Proof strip under the hero',
    purpose:
      'Short row of trust signals (coverage, regulator, payment) so the hero claim feels backed up without another section of copy.',
    states: 'Default.',
    usage: 'Full width, directly under the hero. Icons and labels should stay on one line on desktop.',
    fullBleed: true,
  }),
} satisfies Meta<typeof TrustBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Default proof row. Watch wrapping: labels must not collide or drop to an awkward two-line stack too early.'),
};
