import type { SimCard, Transaction, Plan } from './dashboardTypes';

export const mockSimCards: SimCard[] = [
  {
    id: '1',
    name: 'Sim 1',
    phoneNumber: '27644038847', // Real MSISDN
    isActive: true,
    hasVoiceTopUp: true,
    plan: {
      mobileData: '0GB',
      airtime: 'R0',
      messaging: '0SMS',
      phone: '0 Min',
    },
  },
];

export const mockTransactions: Transaction[] = [
  { id: '1', type: 'Wallet Top-Up', status: 'Success', date: '8/2/2025', amount: 102.45 },
  { id: '2', type: 'Wallet Top-Up', status: 'In Progress', date: '8/2/2025', amount: 102.45 },
  { id: '3', type: 'Send Airtime', status: 'Success', date: '8/2/2025', amount: -102.45 },
  { id: '4', type: 'Wallet Top-Up', status: 'In Progress', date: '8/2/2025', amount: 102.45 },
  { id: '5', type: 'Send Airtime', status: 'Failed', date: '8/2/2025', amount: -102.45 },
];

export const mockCurrentPlan: Plan = {
  name: 'Lite Plan',
  mobileData: '10GB',
  messaging: '10 SMS',
  phone: '10 Min',
  price: 199.99,
};
