import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import LoginForm from './LoginForm';

const meta = {
  title: 'Foundations/LoginForm',
  component: LoginForm,
  parameters: designerMeta({
    subtitle: 'Email and password log in',
    purpose: 'Two-column email and password form with remember me and forgot password. Used on the Log in page and after email verification.',
    states: 'Default, Validation errors.',
    usage: 'Place inside AuthShell. The Log in button is centered under the fields.',
  }),
  render: () => (
    <div className="rounded-2xl bg-neutral-900 p-6">
      <LoginForm />
    </div>
  ),
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Empty form with placeholders.'),
};

export const ValidationErrors: Story = {
  parameters: designerStory('Submitting empty shows red borders and messages under both fields.'),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Log in' }));
  },
};
