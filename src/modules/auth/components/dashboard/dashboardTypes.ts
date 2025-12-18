import type { Balance } from '../../../../types';

export interface SimCard {
  id: string;
  name: string;
  phoneNumber: string;
  isActive: boolean;
  hasVoiceTopUp: boolean;
  plan: {
    mobileData: string;
    airtime: string;
    messaging: string;
    phone: string;
  };
  balances?: Balance[];
}

export interface Transaction {
  id: string;
  type: string;
  status: 'Success' | 'In Progress' | 'Failed';
  date: string;
  amount: number;
}

export interface Plan {
  name: string;
  mobileData: string;
  messaging: string;
  phone: string;
  price: number;
}

export interface Bundle {
  name: string;
  type: 'flex' | 'lite' | '3-month';
  dayData: string;
  nightData?: string;
  cashback?: string;
  isOnceOff?: boolean;
  featured?: boolean;
  hasImage?: boolean;
}
