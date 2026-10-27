import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../../storybook/designerDocs';
import { SimCard } from './SimComponents';
import type { SimCard as SimCardModel } from './dashboardTypes';

const baseSim: SimCardModel = {
  id: '1',
  name: 'Sim 1',
  phoneNumber: '098 898 8989',
  isActive: true,
  hasVoiceTopUp: true,
  packageType: 'prepaid',
  plan: { mobileData: '10GB', airtime: 'R50', messaging: '100 SMS', phone: '100 Min' },
};

const noop = () => {};

const meta = {
  title: 'Dashboard/SimCard',
  component: SimCard,
  args: {
    sim: baseSim,
    onTopUp: noop,
    onActivate: noop,
    onRename: noop,
    onChoosePlan: noop,
  },
  parameters: designerMeta({
    subtitle: 'One SIM in the dashboard stack',
    purpose:
      'Identity + status for a single SIM: name, number, active/activating, and the actions (top up, choose plan, rename, activate).',
    states: 'Active, Active without a plan, Awaiting activation, Can activate, Activating, Status loading, Rename hidden.',
    usage: 'The name is inline-editable when rename is provided. Disable top-up until the SIM is active.',
  }),
  render: (args) => (
    <div className="max-w-lg">
      <SimCard {...args} />
    </div>
  ),
} satisfies Meta<typeof SimCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: { isActive: true },
  parameters: designerStory('Live SIM. Status pill is Active. Top up and choose-plan are available because there is no subscription id yet.'),
};

export const ActiveNoPlan: Story = {
  args: { isActive: true },
  parameters: designerStory('Active SIM that still needs a package. The choose-plan CTA is the next step, not top-up of an existing bundle.'),
};

export const AwaitingActivation: Story = {
  args: { isActive: false },
  parameters: designerStory('Number allocated, not live. Status reads “Activation in progress”. Top-up is disabled.'),
};

export const CanActivate: Story = {
  args: { isActive: false, canActivate: true },
  parameters: designerStory('Customer can start activation themselves (RICA complete). Show the activate action.'),
};

export const Activating: Story = {
  args: { isActive: false, canActivate: true, isActivating: true },
  parameters: designerStory('Activate tap in flight. The button should look busy / locked so it is not double-submitted.'),
};

export const StatusLoading: Story = {
  args: { activationStatusLoading: true },
  parameters: designerStory('Network is still resolving active vs not. Hide the status pill until the answer arrives.'),
};

export const WithoutRename: Story = {
  args: { isActive: true, onRename: undefined },
  parameters: designerStory('Name is display-only. Use when the SIM label is system-assigned and should not be edited.'),
};
