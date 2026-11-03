import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import SocialAuthButton from './SocialAuthButton';

const meta = {
  title: 'Foundations/SocialAuthButton',
  component: SocialAuthButton,
  args: { provider: 'google', action: 'Register' },
  parameters: designerMeta({
    subtitle: 'Google and Facebook sign-in buttons',
    purpose: 'White provider buttons shown under the email step of registration. UI only for now; the external auth flows are not connected.',
    states: 'Google, Facebook, Log in wording.',
    usage: 'Stack centered under an OR divider. Use "Register" on sign-up and "Log in" on login.',
  }),
  render: (args) => (
    <div className="rounded-2xl bg-neutral-900 p-6">
      <SocialAuthButton {...args} />
    </div>
  ),
} satisfies Meta<typeof SocialAuthButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Google: Story = {
  parameters: designerStory('Register with Google.'),
};

export const Facebook: Story = {
  args: { provider: 'facebook' },
  parameters: designerStory('Register with Facebook.'),
};

export const LogIn: Story = {
  args: { action: 'Log in' },
  parameters: designerStory('Same button with login wording.'),
};
