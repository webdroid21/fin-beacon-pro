'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAccount, deleteAccount, getUserTransactions } from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Wallet,
  TrendingUp,
  TrendingDown,
  Building2,
  Hash,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  History,
} from 'lucide-react';
import type { Account, Transaction } from '@/types/financial';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && params.id) {
      loadAccountData();
    }
  }, [user, params.id]);

  const loadAccountData = async () => {
    if (!params.id || typeof params.id !== 'string') return;
    
    setLoading(true);
    try {
      const accountData = await getAccount(params.id);
      if (!accountData) {
        router.push('/dashboard/accounts');
        return;
      }
      setAccount(accountData);

      // Load transactions for this account
      if (user) {
        const allTransactions = await getUserTransactions(user.uid);
        const accountTransactions = allTransactions.filter(txn =>
          txn.entries.some(entry => entry.accountId === params.id)
        );
        setTransactions(accountTransactions);
      }
    } catch (error) {
      console.error('Error loading account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!account?.id || !confirm('Are you sure you want to delete this account? This cannot be undone.')) return;
    
    try {
      await deleteAccount(account.id);
      router.push('/dashboard/accounts');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="py-12 text-center">
        <p>Account not found</p>
      </div>
    );
  }

  const Icon = getAccountIcon(account.type);

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/accounts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{account.name}</h1>
              <Badge className={getTypeColor(account.type)}>
                {account.type}
              </Badge>
              {!account.isActive && (
                <Badge variant="outline" className="text-muted-foreground">
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Account #{account.accountNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/accounts/${account.id}/edit`}>
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
              <DropdownMenuItem asChild>
                <Link href="/dashboard/accounts/transfer">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Transfer Funds
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(account.balance, account.currency)}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Account Type</p>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold capitalize">{account.type}</p>
          {account.subtype && (
            <p className="text-sm text-muted-foreground mt-1">{account.subtype}</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Transactions</p>
            <History className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{transactions.length}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {account.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="info">
            <FileText className="h-4 w-4 mr-2" />
            Information
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <History className="h-4 w-4 mr-2" />
            Transactions ({transactions.length})
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Account Details</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-medium mt-1">{account.accountNumber}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Account ID</p>
                <p className="font-medium mt-1">{account.accountId}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Currency</p>
                <p className="font-medium mt-1">{account.currency}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium mt-1">
                  {account.isActive ? (
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                  )}
                </p>
              </div>

              {account.description && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1 text-sm">{account.description}</p>
                </div>
              )}

              {account.parentAccountId && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Parent Account</p>
                  <p className="font-medium mt-1">{account.parentAccountId}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm mt-1">
                  {new Date(account.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm mt-1">
                  {new Date(account.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {transactions.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <History className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No transactions yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Transactions will appear here once recorded
              </p>
            </div>
          ) : (
            <div className="rounded-lg border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Description</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Reference</th>
                      <th className="px-6 py-3 text-right text-sm font-medium">Debit</th>
                      <th className="px-6 py-3 text-right text-sm font-medium">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transactions.map((transaction) => {
                      const entry = transaction.entries.find(e => e.accountId === params.id);
                      return (
                        <tr key={transaction.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 text-sm">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">{transaction.description}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {transaction.reference || '-'}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            {entry?.debit ? formatCurrency(entry.debit, account.currency) : '-'}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-green-600">
                            {entry?.credit ? formatCurrency(entry.credit, account.currency) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
