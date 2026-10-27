import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import AuthLayout from './AuthLayout';

const meta = {
  title: 'Foundations/AuthLayout',
  component: AuthLayout,
  args: {
    heading: 'Create your account',
    subheading: 'Get connected in minutes.',
    children: (
      <div className="rounded-2xl bg-white/5 p-6 font-manrope text-sm text-neutral-300 ring-1 ring-white/10">
        Form content goes here (TextFields, Buttons…)
      </div>
    ),
  },
  parameters: designerMeta({
    subtitle: 'Sign-up, sign-in, and policy frames',
    purpose:
      'Page chrome for account journeys. Sign-up is light and airy; sign-in is dark; policy is a reading layout for legal copy.',
    states: 'Sign up (light), Sign in (dark), Policy, Sign up with side content.',
    usage: 'Swap heading, subheading, and the form slot. Optional side column is for a selling point, not extra fields.',
    fullBleed: true,
  }),
} satisfies Meta<typeof AuthLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignUpLight: Story = {
  args: { variant: 'signup' },
  parameters: designerStory('Light registration frame. Heading + form card. This is the default create-account page.'),
};

export const SignInDark: Story = {
  args: {
    variant: 'signin',
    heading: 'Welcome back',
    belowCard: <p className="text-center text-sm text-neutral-400">Forgot your password?</p>,
  },
  parameters: designerStory('Dark return visit. Use for login. Supporting links (forgot password) sit under the card.'),
};

export const Policy: Story = {
  args: {
    variant: 'policy',
    heading: 'Terms & Conditions',
    children: <p className="font-manrope text-sm text-neutral-300">Long legal text…</p>,
  },
  parameters: designerStory('Reading layout for terms, privacy, and RICA notices. Wider type column, less chrome.'),
};

export const WithSideContent: Story = {
  args: {
    variant: 'signup',
    side: (
      <div className="rounded-3xl bg-[#ABFF63] p-8 text-neutral-900">
        <h3 className="font-grotesque text-3xl font-bold">Why join Limes?</h3>
        <ul className="mt-4 list-disc space-y-1 pl-5 font-manrope text-sm">
          <li>No lock-in</li>
          <li>Cash back</li>
          <li>Keep your number</li>
        </ul>
      </div>
    ),
  },
  parameters: designerStory('Sign-up with a lime selling panel on the side. Desktop-only companion; the form stays the focus on mobile.'),
};
