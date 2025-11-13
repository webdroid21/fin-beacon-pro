export interface Budget {
  budgetId: string;
  userId: string;
  month: string;
  year: number;
  currency: string;
  incomeGoal: number;
  expenseLimit: number;
  actualIncome: number;
  actualExpenses: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
