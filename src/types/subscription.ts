export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  renewalDate: string;
  category: string;
  description?: string;
  isActive: boolean;
  billingPeriod: 'mensal' | 'anual';
}

export interface SubscriptionFormData {
  name: string;
  price: number;
  currency: string;
  renewalDate: string;
  category: string;
  description?: string;
  billingPeriod: 'mensal' | 'anual';
}