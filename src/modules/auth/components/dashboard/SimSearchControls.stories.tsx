import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { SimSearchControls } from './SimSearchControls';

const meta = {
  title: 'Dashboard/SimSearchControls',
  component: SimSearchControls,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
} satisfies Meta<typeof SimSearchControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MiddleOfList: Story = {
  args: {
    searchTerm: '',
    onSearchTermChange: fn(),
    displayPosition: 2,
    displayTotal: 5,
    canGoPrev: true,
    canGoNext: true,
    onPrev: fn(),
    onNext: fn(),
  },
};

export const FirstItem: Story = {
  args: {
    searchTerm: '',
    onSearchTermChange: fn(),
    displayPosition: 1,
    displayTotal: 3,
    canGoPrev: false,
    canGoNext: true,
    onPrev: fn(),
    onNext: fn(),
  },
};

export const LastItem: Story = {
  args: {
    searchTerm: '',
    onSearchTermChange: fn(),
    displayPosition: 4,
    displayTotal: 4,
    canGoPrev: true,
    canGoNext: false,
    onPrev: fn(),
    onNext: fn(),
  },
};

export const SingleResult: Story = {
  args: {
    searchTerm: '',
    onSearchTermChange: fn(),
    displayPosition: 1,
    displayTotal: 1,
    canGoPrev: false,
    canGoNext: false,
    onPrev: fn(),
    onNext: fn(),
  },
};

export const WithSearchTerm: Story = {
  args: {
    searchTerm: 'Sim 2',
    onSearchTermChange: fn(),
    displayPosition: 1,
    displayTotal: 2,
    canGoPrev: false,
    canGoNext: true,
    onPrev: fn(),
    onNext: fn(),
  },
};
