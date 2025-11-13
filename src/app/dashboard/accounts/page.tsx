'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserAccounts, deleteAccount } from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, Building2 } from 'lucide-react';
import type { Account } from '@/types/financial';
import Link from 'next/link';

export default function AccountsPage() {
  const { user, userProfile } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  const loadAccounts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserAccounts(user.uid);
      setAccounts(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account? This cannot be undone.')) return;
    try {
      await deleteAccount(accountId);
      setAccounts(accounts.filter(a => a.id !== accountId));
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'asset': return Wallet;
      case 'revenue': return TrendingUp;
      case 'expense': return ArrowUpRight;
      case 'liability': return ArrowDownLeft;
      case 'equity': return Building2;
      default: return Wallet;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'revenue': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'expense': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'liability': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'equity': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    totalAssets: accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0),
    totalLiabilities: accounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0),
    totalRevenue: accounts.filter(a => a.type === 'revenue').reduce((sum, a) => sum + a.balance, 0),
    totalExpenses: accounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + a.balance, 0),
  };

  const netWorth = stats.totalAssets - stats.totalLiabilities;

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your financial accounts and track balances
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/accounts/transfer">
            <Button variant="outline" className="gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Transfer Funds
            </Button>
          </Link>
          <Link href="/dashboard/accounts/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <Wallet className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {formatCurrency(stats.totalAssets, userProfile?.businessProfile?.currency || 'UGX')}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Liabilities</p>
            <ArrowDownLeft className="h-4 w-4 text-orange-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-orange-600">
            {formatCurrency(stats.totalLiabilities, userProfile?.businessProfile?.currency || 'UGX')}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Net Worth</p>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {formatCurrency(netWorth, userProfile?.businessProfile?.currency || 'UGX')}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Active Accounts</p>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {accounts.filter(a => a.isActive).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Accounts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No accounts found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first account'}
          </p>
          {!searchQuery && (
            <Link href="/dashboard/accounts/new">
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAccounts.map((account) => {
            const Icon = getAccountIcon(account.type);
            return (
              <div
                key={account.id}
                className="group relative rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getTypeColor(account.type)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{account.name}</h3>
                      <p className="text-sm text-muted-foreground">{account.accountNumber}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => account.id && handleDelete(account.id)}
                      disabled={!account.isActive}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Balance</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(account.balance, account.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(account.type)}`}>
                      {account.type}
                    </span>
                  </div>
                  {account.subtype && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtype</span>
                      <span className="capitalize">{account.subtype}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <span className={`text-xs ${account.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {account.isActive ? '● Active' : '● Inactive'}
                  </span>
                  <Link href={`/dashboard/transactions?account=${account.id}`}>
                    <Button variant="outline" size="sm">
                      View Transactions
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
