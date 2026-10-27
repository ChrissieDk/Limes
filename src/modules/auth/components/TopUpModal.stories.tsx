import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import TopUpModal from './TopUpModal';
import { withPaymentMock } from '../../../test/withPaymentMock';

const meta = {
  title: 'Payment/TopUpModal',
  component: TopUpModal,
  decorators: [withPaymentMock],
  args: {
    open: true,
    onClose: () => {},
    phoneNumber: '098 898 8989',
    phoneNumbers: ['098 898 8989'],
  },
  parameters: {
    ...designerMeta({
      subtitle: 'Buy airtime or a bundle now',
      purpose:
        'Paystack top-up overlay: pick a number, pick a bundle, pay. Opens from a SIM card’s top-up action.',
      states: 'Open (catalogue loading or error).',
      usage: 'Full-bleed. The bundle list talks to the live catalogue, so in Storybook you will mainly see loading or empty/error — still the layout to design against.',
      fullBleed: true,
    }),
  },
} satisfies Meta<typeof TopUpModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  parameters: designerStory('Overlay on a dashboard-sized canvas. Review the header, number switcher, and the space the bundle grid occupies.'),
};
