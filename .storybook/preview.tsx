import type { Preview } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { Title, Subtitle, Description, Primary, Stories } from '@storybook/addon-docs/blocks';
import { withDesignerFrame } from './DesignerFrame';
import '../src/index.css';
import './preview.css';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    withDesignerFrame,
    (Story) => (
      <HelmetProvider>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </HelmetProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    viewMode: 'docs',
    backgrounds: {
      options: {
        light: { name: 'Light', value: '#ffffff' },
        dark: { name: 'Dark', value: '#0a0a0b' },
      },
    },
    docs: {
      canvas: { sourceState: 'hidden', withToolbar: false },
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Stories />
        </>
      ),
    },
    controls: { expanded: true },
    options: {
      storySort: {
        order: ['Welcome', 'Foundations', 'Dashboard', 'Payment', 'Marketing'],
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'light' },
  },
};

export default preview;
