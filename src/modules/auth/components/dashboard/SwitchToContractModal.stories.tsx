import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import { SwitchToContractModal } from './SwitchToContractModal'

const meta = {
  title: 'Dashboard/SwitchToContractModal',
  component: SwitchToContractModal,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
} satisfies Meta<typeof SwitchToContractModal>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    open: true,
    onClose: fn(),
    msisdn: '0823234500',
    productId: '7029225P',
    onConfirm: fn(),
  },
}

export const DifferentProduct: Story = {
  args: {
    open: true,
    onClose: fn(),
    msisdn: '0988988989',
    productId: '7023225P',
    onConfirm: fn(),
  },
}
