import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import WhyChoose from './WhyChoose';

const meta = {
  title: 'Marketing/WhyChoose',
  component: WhyChoose,
  parameters: designerMeta({
    subtitle: 'Build-your-own plan',
    purpose:
      'Interactive allocation tiles plus a floating summary. Spend is in rands; the stepper shows converted units (GB, SMS, minutes). Buy now uses the landing auth CTA.',
    states: 'Default allocation (airtime R30, data R100, SMS/voice/WhatsApp R10). Steppers increment by R5.',
    usage: 'Full width. Tiles must match the summary height. Data conversion is the live R0.10/MB rate, so R100 reads as 1GB.',
    fullBleed: true,
  }),
} satisfies Meta<typeof WhyChoose>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Default plan builder. Check icon size, less-rounded stepper chrome, large +/−, and that summary rand values stay large and aligned.'),
};
