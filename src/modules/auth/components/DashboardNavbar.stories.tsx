import type { Meta, StoryObj } from '@storybook/react-vite';
import DashboardNavbar from './DashboardNavbar';

const meta = {
  title: 'Dashboard/DashboardNavbar',
  component: DashboardNavbar,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
} satisfies Meta<typeof DashboardNavbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default state — no Firebase user logged in, shows "Account" as display name. */
export const Default: Story = {};
