import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { SimCard, PlanDetails } from './SimComponents';
import { mockSimCards } from './dashboardMocks';
import type { SimCard as SimCardModel } from './dashboardTypes';

// ---- SimCard stories ----

const simCardMeta = {
  title: 'Dashboard/SimCard',
  component: SimCard,
  parameters: {
    design: {
      type: 'figma',
      url: '',
    },
  },
} satisfies Meta<typeof SimCard>;

export default simCardMeta;
type SimCardStory = StoryObj<typeof simCardMeta>;

const baseSim: SimCardModel = {
  ...mockSimCards[0],
  phoneNumber: '082 123 4567',
};

export const Active: SimCardStory = {
  args: {
    sim: { ...baseSim, isActive: true },
    onTopUp: fn(),
    onActivate: fn(),
    isActive: true,
  },
};

export const ActivationInProgress: SimCardStory = {
  args: {
    sim: { ...baseSim, isActive: false, name: 'Sim 2' },
    onTopUp: fn(),
    onActivate: fn(),
    isActive: false,
    activationStatusLoading: false,
  },
};

export const AwaitingActivation: SimCardStory = {
  args: {
    sim: { ...baseSim, isActive: false, name: 'Sim 3' },
    onTopUp: fn(),
    onActivate: fn(),
    isActive: false,
    canActivate: false,
  },
};

export const CanActivate: SimCardStory = {
  args: {
    sim: { ...baseSim, isActive: false, name: 'Sim 4' },
    onTopUp: fn(),
    onActivate: fn(),
    canActivate: true,
    isActive: false,
  },
};

export const Activating: SimCardStory = {
  args: {
    sim: { ...baseSim, isActive: false, name: 'Sim 5' },
    onTopUp: fn(),
    onActivate: fn(),
    canActivate: true,
    isActivating: true,
    isActive: false,
  },
};

export const CheckingStatus: SimCardStory = {
  args: {
    sim: { ...baseSim, phoneNumber: '083 987 6543' },
    onTopUp: fn(),
    onActivate: fn(),
    isActive: undefined,
    activationStatusLoading: true,
  },
};

export const WithRename: SimCardStory = {
  args: {
    sim: { ...baseSim, isActive: true, name: 'My SIM' },
    onTopUp: fn(),
    onActivate: fn(),
    onRename: fn(),
    isActive: true,
  },
};

// ---- PlanDetails stories ----

export const PlanDetailsDefault: StoryObj<Meta<typeof PlanDetails>> = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <PlanDetails
        sim={{
          ...baseSim,
          isActive: true,
          balances: [
            {
              balanceDefinitionId: '1',
              balanceName: 'Data',
              initialValue: '10737418240',
              value: '5368709120',
              formatted: '5GB',
              grouping: 'data',
              rewards: '',
              definitionName: 'Data',
              definitionCode: 'DATA',
              progress: 50,
              displayOrder: 1,
              formattedParts: { value: '5GB', initialValue: '10GB', formatted: '5GB', progressPercent: 50, prepend: '', used: 5368709120, symbol: '' },
            },
            {
              balanceDefinitionId: '2',
              balanceName: 'Airtime',
              initialValue: '5000',
              value: '2500',
              formatted: 'R25',
              grouping: 'gpa',
              rewards: '',
              definitionName: 'GPA Credit',
              definitionCode: 'GPA_CREDIT',
              progress: 50,
              displayOrder: 2,
              formattedParts: { value: 'R25', initialValue: 'R50', formatted: 'R25', progressPercent: 50, prepend: 'R', used: 2500, symbol: '' },
            },
            {
              balanceDefinitionId: '3',
              balanceName: 'SMS',
              initialValue: '100',
              value: '50',
              formatted: '50',
              grouping: 'sms',
              rewards: '',
              definitionName: 'SMS',
              definitionCode: 'SMS',
              progress: 50,
              displayOrder: 3,
              formattedParts: { value: '50', initialValue: '100', formatted: '50', progressPercent: 50, prepend: '', used: 50, symbol: '' },
            },
          ],
        }}
        onPortMyNumber={fn()}
        onSwitchToContract={fn()}
      />
    </div>
  ),
};

export const PlanDetailsPortingInProgress: StoryObj<Meta<typeof PlanDetails>> = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <PlanDetails
        sim={{ ...baseSim, isActive: true }}
        onPortMyNumber={fn()}
        onSwitchToContract={fn()}
        isPortingInProgress
      />
    </div>
  ),
};
