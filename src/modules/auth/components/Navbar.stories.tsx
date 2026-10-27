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
    states: 'Logged out.',
    usage: 'Full-bleed on marketing pages. Keep the primary join action visually louder than sign in.',
    fullBleed: true,
  }),
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  parameters: designerStory('Guest header. Join / sign-in are both present; no account menu.'),
};
