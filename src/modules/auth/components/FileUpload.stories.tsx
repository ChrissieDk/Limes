import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import FileUpload from './FileUpload';

const meta = {
  title: 'Foundations/FileUpload',
  component: FileUpload,
  args: {
    label: 'Proof of address',
    onFileSelect: () => {},
  },
  parameters: designerMeta({
    subtitle: 'Document dropzone for RICA and KYC',
    purpose:
      'Lets a customer attach a PDF or image (proof of address, ID). Idle invites a file; uploaded confirms the filename.',
    states: 'Idle, Uploaded.',
    usage: 'Place on a light card. The label should name the document, not the action.',
  }),
  render: (args) => (
    <div className="max-w-md rounded-2xl bg-white p-6">
      <FileUpload {...args} />
    </div>
  ),
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  parameters: designerStory('Empty dropzone. Customer has not chosen a file yet. This is the start of the RICA document step.'),
};

export const Uploaded: Story = {
  args: { uploadedFileName: 'bank-statement.pdf' },
  parameters: designerStory('File accepted. Shows the filename so the customer can confirm they attached the right document.'),
};
