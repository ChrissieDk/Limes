import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import TelecomCta from './TelecomCta';

const meta = {
  title: 'Marketing/TelecomCta',
  component: TelecomCta,
  parameters: designerMeta({
    subtitle: 'Mid-page join band',
    purpose:
      'A second, louder invitation to join after the customer has seen product proof. One headline, one CTA.',
    states: 'Default.',
    usage: 'Full-bleed band. Do not add a secondary button — this is a single-action strip.',
    fullBleed: true,
  }),
} satisfies Meta<typeof TelecomCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Resting CTA band. Check contrast of type on the band colour and that the button matches the primary system button.'),
};
