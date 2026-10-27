import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../../storybook/designerDocs';
import { SimSearchControls } from './SimSearchControls';

const meta = {
  title: 'Dashboard/SimSearchControls',
  component: SimSearchControls,
  args: {
    searchTerm: '',
    onSearchTermChange: () => {},
    displayPosition: 1,
    displayTotal: 3,
    canGoPrev: false,
    canGoNext: true,
    onPrev: () => {},
    onNext: () => {},
  },
  parameters: designerMeta({
    subtitle: 'Find and page through SIMs',
    purpose:
      'Search by number plus prev/next when the customer has more than one SIM. Position “1 of 3” keeps orientation.',
    states: 'First of many, Middle, Last, Single SIM, With search term.',
    usage: 'Disable prev on the first item and next on the last. Hide paging intent when there is only one SIM.',
  }),
} satisfies Meta<typeof SimSearchControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstOfMany: Story = {
  parameters: designerStory('Start of the stack. Previous is disabled; next is available.'),
};

export const Middle: Story = {
  args: {
    displayPosition: 2,
    canGoPrev: true,
  },
  parameters: designerStory('Both arrows active. Use whenever the customer is not on the first or last SIM.'),
};

export const Last: Story = {
  args: {
    displayPosition: 3,
    canGoPrev: true,
    canGoNext: false,
  },
  parameters: designerStory('End of the stack. Next is disabled so it does not wrap.'),
};

export const SingleSim: Story = {
  args: {
    displayPosition: 1,
    displayTotal: 1,
    canGoNext: false,
  },
  parameters: designerStory('Only one SIM. Paging is inert; search still works if they want to confirm the number.'),
};

export const WithSearchTerm: Story = {
  args: {
    searchTerm: '082',
    displayPosition: 1,
    displayTotal: 1,
    canGoNext: false,
  },
  parameters: designerStory('Filter applied. The field shows the query; results are handled by the parent dashboard.'),
};
