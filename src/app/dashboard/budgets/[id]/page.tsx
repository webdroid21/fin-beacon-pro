'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getBudget, deleteBudget, getUserExpenses } from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Target,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import type { Budget, Expense } from '@/types/financial';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

export default function BudgetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && params.id) {
      loadBudgetData();
    }
  }, [user, params.id]);

  const loadBudgetData = async () => {
    if (!params.id || typeof params.id !== 'string') return;
    
    setLoading(true);
    try {
      const budgetData = await getBudget(params.id);
      if (!budgetData) {
        router.push('/dashboard/budgets');
        return;
      }
      setBudget(budgetData);

      // Load expenses for this month
      if (user) {
        const allExpenses = await getUserExpenses(user.uid);
        const monthExpenses = allExpenses.filter(exp => exp.month === budgetData.month);
        setExpenses(monthExpenses);
      }
    } catch (error) {
      console.error('Error loading budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!budget?.id || !confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await deleteBudget(budget.id);
      router.push('/dashboard/budgets');
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="py-12 text-center">
        <p>Budget not found</p>
      </div>
    );
  }

  const expensePercentage = (budget.actualExpenses / budget.expenseLimit) * 100;
  const incomePercentage = (budget.actualIncome / budget.incomeGoal) * 100;
  const netIncome = budget.actualIncome - budget.actualExpenses;

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/budgets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {new Date(budget.month + '-01').toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h1>
              {getStatusIcon(budget.actualExpenses, budget.expenseLimit)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Budget for {budget.month}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/budgets/${budget.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Income Goal</p>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(budget.incomeGoal, budget.currency)}
          </p>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{incomePercentage.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${Math.min(incomePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Actual Income</p>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {formatCurrency(budget.actualIncome, budget.currency)}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Expense Limit</p>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(budget.expenseLimit, budget.currency)}
          </p>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Spent</span>
              <span className="font-medium">{expensePercentage.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getProgressColor(budget.actualExpenses, budget.expenseLimit)}`}
                style={{ width: `${Math.min(expensePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Actual Expenses</p>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {formatCurrency(budget.actualExpenses, budget.currency)}
          </p>
        </div>
      </div>

      {/* Net Income */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Net Income</h3>
            <p className="text-sm text-muted-foreground">Income minus Expenses</p>
          </div>
          <p className={`text-3xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netIncome, budget.currency)}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      {budget.categories && Object.keys(budget.categories).length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-muted-foreground" />
            Category Breakdown
          </h3>
          <div className="space-y-4">
            {Object.entries(budget.categories).map(([category, data]) => {
              const percentage = (data.actual / data.limit) * 100;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{category}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(data.actual, budget.currency)} / {formatCurrency(data.limit, budget.currency)}
                      </span>
                      <Badge variant="outline">{percentage.toFixed(0)}%</Badge>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getProgressColor(data.actual, data.limit)}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {budget.notes && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{budget.notes}</p>
        </div>
      )}
    </div>
  );
}
