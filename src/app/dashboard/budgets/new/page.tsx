'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createBudget, getBudgetByMonth, getUserExpenses } from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Target, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

export default function NewBudgetPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previousMonthData, setPreviousMonthData] = useState<any>(null);

  const currentDate = new Date();
  const currentMonth = currentDate.toISOString().slice(0, 7);

  const [formData, setFormData] = useState({
    month: currentMonth,
    incomeGoal: 0,
    expenseLimit: 0,
    notes: '',
  });

  useEffect(() => {
    if (user && formData.month) {
      loadPreviousMonthData();
    }
  }, [user, formData.month]);

  const loadPreviousMonthData = async () => {
    if (!user) return;
    
    try {
      // Get previous month
      const selectedDate = new Date(formData.month + '-01');
      const prevMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
      const prevMonthStr = prevMonth.toISOString().slice(0, 7);

      // Try to get previous month's budget
      const prevBudget = await getBudgetByMonth(user.uid, prevMonthStr);
      
      if (prevBudget) {
        setPreviousMonthData({
          incomeGoal: prevBudget.incomeGoal,
          expenseLimit: prevBudget.expenseLimit,
          actualIncome: prevBudget.actualIncome,
          actualExpenses: prevBudget.actualExpenses,
        });
      }
    } catch (error) {
      console.error('Error loading previous month data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const [year, month] = formData.month.split('-');
      const currency = userProfile?.businessProfile?.currency || 'UGX';

      const budgetData = {
        budgetId: `BGT-${Date.now()}`,
        month: formData.month,
        year: parseInt(year),
        currency,
        incomeGoal: formData.incomeGoal,
        expenseLimit: formData.expenseLimit,
        actualIncome: 0,
        actualExpenses: 0,
        notes: formData.notes,
      };

      await createBudget(user.uid, budgetData);
      router.push('/dashboard/budgets');
    } catch (err: any) {
      setError(err.message || 'Failed to create budget');
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

  const netGoal = formData.incomeGoal - formData.expenseLimit;

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/budgets">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Budget</h1>
          <p className="text-muted-foreground">
            Set financial goals for the month
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-6 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border bg-card">
              <div className="border-b p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Budget Goals</h2>
                    <p className="text-sm text-muted-foreground">
                      Set your income and expense targets
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6">
                {/* Month Selection */}
                <div className="space-y-2">
                  <Label htmlFor="month">Month *</Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    required
                  />
                </div>

                {/* Income Goal */}
                <div className="space-y-2">
                  <Label htmlFor="incomeGoal" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Income Goal *
                  </Label>
                  <Input
                    id="incomeGoal"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.incomeGoal}
                    onChange={(e) => setFormData({ ...formData, incomeGoal: Number(e.target.value) })}
                    placeholder="0.00"
                    required
                  />
                  {previousMonthData && (
                    <p className="text-xs text-muted-foreground">
                      Last month: Goal {formatCurrency(previousMonthData.incomeGoal)}, 
                      Actual {formatCurrency(previousMonthData.actualIncome)}
                    </p>
                  )}
                </div>

                {/* Expense Limit */}
                <div className="space-y-2">
                  <Label htmlFor="expenseLimit" className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Expense Limit *
                  </Label>
                  <Input
                    id="expenseLimit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.expenseLimit}
                    onChange={(e) => setFormData({ ...formData, expenseLimit: Number(e.target.value) })}
                    placeholder="0.00"
                    required
                  />
                  {previousMonthData && (
                    <p className="text-xs text-muted-foreground">
                      Last month: Limit {formatCurrency(previousMonthData.expenseLimit)}, 
                      Actual {formatCurrency(previousMonthData.actualExpenses)}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Budget notes, goals, reminders..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Link href="/dashboard/budgets">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Budget
              </Button>
            </div>
          </form>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <div className="rounded-lg border bg-card">
              <div className="border-b p-6">
                <h2 className="text-lg font-semibold">Budget Summary</h2>
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Selected Month</p>
                  <p className="text-lg font-semibold">
                    {new Date(formData.month + '-01').toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">Income Goal</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(formData.incomeGoal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600">Expense Limit</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(formData.expenseLimit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-sm font-medium">Net Goal</span>
                    <span className={`text-lg font-bold ${netGoal >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {formatCurrency(netGoal)}
                    </span>
                  </div>
                </div>

                {netGoal < 0 && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    ⚠️ Warning: Expenses exceed income goal
                  </div>
                )}

                {netGoal > 0 && formData.incomeGoal > 0 && (
                  <div className="rounded-lg bg-primary/10 p-3 text-sm">
                    <p className="font-medium text-primary">Savings Goal</p>
                    <p className="text-muted-foreground mt-1">
                      {((netGoal / formData.incomeGoal) * 100).toFixed(1)}% of income
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="mb-3 text-sm font-semibold">💡 Budgeting Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Set realistic income goals based on past performance</li>
                <li>• Include a buffer for unexpected expenses</li>
                <li>• Aim to save 20-30% of your income</li>
                <li>• Review and adjust monthly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
