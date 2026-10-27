import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import ApiDocsTeaser from './ApiDocsTeaser';

const meta = {
  title: 'Marketing/ApiDocsTeaser',
  component: ApiDocsTeaser,
  parameters: designerMeta({
    subtitle: 'Developer docs invite',
    purpose:
      'A compact teaser that points builders at the public API docs. Lives on marketing, not inside the consumer dashboard.',
    states: 'Default.',
    usage: 'Full-bleed section. One sentence of value plus a docs link — not a code sample dump.',
    fullBleed: true,
  }),
} satisfies Meta<typeof ApiDocsTeaser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: designerStory('Default teaser. Check that the docs CTA is clearly secondary to the consumer join story on the same page.'),
};
