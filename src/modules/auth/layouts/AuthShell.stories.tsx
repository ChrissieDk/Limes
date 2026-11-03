import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import AuthShell from './AuthShell';

const meta = {
  title: 'Foundations/AuthShell',
  component: AuthShell,
  args: {
    eyebrow: 'Register',
    heading: 'You’re a few steps away',
    subheading: 'Join the community where your mobile plan actually makes sense for you.',
    children: <div className="mx-auto max-w-xl rounded-xl bg-neutral-800 p-6 font-manrope text-sm text-neutral-300">Form content goes here</div>,
  },
  parameters: designerMeta({
    subtitle: 'Frameless register and log in frame',
    purpose: 'Centered eyebrow, heading and subheading above the form. Used for every register, verify and log in screen.',
    states: 'Register, Log in.',
    usage: 'No card or side image. Put forms in the children slot, max ~576px wide.',
    fullBleed: true,
  }),
} satisfies Meta<typeof AuthShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Register: Story = {
  parameters: designerStory('Register frame with the green dot eyebrow.'),
};

export const LogIn: Story = {
  args: { eyebrow: 'Log in', heading: 'Email verified!', subheading: 'Your email has been successfully verified. Log in to view your dashboard.' },
  parameters: designerStory('Log in frame after email verification.'),
};
