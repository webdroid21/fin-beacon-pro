'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getUserInvoices,
  getUserPayments,
  getUserExpenses,
  getUserAccounts,
  getUserClients,
} from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Area, AreaChart, Bar, BarChart, Line, LineChart, Pie, PieChart,
  CartesianGrid, Cell, XAxis, YAxis, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Download, FileText,
  ArrowUpRight, Receipt, Wallet
} from 'lucide-react';
import type { Invoice, Payment, Expense, Account } from '@/types/financial';
import { subMonths, format, parseISO } from 'date-fns';

type DateRange = 'last-6-months' | 'last-12-months' | 'ytd' | 'all-time';
type ComparisonType = 'none' | 'mom' | 'yoy';

const CHART_COLORS = {
  revenue: 'hsl(var(--chart-1))',
  expenses: 'hsl(var(--chart-2))',
  profit: 'hsl(var(--chart-3))',
  income: 'hsl(var(--chart-4))',
};

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('last-6-months');
  const [comparison, setComparison] = useState<ComparisonType>('none');
  const [data, setData] = useState<{
    invoices: Invoice[];
    payments: Payment[];
    expenses: Expense[];
    accounts: Account[];
    clients: any[];
  }>({
    invoices: [],
    payments: [],
    expenses: [],
    accounts: [],
    clients: [],
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
      const [invoices, payments, expenses, accounts, clients] = await Promise.all([
        getUserInvoices(user.uid),
        getUserPayments(user.uid),
        getUserExpenses(user.uid),
        getUserAccounts(user.uid),
        getUserClients(user.uid),
      ]);
      setData({ invoices, payments, expenses, accounts, clients });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const currency = userProfile?.businessProfile?.currency || 'UGX';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDateRangeBounds = () => {
    const now = new Date();
    switch (dateRange) {
      case 'last-6-months':
        return { start: subMonths(now, 6), end: now };
      case 'last-12-months':
        return { start: subMonths(now, 12), end: now };
      case 'ytd':
        return { start: new Date(now.getFullYear(), 0, 1), end: now };
      case 'all-time':
        return { start: new Date(2000, 0, 1), end: now };
    }
  };

  const { start, end } = getDateRangeBounds();

  const filterByDateRange = (dateStr: string) => {
    const date = parseISO(dateStr);
    return date >= start && date <= end;
  };

  // Calculate metrics
  // Calculate revenue from actual payments received (not just paid invoices)
  const totalRevenue = data.payments
    .filter(payment => payment.status === 'confirmed' && filterByDateRange(payment.date))
    .reduce((sum, payment) => sum + payment.amount, 0);

  const totalExpenses = data.expenses
    .filter(exp => exp.type === 'expense' && filterByDateRange(exp.date))
    .reduce((sum, exp) => sum + exp.amount, 0);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Debug logging
  console.log('Dashboard Metrics:', {
    totalPayments: data.payments.length,
    confirmedPayments: data.payments.filter(p => p.status === 'confirmed').length,
    totalRevenue,
    totalExpenses,
    netProfit,
  });

  const totalAccounts = data.accounts.length;
  const totalClients = data.clients.length;
  const pendingInvoices = data.invoices.filter(inv => inv.status === 'pending').length;
  const overdueInvoices = data.invoices.filter(inv => inv.status === 'overdue').length;
  const totalPaymentsCount = data.payments.filter(p => p.status === 'confirmed').length;

  // Monthly trend data
  const getMonthlyData = () => {
    const months = [];
    const monthCount = dateRange === 'last-12-months' ? 12 : 6;

    for (let i = monthCount - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStr = format(date, 'yyyy-MM');

      // Calculate revenue from actual payments in this month
      const monthRevenue = data.payments
        .filter(payment => payment.date.startsWith(monthStr) && payment.status === 'confirmed')
        .reduce((sum, payment) => sum + payment.amount, 0);

      const monthExpenses = data.expenses
        .filter(exp => exp.date.startsWith(monthStr) && exp.type === 'expense')
        .reduce((sum, exp) => sum + exp.amount, 0);

      const monthIncome = data.expenses
        .filter(exp => exp.date.startsWith(monthStr) && exp.type === 'income')
        .reduce((sum, exp) => sum + exp.amount, 0);

      months.push({
        month: format(date, 'MMM yy'),
        revenue: monthRevenue,
        expenses: monthExpenses,
        income: monthIncome + monthRevenue,
        profit: monthRevenue + monthIncome - monthExpenses,
      });
    }
    return months;
  };

  // Expense by category data
  const getExpenseByCategory = () => {
    const categoryTotals = data.expenses
      .filter(exp => exp.type === 'expense' && filterByDateRange(exp.date))
      .reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value], index) => ({
        name,
        value,
        fill: `hsl(var(--chart-${(index % 5) + 1}))`,
      }));
  };

  const monthlyData = getMonthlyData();
  const expenseCategoryData = getExpenseByCategory();

  // Comparison data
  const getComparisonData = () => {
    if (comparison === 'none') return null;

    const currentPeriod = monthlyData[monthlyData.length - 1];
    const previousPeriod = comparison === 'mom'
      ? monthlyData[monthlyData.length - 2]
      : monthlyData[monthlyData.length - 13];

    if (!previousPeriod) return null;

    const revenueChange = ((currentPeriod.revenue - previousPeriod.revenue) / previousPeriod.revenue) * 100;
    const expenseChange = ((currentPeriod.expenses - previousPeriod.expenses) / previousPeriod.expenses) * 100;
    const profitChange = ((currentPeriod.profit - previousPeriod.profit) / previousPeriod.profit) * 100;

    return { revenueChange, expenseChange, profitChange };
  };

  const comparisonData = getComparisonData();

  // Chart configs
  const revenueChartConfig = {
    revenue: {
      label: 'Revenue',
      color: CHART_COLORS.revenue,
    },
  } satisfies ChartConfig;

  const incomeExpenseChartConfig = {
    income: {
      label: 'Income',
      color: CHART_COLORS.income,
    },
    expenses: {
      label: 'Expenses',
      color: CHART_COLORS.expenses,
    },
  } satisfies ChartConfig;

  const profitChartConfig = {
    profit: {
      label: 'Profit',
      color: CHART_COLORS.profit,
    },
  } satisfies ChartConfig;

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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your financial overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="last-12-months">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={comparison} onValueChange={(value) => setComparison(value as ComparisonType)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Compare" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Comparison</SelectItem>
              <SelectItem value="mom">Month over Month</SelectItem>
              <SelectItem value="yoy">Year over Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
            {comparisonData && comparison !== 'none' && (
              <div className="flex items-center gap-1 mt-1">
                {comparisonData.revenueChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={`text-xs font-medium ${comparisonData.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparisonData.revenueChange.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  vs {comparison === 'mom' ? 'last month' : 'last year'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            {comparisonData && comparison !== 'none' && (
              <div className="flex items-center gap-1 mt-1">
                {comparisonData.expenseChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-red-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-600" />
                )}
                <span className={`text-xs font-medium ${comparisonData.expenseChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {comparisonData.expenseChange.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  vs {comparison === 'mom' ? 'last month' : 'last year'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {profitMargin.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalAccounts} accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pending Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600">
              <FileText className="h-4 w-4" />
              Overdue Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueInvoices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPaymentsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAccounts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Your revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[300px]">
              <AreaChart data={monthlyData} accessibilityLayer>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="url(#fillRevenue)"
                  fillOpacity={0.4}
                  stroke="var(--color-revenue)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Income vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Compare your income and spending</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={incomeExpenseChartConfig} className="h-[300px]">
              <LineChart data={monthlyData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="income"
                  type="monotone"
                  stroke="var(--color-income)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="expenses"
                  type="monotone"
                  stroke="var(--color-expenses)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Profit */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Profit</CardTitle>
            <CardDescription>Profit trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={profitChartConfig} className="h-[300px]">
              <BarChart data={monthlyData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                <Bar dataKey="profit" radius={4}>
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.profit >= 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Top spending categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <PieChart accessibilityLayer>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={expenseCategoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Performing Month</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 && (() => {
              const topMonth = monthlyData.reduce((max, month) =>
                month.revenue > max.revenue ? month : max
              );
              return (
                <>
                  <div className="text-2xl font-bold">{topMonth.month}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Revenue: {formatCurrency(topMonth.revenue)}
                  </p>
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlyData.reduce((sum, m) => sum + m.revenue, 0) / monthlyData.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Over {monthlyData.length} months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length >= 2 && (() => {
              const firstMonth = monthlyData[0].revenue;
              const lastMonth = monthlyData[monthlyData.length - 1].revenue;
              const growthRate = firstMonth > 0 ? ((lastMonth - firstMonth) / firstMonth) * 100 : 0;
              return (
                <>
                  <div className={`text-2xl font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Since {monthlyData[0].month}
                  </p>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
