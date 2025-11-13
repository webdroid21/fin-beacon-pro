export type PaymentMethod = 'bank transfer' | 'cash' | 'mobile money' | 'card' | 'paypal' | 'stripe';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed';

export interface Payment {
  paymentId: string;
  invoiceId: string;
  userId: string;
  clientId: string;
  method: PaymentMethod;
  transactionRef?: string;
  currency: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}
