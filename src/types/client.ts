import type { Address } from './user';

export interface Client {
  clientId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  companyName?: string;
  taxNumber?: string;
  currency: string;
  preferredLanguage: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
