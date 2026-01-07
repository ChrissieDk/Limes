import type { SimCard, Plan } from './dashboardTypes';

export const mockSimCards: SimCard[] = [
  {
    id: '1',
    name: 'Sim 1',
    phoneNumber: '', // Will be populated from user.msisdns API response
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



export const mockCurrentPlan: Plan = {
  name: 'Lite Plan',
  mobileData: '10GB',
  messaging: '10 SMS',
  phone: '10 Min',
  price: 199.99,
};
