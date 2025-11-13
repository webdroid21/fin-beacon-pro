export type ExpenseCategory = 'Utilities' | 'Rent' | 'Supplies' | 'Marketing' | 'Salary' | 'Other';
export type TransactionType = 'income' | 'expense';

export interface Expense {
  expenseId: string;
  userId: string;
  category: ExpenseCategory | string;
  description: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  date: string;
  month: string;
  type: TransactionType;
  vendor?: string;
  attachmentUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
