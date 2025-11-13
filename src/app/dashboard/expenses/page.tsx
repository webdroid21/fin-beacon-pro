'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserExpenses, deleteExpense } from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Trash2, Receipt, TrendingDown, TrendingUp, PieChart } from 'lucide-react';
import type { Expense } from '@/types/financial';
import Link from 'next/link';

export default function ExpensesPage() {
  const { user, userProfile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const loadExpenses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserExpenses(user.uid);
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await deleteExpense(expenseId);
      setExpenses(expenses.filter(e => e.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || expense.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const stats = {
    totalExpenses: expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0),
    totalIncome: expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0),
    netIncome: expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0) - 
               expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0),
    count: expenses.length,
  };

  // Category breakdown
  const categoryBreakdown = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses & Income</h1>
          <p className="text-muted-foreground">
            Track your spending and revenue
          </p>
        </div>
        <Link href="/dashboard/expenses/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Income</p>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalIncome, userProfile?.businessProfile?.currency || 'UGX')}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {formatCurrency(stats.totalExpenses, userProfile?.businessProfile?.currency || 'UGX')}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Net Income</p>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className={`mt-2 text-2xl font-bold ${stats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(stats.netIncome, userProfile?.businessProfile?.currency || 'UGX')}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Entries</p>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.count}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'income', 'expense'].map((type) => (
            <Button
              key={type}
              variant={typeFilter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(type)}
            >
              {type === 'all' ? 'All' : type === 'income' ? 'Income' : 'Expenses'}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Expenses Table */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No entries found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first entry'}
              </p>
              {!searchQuery && (
                <Link href="/dashboard/expenses/new">
                  <Button className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Add Entry
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-lg border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Description</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Vendor</th>
                      <th className="px-6 py-3 text-right text-sm font-medium">Amount</th>
                      <th className="px-6 py-3 text-center text-sm font-medium">Type</th>
                      <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">{expense.description}</td>
                        <td className="px-6 py-4 text-sm">{expense.category}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {expense.vendor || '-'}
                        </td>
                        <td className={`px-6 py-4 text-right text-sm font-medium ${
                          expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {expense.type === 'income' ? '+' : '-'}
                          {formatCurrency(expense.amount, expense.currency)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            expense.type === 'income' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {expense.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => expense.id && handleDelete(expense.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Top Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-card">
            <div className="border-b p-6">
              <h2 className="text-lg font-semibold">Top Expense Categories</h2>
            </div>
            <div className="p-6">
              {topCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No expense data yet
                </p>
              ) : (
                <div className="space-y-4">
                  {topCategories.map(([category, amount], index) => (
                    <div key={category}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{category}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(amount, userProfile?.businessProfile?.currency || 'UGX')}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${(amount / stats.totalExpenses) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {((amount / stats.totalExpenses) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
