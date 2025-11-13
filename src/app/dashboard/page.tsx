'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  FileText,
  CreditCard,
  Users,
  Receipt,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

export default function DashboardPage() {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6 py-6">
      {/* Welcome Section */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-2xl font-bold">
          Welcome back, {userProfile?.displayName || 'User'}! 👋
        </h2>
        <p className="mt-2 text-muted-foreground">
          Here's an overview of your financial activity
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$0.00"
          change="+0% from last month"
          changeType="positive"
        />
        <StatCard
          title="Pending Invoices"
          value="0"
          description="No pending invoices"
        />
        <StatCard
          title="Total Expenses"
          value="$0.00"
          description="This month"
        />
        <StatCard
          title="Active Clients"
          value="0"
          description="Total clients"
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/invoices/new">
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              Create Invoice
            </Button>
          </Link>
          <Link href="/dashboard/payments/new">
            <Button variant="outline" className="w-full justify-start gap-2">
              <CreditCard className="h-4 w-4" />
              Record Payment
            </Button>
          </Link>
          <Link href="/dashboard/clients/new">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Users className="h-4 w-4" />
              Add Client
            </Button>
          </Link>
          <Link href="/dashboard/expenses/new">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Receipt className="h-4 w-4" />
              Log Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Modules Overview */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Explore Modules</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ModuleCard
            href="/dashboard/invoices"
            icon={<FileText className="h-6 w-6" />}
            title="Invoices"
            description="Create and manage invoices"
          />
          <ModuleCard
            href="/dashboard/payments"
            icon={<CreditCard className="h-6 w-6" />}
            title="Payments"
            description="Track payments and revenue"
          />
          <ModuleCard
            href="/dashboard/clients"
            icon={<Users className="h-6 w-6" />}
            title="Clients"
            description="Manage your client database"
          />
          <ModuleCard
            href="/dashboard/expenses"
            icon={<Receipt className="h-6 w-6" />}
            title="Expenses"
            description="Track business expenses"
          />
          <ModuleCard
            href="/dashboard/budgets"
            icon={<TrendingUp className="h-6 w-6" />}
            title="Budgets"
            description="Plan monthly budgets"
          />
          <ModuleCard
            href="/dashboard/analytics"
            icon={<BarChart3 className="h-6 w-6" />}
            title="Analytics"
            description="View financial insights"
          />
        </div>
      </div>

      {/* Getting Started */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="mb-2 font-semibold">Get Started</h3>
            <p className="text-sm text-muted-foreground">
              Complete these steps to set up your finance management system
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Set up your business profile in Settings</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <span>Add your first client</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <span>Create your first invoice</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <span>Record a payment</span>
              </li>
            </ul>
          </div>
          <Link href="/dashboard/settings">
            <Button size="sm" className="gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  changeType,
  description,
}: {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  description?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {change && (
        <p className={`mt-1 text-xs ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </p>
      )}
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

function ModuleCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <div className="group rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <h4 className="font-semibold group-hover:text-primary">{title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
