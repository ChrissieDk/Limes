import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../../storybook/designerDocs';
import { SwitchToContractModal } from './SwitchToContractModal';

const meta = {
  title: 'Dashboard/SwitchToContractModal',
  component: SwitchToContractModal,
  args: {
    open: true,
    onClose: () => {},
    msisdn: '098 898 8989',
    productId: '7029225P',
    onConfirm: () => {},
  },
  parameters: designerMeta({
    subtitle: 'Move a prepaid SIM onto a contract',
    purpose:
      'Explains the switch, names the number, and asks for confirmation before starting the contract product.',
    states: 'Open.',
    usage: 'Use from a prepaid SIM that has a contract option. Do not bury legal caveats — they belong in this modal.',
    fullBleed: true,
  }),
} satisfies Meta<typeof SwitchToContractModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  parameters: designerStory('Confirmation overlay. Number and product are already known; the customer only confirms or dismisses.'),
};
