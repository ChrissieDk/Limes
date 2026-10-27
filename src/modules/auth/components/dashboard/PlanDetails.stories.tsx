import type { Meta, StoryObj } from '@storybook/react-vite';
import { designerMeta, designerStory } from '../../../../storybook/designerDocs';
import { PlanDetails } from './SimComponents';
import type { SimCard as SimCardModel } from './dashboardTypes';
import type { Balance } from '../../../../types';

function balance(partial: Pick<Balance, 'grouping' | 'definitionCode' | 'value'>): Balance {
  return {
    balanceDefinitionId: '1',
    balanceName: partial.definitionCode,
    initialValue: partial.value,
    value: partial.value,
    formatted: partial.value,
    rewards: '0',
    definitionName: partial.definitionCode,
    definitionCode: partial.definitionCode,
    progress: 40,
    displayOrder: 1,
    isVisible: true,
    formattedParts: {
      value: partial.value,
      initialValue: partial.value,
      formatted: partial.value,
      progressPercent: 40,
      prepend: '',
      used: 0,
      symbol: '',
    },
    grouping: partial.grouping,
  };
}

const simWithBalances: SimCardModel = {
  id: '1',
  name: 'Sim 1',
  phoneNumber: '098 898 8989',
  isActive: true,
  hasVoiceTopUp: true,
  plan: { mobileData: '10GB', airtime: 'R50', messaging: '100 SMS', phone: '100 Min' },
  balances: [
    balance({ grouping: 'data', definitionCode: 'DATA', value: '8.2GB' }),
    balance({ grouping: 'gpa', definitionCode: 'GPA_CREDIT', value: 'R32' }),
    balance({ grouping: 'voice', definitionCode: 'VOICE', value: '64 Min' }),
    balance({ grouping: 'sms', definitionCode: 'SMS', value: '78 SMS' }),
  ],
};

const meta = {
  title: 'Dashboard/PlanDetails',
  component: PlanDetails,
  args: {
    sim: simWithBalances,
    onPortMyNumber: () => {},
  },
  parameters: designerMeta({
    subtitle: 'Live balances under a SIM',
    purpose:
      'Breaks the current plan into remaining data, airtime, voice, and SMS. Falls back to plan copy when balances have not loaded.',
    states: 'With balances, Plan fallback only, Porting in progress.',
    usage: 'Sit directly under the SIM card. Porting in progress should replace the port CTA with a wait state.',
  }),
  render: (args) => (
    <div className="max-w-lg space-y-3">
      <PlanDetails {...args} />
    </div>
  ),
} satisfies Meta<typeof PlanDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithBalances: Story = {
  parameters: designerStory('Network balances present. Each grouping (data, wallet, voice, SMS) gets its remaining value.'),
};

export const PlanFallbackOnly: Story = {
  args: {
    sim: { ...simWithBalances, balances: undefined },
  },
  parameters: designerStory('Balances missing. Show the static plan allowances so the dashboard is never blank.'),
};

export const PortingInProgress: Story = {
  args: { isPortingInProgress: true },
  parameters: designerStory('Number port has been submitted. The port action should read as in progress, not as a new request.'),
};
