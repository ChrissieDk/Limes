import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../../storybook/designerDocs';
import { PortNumberModal } from './PortNumberModal';

const meta = {
  title: 'Dashboard/PortNumberModal',
  component: PortNumberModal,
  args: {
    open: true,
    onClose: () => {},
    currentMsisdn: '098 898 8989',
    onConfirm: () => {},
  },
  parameters: designerMeta({
    subtitle: 'Bring a number across to Limes',
    purpose:
      'Confirms the current MSISDN and collects the number the customer wants to port in. Overlay on the dashboard.',
    states: 'Open, Confirming.',
    usage: 'Keep the current number read-only. The new number field is the only input. Full-bleed so the dimmed dashboard stays in context.',
    fullBleed: true,
  }),
} satisfies Meta<typeof PortNumberModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  parameters: designerStory('Empty form on open. Current Limes number is visible; destination number is waiting for input.'),
};

export const ConfirmResolves: Story = {
  play: async ({ canvas, userEvent }) => {
    const inputs = canvas.getAllByRole('textbox');
    await userEvent.type(inputs[1], '0823234500');
  },
  args: {
    onConfirm: () => Promise.resolve(),
  },
  parameters: designerStory('Customer has typed a number to port. Confirm should succeed and close; this is the happy path.'),
};
