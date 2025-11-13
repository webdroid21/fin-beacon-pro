/**
 * Financial Module Types
 * Comprehensive type definitions for invoices, clients, payments, expenses, and budgets
 */

// ============================================================================
// CLIENT TYPES
// ============================================================================

export interface ClientAddress {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface Client {
  id?: string;
  clientId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: ClientAddress;
  companyName?: string;
  taxNumber?: string;
  currency: string;
  preferredLanguage?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// INVOICE TYPES
// ============================================================================

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g., 0.1 for 10%
  discount?: number;
  total: number; // calculated: (quantity * unitPrice * (1 + taxRate)) - discount
}

export interface InvoiceBranding {
  logoUrl?: string;
  themeColor?: string;
  footerNote?: string;
}

export interface InvoiceAttachment {
  name: string;
  url: string;
}

export interface InvoiceRecurring {
  isRecurring: boolean;
  interval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextIssueDate?: string;
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id?: string;
  invoiceId: string;
  userId: string;
  clientId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  currency: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  pdfUrl?: string;
  attachments?: InvoiceAttachment[];
  branding?: InvoiceBranding;
  recurring?: InvoiceRecurring;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export type PaymentMethod = 
  | 'bank transfer' 
  | 'cash' 
  | 'mobile money' 
  | 'card' 
  | 'paypal' 
  | 'stripe'
  | 'check'
  | 'other';

export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';

export interface Payment {
  id?: string;
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

// ============================================================================
// EXPENSE TYPES
// ============================================================================

export type ExpenseCategory = 
  | 'Rent'
  | 'Utilities'
  | 'Supplies'
  | 'Marketing'
  | 'Salaries'
  | 'Insurance'
  | 'Travel'
  | 'Software'
  | 'Equipment'
  | 'Professional Services'
  | 'Taxes'
  | 'Other';

export type TransactionType = 'income' | 'expense';

export interface Expense {
  id?: string;
  expenseId: string;
  userId: string;
  category: ExpenseCategory | string;
  description: string;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  date: string;
  month: string; // YYYY-MM format
  type: TransactionType;
  vendor?: string;
  attachmentUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// BUDGET TYPES
// ============================================================================

export interface Budget {
  id?: string;
  budgetId: string;
  userId: string;
  month: string; // YYYY-MM format
  year: number;
  currency: string;
  incomeGoal: number;
  expenseLimit: number;
  actualIncome: number;
  actualExpenses: number;
  categories?: {
    [category: string]: {
      limit: number;
      actual: number;
    };
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ACCOUNTING TYPES
// ============================================================================

export type AccountType = 
  | 'asset' 
  | 'liability' 
  | 'equity' 
  | 'revenue' 
  | 'expense';

export interface Account {
  id?: string;
  accountId: string;
  userId: string;
  accountNumber: string;
  name: string;
  type: AccountType;
  subtype?: string;
  description?: string;
  currency: string;
  balance: number;
  parentAccountId?: string; // for sub-accounts
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id?: string;
  transactionId: string;
  userId: string;
  date: string;
  description: string;
  reference?: string;
  entries: TransactionEntry[];
  attachmentUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionEntry {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

// ============================================================================
// DASHBOARD ANALYTICS TYPES
// ============================================================================

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueAmount: number;
  clientCount: number;
  invoiceCount: number;
  paymentCount: number;
}

export interface MonthlyStats {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  invoices: number;
  payments: number;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface FilterOptions {
  status?: InvoiceStatus[];
  clientId?: string;
  dateRange?: DateRange;
  minAmount?: number;
  maxAmount?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}
