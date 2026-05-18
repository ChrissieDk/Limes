import type { Balance } from '../../../../types';

export interface SimCard {
  id: string;
  name: string;
  phoneNumber: string;
  isActive: boolean;
  hasVoiceTopUp: boolean;
  productId?: string;
  // Derived from MsisdnData.packageType (backend) or inferred from productId (fallback).
  packageType?: 'prepaid' | 'contract';
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
  reference: string;
  amountInCents: number;
  amountInRands: number;
  currency: string;
  status: 'success' | 'pending' | 'failed';
  channel: string;
  cardLast4?: string;
  cardType?: string;
  bank?: string;
  paidAt: string;
  createdAt: string;
  orderId?: string | null;
  productId?: string | null;
}

export interface Plan {
  name: string;
  mobileData: string;
  messaging: string;
  phone: string;
  price: number;
  productId?: string;
  hasActiveSubscription?: boolean;
  isAutoRenewing?: boolean;
  subscriptionStatus?: string;
  nextPaymentDate?: string;
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
