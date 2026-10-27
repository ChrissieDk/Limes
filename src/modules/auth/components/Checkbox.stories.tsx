import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import Checkbox from './Checkbox';

const meta = {
  title: 'Foundations/Checkbox',
  component: Checkbox,
  args: {
    label: 'I accept the terms and conditions',
  },
  parameters: designerMeta({
    subtitle: 'Consent and binary choices',
    purpose:
      'Terms, marketing opt-in, and “remember this card” choices. Lime tick on a charcoal box, with a quiet grey label.',
    states: 'Unchecked, Checked, Disabled, Disabled checked.',
    usage: 'The whole row is clickable. Keep the label in plain language; link out for the full legal text.',
  }),
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  parameters: designerStory('Default off. Use for optional extras and legal acceptance that starts unchecked.'),
};

export const Checked: Story = {
  args: { defaultChecked: true },
  parameters: designerStory('On. Lime check on the dark box. This is the selected rest state.'),
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: designerStory('Locked off. Use when the choice is unavailable until another step is complete.'),
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
  parameters: designerStory('Locked on. Use when a required consent has already been recorded and cannot be toggled here.'),
};
