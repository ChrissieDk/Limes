import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, userEvent, within, expect } from '@storybook/test';
import FileUpload from './FileUpload';

const meta = {
  title: 'Auth/FileUpload',
  component: FileUpload,
  parameters: {},
  args: {
    label: 'Upload your ID document',
    onFileSelect: fn(),
  },
  argTypes: {
    accept: {
      control: 'text',
    },
    uploadedFileName: {
      control: 'text',
    },
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomAccept: Story = {
  args: {
    label: 'Upload your profile photo',
    accept: 'image/png,image/jpeg',
  },
};

export const FileAlreadyUploaded: Story = {
  args: {
    label: 'Upload your ID document',
    uploadedFileName: 'id_document.pdf',
  },
};

export const FileUploadedImage: Story = {
  args: {
    label: 'Upload a selfie',
    uploadedFileName: 'selfie_photo.jpg',
    accept: 'image/*',
  },
};

export const FileUploadInteraction: Story = {
  args: {
    label: 'Upload your ID document',
    onFileSelect: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const fileInput = canvas.getByLabelText<HTMLInputElement>('Upload your ID document');

    const file = new File(['dummy content'], 'id_document.pdf', {
      type: 'application/pdf',
    });

    await userEvent.upload(fileInput, file);

    await expect(args.onFileSelect).toHaveBeenCalledTimes(1);
    const callArg = (args.onFileSelect as ReturnType<typeof fn>).mock.calls[0][0] as File;
    expect(callArg.name).toBe('id_document.pdf');
  },
};
