import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import FaqAccordion from './FaqAccordion';
import { PARTNER_FAQS } from './partnerFaqs';

const meta = {
  title: 'Marketing/FaqAccordion',
  component: FaqAccordion,
  args: { title: 'FAQs', items: PARTNER_FAQS },
  parameters: designerMeta({
    subtitle: 'FAQ accordion',
    purpose: 'Collapsible question list used on the Contact and For Businesses pages.',
    states: 'First open, All collapsed.',
    usage: 'One item open at a time. Sits beside the contact form.',
  }),
  render: (args) => (
    <div className="max-w-xl rounded-2xl bg-neutral-900 p-6">
      <FaqAccordion {...args} />
    </div>
  ),
} satisfies Meta<typeof FaqAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('First question open by default; chevron flips on collapsed items.'),
};

export const AllCollapsed: Story = {
  args: { defaultOpen: null },
  parameters: designerStory('Every item collapsed.'),
};
