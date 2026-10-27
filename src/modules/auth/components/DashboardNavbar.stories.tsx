import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import DashboardNavbar from './DashboardNavbar';

const meta = {
  title: 'Dashboard/DashboardNavbar',
  component: DashboardNavbar,
  parameters: designerMeta({
    subtitle: 'Logged-in top bar',
    purpose:
      'Navigation once the customer is in the product: logo, dashboard links, and account. Auth is logged-out in Storybook, so you are seeing the guest-safe chrome.',
    states: 'Default.',
    usage: 'Full width at the top of every dashboard page. Do not place page titles in this bar.',
    fullBleed: true,
  }),
} satisfies Meta<typeof DashboardNavbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Resting dashboard nav. Account services are stubbed, so treat this as structure and spacing, not live user data.'),
};
