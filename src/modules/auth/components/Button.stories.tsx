import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import Button from './Button';

const meta = {
  title: 'Auth/Button',
  component: Button,
  parameters: {},
  args: {
    children: 'Click me',
    variant: 'primary',
    fullWidth: false,
    disabled: false,
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['primary', 'secondary'],
    },
    fullWidth: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledSecondary: Story = {
  args: {
    variant: 'secondary',
    disabled: true,
  },
};
