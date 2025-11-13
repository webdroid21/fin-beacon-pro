export interface Address {
  street: string;
  city: string;
  country: string;
  postalCode?: string;
}

export interface BusinessProfile {
  name: string;
  industry?: string;
  logoUrl?: string;
  address: Address;
  phone: string;
  website?: string;
  currency: string;
  language: string;
  taxNumber?: string;
  registrationNumber?: string;
  timezone: string;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  defaultInvoicePrefix: string;
  autoGenerateInvoiceNumbers: boolean;
  dateFormat: string;
  defaultPaymentMethod: string;
}

export interface User {
  userId: string;
  authProvider: 'google' | 'email' | 'github' | 'apple';
  email: string;
  displayName: string;
  photoUrl?: string;
  emailVerified: boolean;
  businessProfile: BusinessProfile;
  settings: UserSettings;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}
