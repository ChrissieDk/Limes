import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, userEvent, within, expect } from '@storybook/test';
import TextField from './TextField';

const meta = {
  title: 'Auth/TextField',
  component: TextField,
  parameters: {},
  args: {
    label: 'Email address',
    placeholder: 'you@example.com',
    type: 'text',
    variant: 'light',
    onChange: fn(),
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['light', 'dark'],
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number'],
    },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPrefix: Story = {
  args: {
    label: 'Phone number',
    prefix: '+27',
    placeholder: '81 234 5678',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email address',
    error: 'Please enter a valid email address',
    defaultValue: 'not-an-email',
    type: 'email',
  },
};

export const DarkVariant: Story = {
  args: {
    label: 'Email address',
    variant: 'dark',
  },
};

export const DarkWithPrefix: Story = {
  args: {
    label: 'Phone number',
    prefix: '+27',
    variant: 'dark',
    placeholder: '81 234 5678',
  },
};

export const DarkWithError: Story = {
  args: {
    label: 'Email address',
    variant: 'dark',
    error: 'Please enter a valid email address',
    defaultValue: 'not-an-email',
    type: 'email',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
  },
};

export const PasswordDark: Story = {
  args: {
    label: 'Password',
    type: 'password',
    variant: 'dark',
    placeholder: 'Enter your password',
  },
};

export const PasswordToggleInteraction: Story = {
  args: {
    label: 'Password',
    type: 'password',
    defaultValue: 'MySecret123',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('password is hidden by default', async () => {
      const input = canvas.getByPlaceholderText('');
      expect(input).toHaveAttribute('type', 'password');
    });

    await step('clicking the eye icon reveals the password', async () => {
      const toggle = canvas.getByRole('button', { name: 'Show password' });
      await userEvent.click(toggle);
      const input = canvas.getByPlaceholderText('');
      expect(input).toHaveAttribute('type', 'text');
    });

    await step('clicking again hides the password', async () => {
      const toggle = canvas.getByRole('button', { name: 'Hide password' });
      await userEvent.click(toggle);
      const input = canvas.getByPlaceholderText('');
      expect(input).toHaveAttribute('type', 'password');
    });
  },
};
