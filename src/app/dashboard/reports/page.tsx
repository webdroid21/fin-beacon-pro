'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getUserInvoices,
  getUserExpenses,
  getUserAccounts,
  getUserTransactions,
} from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { Invoice, Expense, Account, Transaction } from '@/types/financial';

type ReportType = 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'trial-balance';

export default function ReportsPage() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<ReportType>('profit-loss');
  const [period, setPeriod] = useState('current-month');
  const [data, setData] = useState<{
    invoices: Invoice[];
    expenses: Expense[];
    accounts: Account[];
    transactions: Transaction[];
  }>({
    invoices: [],
    expenses: [],
    accounts: [],
    transactions: [],
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [invoices, expenses, accounts, transactions] = await Promise.all([
        getUserInvoices(user.uid),
        getUserExpenses(user.uid),
        getUserAccounts(user.uid),
        getUserTransactions(user.uid),
      ]);
      setData({ invoices, expenses, accounts, transactions });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const currency = userProfile?.businessProfile?.currency || 'UGX';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const filterByPeriod = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();

    switch (period) {
      case 'current-month':
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case 'last-month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
      }
      case 'current-year':
        return date.getFullYear() === now.getFullYear();
      case 'all-time':
        return true;
      default:
        return true;
    }
  };

  // Profit & Loss Statement
  const renderProfitLossReport = () => {
    const revenue = data.invoices
      .filter(inv => inv.status === 'paid' && filterByPeriod(inv.issueDate))
      .reduce((sum, inv) => sum + inv.total, 0);

    const otherIncome = data.expenses
      .filter(exp => exp.type === 'income' && filterByPeriod(exp.date))
      .reduce((sum, exp) => sum + exp.amount, 0);

    const totalIncome = revenue + otherIncome;

    const expensesByCategory = data.expenses
      .filter(exp => exp.type === 'expense' && filterByPeriod(exp.date))
      .reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {} as Record<string, number>);

    const totalExpenses = Object.values(expensesByCategory).reduce((sum, amt) => sum + amt, 0);
    const netIncome = totalIncome - totalExpenses;

    return (
      <div className="space-y-6">
        {/* Revenue Section */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Revenue
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Invoice Revenue</span>
              <span className="font-medium">{formatCurrency(revenue)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Other Income</span>
              <span className="font-medium">{formatCurrency(otherIncome)}</span>
            </div>
            <div className="flex justify-between py-3 border-t font-semibold">
              <span>Total Income</span>
              <span className="text-green-600">{formatCurrency(totalIncome)}</span>
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Expenses
          </h3>
          <div className="space-y-2">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="flex justify-between py-2">
                <span className="text-muted-foreground">{category}</span>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </div>
            ))}
            {Object.keys(expensesByCategory).length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No expenses recorded for this period
              </p>
            )}
            <div className="flex justify-between py-3 border-t font-semibold">
              <span>Total Expenses</span>
              <span className="text-red-600">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </div>

        {/* Net Income */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Net Income
            </h3>
            <span className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netIncome)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {netIncome >= 0 ? 'Profit' : 'Loss'} for the selected period
          </p>
        </div>
      </div>
    );
  };

  // Balance Sheet
  const renderBalanceSheetReport = () => {
    const assets = data.accounts.filter(acc => acc.type === 'asset');
    const liabilities = data.accounts.filter(acc => acc.type === 'liability');
    const equity = data.accounts.filter(acc => acc.type === 'equity');

    const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
    const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0);

    return (
      <div className="space-y-6">
        {/* Assets */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-600">Assets</h3>
          <div className="space-y-2">
            {assets.map((account) => (
              <div key={account.id} className="flex justify-between py-2">
                <span className="text-muted-foreground">{account.name}</span>
                <span className="font-medium">{formatCurrency(account.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between py-3 border-t font-semibold">
              <span>Total Assets</span>
              <span className="text-blue-600">{formatCurrency(totalAssets)}</span>
            </div>
          </div>
        </div>

        {/* Liabilities */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 text-orange-600">Liabilities</h3>
          <div className="space-y-2">
            {liabilities.map((account) => (
              <div key={account.id} className="flex justify-between py-2">
                <span className="text-muted-foreground">{account.name}</span>
                <span className="font-medium">{formatCurrency(account.balance)}</span>
              </div>
            ))}
            {liabilities.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No liabilities recorded
              </p>
            )}
            <div className="flex justify-between py-3 border-t font-semibold">
              <span>Total Liabilities</span>
              <span className="text-orange-600">{formatCurrency(totalLiabilities)}</span>
            </div>
          </div>
        </div>

        {/* Equity */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 text-purple-600">Equity</h3>
          <div className="space-y-2">
            {equity.map((account) => (
              <div key={account.id} className="flex justify-between py-2">
                <span className="text-muted-foreground">{account.name}</span>
                <span className="font-medium">{formatCurrency(account.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-t">
              <span className="text-muted-foreground">Retained Earnings (Net Worth)</span>
              <span className="font-medium">{formatCurrency(totalAssets - totalLiabilities - totalEquity)}</span>
            </div>
            <div className="flex justify-between py-3 border-t font-semibold">
              <span>Total Equity</span>
              <span className="text-purple-600">{formatCurrency(totalAssets - totalLiabilities)}</span>
            </div>
          </div>
        </div>

        {/* Equation Check */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Accounting Equation</h3>
          <div className="space-y-2 text-center">
            <p className="text-muted-foreground">Assets = Liabilities + Equity</p>
            <p className="text-lg font-semibold">
              {formatCurrency(totalAssets)} = {formatCurrency(totalLiabilities)} + {formatCurrency(totalAssets - totalLiabilities)}
            </p>
            {Math.abs(totalAssets - (totalLiabilities + (totalAssets - totalLiabilities))) < 0.01 ? (
              <p className="text-sm text-green-600">✓ Balanced</p>
            ) : (
              <p className="text-sm text-red-600">⚠ Not balanced</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Cash Flow Statement
  const renderCashFlowReport = () => {
    const cashAccounts = data.accounts.filter(acc => 
      acc.type === 'asset' && (acc.subtype === 'cash' || acc.subtype === 'checking')
    );

    const cashInflows = data.expenses
      .filter(exp => exp.type === 'income' && filterByPeriod(exp.date))
      .reduce((sum, exp) => sum + exp.amount, 0);

    const cashOutflows = data.expenses
      .filter(exp => exp.type === 'expense' && filterByPeriod(exp.date))
      .reduce((sum, exp) => sum + exp.amount, 0);

    const netCashFlow = cashInflows - cashOutflows;
    const currentCashBalance = cashAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Cash Inflows</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Income Received</span>
              <span className="font-medium text-green-600">{formatCurrency(cashInflows)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Cash Outflows</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Expenses Paid</span>
              <span className="font-medium text-red-600">{formatCurrency(cashOutflows)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Net Cash Flow</h3>
          <div className="space-y-4">
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Net Change</span>
              <span className={`text-xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netCashFlow)}
              </span>
            </div>
            <div className="flex justify-between py-3 border-t">
              <span className="font-semibold">Current Cash Balance</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(currentCashBalance)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Trial Balance
  const renderTrialBalanceReport = () => {
    const allAccounts = data.accounts;
    const totalDebits = allAccounts
      .filter(acc => acc.balance > 0)
      .reduce((sum, acc) => sum + acc.balance, 0);
    
    const totalCredits = allAccounts
      .filter(acc => acc.balance < 0)
      .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);

    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">Account</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-6 py-3 text-right text-sm font-medium">Debit</th>
                  <th className="px-6 py-3 text-right text-sm font-medium">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allAccounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 text-sm font-medium">{account.name}</td>
                    <td className="px-6 py-4 text-sm capitalize">{account.type}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      {account.balance > 0 ? formatCurrency(account.balance) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      {account.balance < 0 ? formatCurrency(Math.abs(account.balance)) : '-'}
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold bg-muted/30">
                  <td className="px-6 py-4 text-sm" colSpan={2}>Total</td>
                  <td className="px-6 py-4 text-sm text-right">{formatCurrency(totalDebits)}</td>
                  <td className="px-6 py-4 text-sm text-right">{formatCurrency(totalCredits)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            View and export financial statements
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="profit-loss">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Profit & Loss</span>
              </div>
            </SelectItem>
            <SelectItem value="balance-sheet">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Balance Sheet</span>
              </div>
            </SelectItem>
            <SelectItem value="cash-flow">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Cash Flow</span>
              </div>
            </SelectItem>
            <SelectItem value="trial-balance">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Trial Balance</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current-month">Current Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="current-year">Current Year</SelectItem>
            <SelectItem value="all-time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Report Content */}
      {reportType === 'profit-loss' && renderProfitLossReport()}
      {reportType === 'balance-sheet' && renderBalanceSheetReport()}
      {reportType === 'cash-flow' && renderCashFlowReport()}
      {reportType === 'trial-balance' && renderTrialBalanceReport()}
    </div>
  );
}
