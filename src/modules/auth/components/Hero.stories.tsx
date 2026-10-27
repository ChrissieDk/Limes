import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../storybook/designerDocs';
import Hero from './Hero';

const meta = {
  title: 'Marketing/Hero',
  component: Hero,
  parameters: designerMeta({
    subtitle: 'Homepage opening statement',
    purpose:
      'First screen of the marketing site: headline, supporting line, primary join CTA, and product photography. Guest path is what Storybook can show (auth reports logged-out).',
    states: 'Guest.',
    usage: 'Full-bleed, above the fold. Headline is Manrope 700; the lime CTA should be the only primary action.',
    fullBleed: true,
  }),
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Guest: Story = {
  parameters: designerStory('Logged-out hero. Join is the main action. Check headline wrap, image crop, and contrast on the photography.'),
};
