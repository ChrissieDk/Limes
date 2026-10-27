import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import TextField from './TextField';

const meta = {
  title: 'Foundations/TextField',
  component: TextField,
  args: {
    label: 'Label',
    placeholder: 'Enter text…',
  },
  parameters: designerMeta({
    subtitle: 'Form input with light and dark surfaces',
    purpose:
      'Standard text input for sign-in, RICA, shipping, and account forms. Light sits on white cards; dark sits on charcoal marketing/auth panels.',
    states: 'Light, Dark, Prefix, Error, Password, Password on dark, Disabled.',
    usage: 'Always show a label. Use the error state for validation, not placeholder copy.',
  }),
  render: (args) => (
    <div className="w-80">
      <TextField {...args} />
    </div>
  ),
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {
  parameters: designerStory('Default field on white. Neutral ring, black text, 48px height. Use on sign-up cards and checkout forms.'),
};

export const Dark: Story = {
  args: { variant: 'dark' },
  parameters: designerStory('Low-contrast field for dark panels. White type on a translucent fill. Previewed on charcoal so the contrast is true to product.'),
  render: (args) => (
    <div className="w-80 rounded-2xl bg-neutral-900 p-6">
      <TextField {...args} />
    </div>
  ),
};

export const WithPrefix: Story = {
  args: { prefix: '+27' },
  parameters: designerStory('Locked prefix for phone numbers. The user only types the national number.'),
};

export const WithError: Story = {
  args: { error: 'This field is required', defaultValue: 'invalid' },
  parameters: designerStory('Validation failure. Red ring plus helper text under the field. Keep the message specific and actionable.'),
};

export const Password: Story = {
  args: { type: 'password', label: 'Password', defaultValue: 'hunter2' },
  parameters: designerStory('Masked entry with a show/hide toggle. Use for passwords and one-time PINs.'),
};

export const PasswordDark: Story = {
  args: { type: 'password', variant: 'dark', label: 'Password' },
  parameters: designerStory('Password field on a dark panel, including the visibility toggle.'),
  render: (args) => (
    <div className="w-80 rounded-2xl bg-neutral-900 p-6">
      <TextField {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Read only' },
  parameters: designerStory('Read-only / locked. Use when a value is prefilled from the account and must not be edited.'),
};
