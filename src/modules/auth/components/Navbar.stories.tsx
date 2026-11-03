import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import Navbar from './Navbar';

const meta = {
  title: 'Marketing/Navbar',
  component: Navbar,
  parameters: designerMeta({
    subtitle: 'Marketing site header',
    purpose:
      'Public navigation: logo, product links, and sign-in / join. Storybook reports logged-out, which is the guest homepage treatment.',
    states: 'Logged out, plus one story per active link: Home pink, How Limes Works and Subscriptions green, For Businesses blue, Contact purple.',
    usage: 'Full-bleed on marketing pages. Keep the primary join action visually louder than sign in.',
    fullBleed: true,
  }),
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  parameters: designerStory('Guest header. Join / sign-in are both present; no account menu.'),
};

const activeStory = (route: string, text: string): Story => ({
  parameters: { route, ...designerStory(text) },
});

export const ActiveHome: Story = activeStory('/', 'Home active: pink pill.');
export const ActiveHowItWorks: Story = activeStory('/how-it-works', 'How Limes Works active: green pill.');
export const ActiveSubscriptions: Story = activeStory('/subscriptions', 'Subscriptions active: green pill.');
export const ActiveForBusinesses: Story = activeStory('/partners', 'For Businesses active: blue pill.');
export const ActiveContact: Story = activeStory('/contact', 'Contact active: purple pill.');
