import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import ApiDocsTeaser from './ApiDocsTeaser';

const meta = {
  title: 'Marketing/ApiDocsTeaser',
  component: ApiDocsTeaser,
  parameters: designerMeta({
    subtitle: 'Developer docs invite',
    purpose:
      'Blue-dot "Built for developers" label, "Ready-to-go API documentation" heading, docs video and a "Request API access" button. Sits under the benefits grid on the For Businesses page.',
    states: 'Default.',
    usage: 'Full-bleed section. The CTA links to the contact page.',
    fullBleed: true,
  }),
} satisfies Meta<typeof ApiDocsTeaser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Default teaser. Check that the docs CTA is clearly secondary to the consumer join story on the same page.'),
};
