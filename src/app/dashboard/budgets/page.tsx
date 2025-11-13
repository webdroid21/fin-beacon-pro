'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserBudgets, deleteBudget, getUserExpenses } from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Budget, Expense } from '@/types/financial';
import Link from 'next/link';

export default function BudgetsPage() {
  const { user, userProfile } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [budgetsData, expensesData] = await Promise.all([
        getUserBudgets(user.uid),
        getUserExpenses(user.uid),
      ]);
      setBudgets(budgetsData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    try {
      await deleteBudget(budgetId);
      setBudgets(budgets.filter(b => b.id !== budgetId));
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const filteredBudgets = budgets.filter(budget =>
    budget.month.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || userProfile?.businessProfile?.currency || 'UGX',
    }).format(amount);
  };

  const getProgressColor = (actual: number, goal: number) => {
    const percentage = (actual / goal) * 100;
    if (percentage <= 70) return 'bg-green-500';
    if (percentage <= 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (actual: number, goal: number) => {
    const percentage = (actual / goal) * 100;
    if (percentage <= 90) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (percentage <= 100) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  // Current month budget
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentBudget = budgets.find(b => b.month === currentMonth);

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Plan and track your financial goals
          </p>
        </div>
        <Link href="/dashboard/budgets/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Budget
          </Button>
        </Link>
      </div>

      {/* Current Month Summary */}
      {currentBudget && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Income Goal</p>
              <Target className="h-4 w-4 text-green-600" />
            </div>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(currentBudget.incomeGoal)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Actual: {formatCurrency(currentBudget.actualIncome)}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Expense Limit</p>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(currentBudget.expenseLimit)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Actual: {formatCurrency(currentBudget.actualExpenses)}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Net Goal</p>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(currentBudget.incomeGoal - currentBudget.expenseLimit)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Actual: {formatCurrency(currentBudget.actualIncome - currentBudget.actualExpenses)}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Status</p>
              {getStatusIcon(currentBudget.actualExpenses, currentBudget.expenseLimit)}
            </div>
            <p className="mt-2 text-lg font-bold">
              {((currentBudget.actualExpenses / currentBudget.expenseLimit) * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">of budget used</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search budgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Budgets List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <Target className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No budgets found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first budget'}
          </p>
          {!searchQuery && (
            <Link href="/dashboard/budgets/new">
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create Budget
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBudgets.map((budget) => {
            const incomeProgress = (budget.actualIncome / budget.incomeGoal) * 100;
            const expenseProgress = (budget.actualExpenses / budget.expenseLimit) * 100;
            
            return (
              <div
                key={budget.id}
                className="rounded-lg border bg-card p-6"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {new Date(budget.month + '-01').toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Budget for {budget.year}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(budget.actualExpenses, budget.expenseLimit)}
                    <Link href={`/dashboard/budgets/${budget.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Income */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Income
                      </span>
                      <span className="text-muted-foreground">
                        {incomeProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${Math.min(incomeProgress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Actual: {formatCurrency(budget.actualIncome)}</span>
                      <span>Goal: {formatCurrency(budget.incomeGoal)}</span>
                    </div>
                  </div>

                  {/* Expenses */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        Expenses
                      </span>
                      <span className="text-muted-foreground">
                        {expenseProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all ${getProgressColor(budget.actualExpenses, budget.expenseLimit)}`}
                        style={{ width: `${Math.min(expenseProgress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Actual: {formatCurrency(budget.actualExpenses)}</span>
                      <span>Limit: {formatCurrency(budget.expenseLimit)}</span>
                    </div>
                  </div>
                </div>

                {/* Net */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Net (Income - Expenses)</span>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(budget.actualIncome - budget.actualExpenses)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Goal: {formatCurrency(budget.incomeGoal - budget.expenseLimit)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
