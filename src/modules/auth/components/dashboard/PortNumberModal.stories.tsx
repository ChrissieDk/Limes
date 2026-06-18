import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import { PortNumberModal } from './PortNumberModal'

const meta = {
  title: 'Dashboard/PortNumberModal',
  component: PortNumberModal,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
} satisfies Meta<typeof PortNumberModal>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    open: true,
    onClose: fn(),
    currentMsisdn: '098 898 8989',
    onConfirm: fn(),
  },
}

export const WithDifferentNumber: Story = {
  args: {
    open: true,
    onClose: fn(),
    currentMsisdn: '082 323 4500',
    onConfirm: fn(),
  },
}
