import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import ContactForm from './ContactForm';

const meta = {
  title: 'Marketing/ContactForm',
  component: ContactForm,
  args: { onSubmit: async () => {} },
  parameters: designerMeta({
    subtitle: 'Contact form',
    purpose: 'Enquiry form used on the Contact and For Businesses pages. The company field is optional per page.',
    states: 'Default, Without company, Validation errors, Send failed.',
    usage: 'Dark panel, two-column fields on desktop. Errors appear under each field with an icon.',
  }),
  render: (args) => (
    <div className="max-w-xl rounded-2xl bg-neutral-900 p-6">
      <ContactForm {...args} />
    </div>
  ),
} satisfies Meta<typeof ContactForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Empty form with placeholders and the lime Send message button.'),
};

export const WithoutCompany: Story = {
  args: { showCompany: false },
  parameters: designerStory('Contact page variant: company field hidden, contact number spans the full row.'),
};

export const ValidationErrors: Story = {
  parameters: designerStory('Submitting empty shows a red border and message under every invalid field.'),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Send message' }));
  },
};

export const SendFailed: Story = {
  args: {
    onSubmit: async () => {
      throw new Error('Could not send your message. Please try again.');
    },
  },
  parameters: designerStory('Server failure after valid input: error shown beneath the button.'),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByPlaceholderText('Eg. Eric Brick'), 'Eric Brick');
    await userEvent.type(c.getByPlaceholderText('Eg. eric@mail.co.za'), 'eric@mail.co.za');
    await userEvent.selectOptions(c.getByLabelText('Query type'), 'partnership');
    await userEvent.type(c.getByPlaceholderText('Enter your message'), 'Hello');
    await userEvent.click(c.getByRole('button', { name: 'Send message' }));
  },
};
