import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import PartnerFaqs from './PartnerFaqs';

const meta = {
  title: 'Marketing/PartnerFaqs',
  component: PartnerFaqs,
  parameters: designerMeta({
    subtitle: 'Partnership accordion',
    purpose: 'Answers the common questions prospective business partners ask before getting in touch.',
    states: 'First open, All collapsed.',
    usage: 'One item open at a time. Sits beside the contact form on the For Businesses page.',
  }),
  render: (args) => (
    <div className="max-w-xl rounded-2xl bg-neutral-900 p-6">
      <PartnerFaqs {...args} />
    </div>
  ),
} satisfies Meta<typeof PartnerFaqs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('First question open by default; chevron flips on collapsed items.'),
};

export const AllCollapsed: Story = {
  args: { defaultOpen: null },
  parameters: designerStory('Every item collapsed.'),
};
