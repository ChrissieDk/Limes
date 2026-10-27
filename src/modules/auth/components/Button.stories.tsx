import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import Button from './Button';

const meta = {
  title: 'Foundations/Button',
  component: Button,
  args: {
    children: 'Button',
    fullWidth: false,
  },
  parameters: designerMeta({
    subtitle: 'Primary and secondary actions',
    purpose:
      'The Limes action button. Lime fill is the main call to action; the dark secondary style is for cancel, back, or less important actions.',
    states: 'Primary, Secondary, Full width, Disabled, Disabled secondary.',
    usage: 'Use one primary button per view. Keep labels short and verb-led (Continue, Pay, Save).',
  }),
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  parameters: designerStory('Default CTA. Lime fill, black type, hard offset shadow. Use for the single most important action on the screen.'),
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
  parameters: designerStory('Dark fill for supporting actions such as Back or Cancel. Pair it with a primary button, never as the only action on a checkout step.'),
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  parameters: designerStory('Stretches to the container. Default on forms and mobile sheets so the tap target is easy to hit.'),
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: designerStory('Unavailable primary. 50% opacity and no pointer. Use while a form is invalid or a payment is in flight.'),
};

export const DisabledSecondary: Story = {
  args: { variant: 'secondary', disabled: true },
  parameters: designerStory('Unavailable secondary action. Same muted treatment as disabled primary.'),
};
