export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  total: number;
}

export interface Attachment {
  name: string;
  url: string;
}

export interface Branding {
  logoUrl?: string;
  themeColor?: string;
  footerNote?: string;
}

export interface RecurringSettings {
  isRecurring: boolean;
  interval: 'monthly' | 'yearly' | 'weekly' | null;
  nextIssueDate: string | null;
}

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'draft' | 'cancelled';

export interface Invoice {
  invoiceId: string;
  userId: string;
  clientId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  currency: string;
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  pdfUrl?: string;
  attachments?: Attachment[];
  branding?: Branding;
  recurring?: RecurringSettings;
  createdAt: string;
  updatedAt: string;
}
