'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserAccounts, createTransaction } from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, ArrowRightLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { Account } from '@/types/financial';

export default function TransferFundsPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fromAccount, setFromAccount] = useState<Account | null>(null);
  const [toAccount, setToAccount] = useState<Account | null>(null);

  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
  });

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  useEffect(() => {
    if (formData.fromAccountId) {
      const account = accounts.find(a => a.id === formData.fromAccountId);
      setFromAccount(account || null);
    } else {
      setFromAccount(null);
    }
  }, [formData.fromAccountId, accounts]);

  useEffect(() => {
    if (formData.toAccountId) {
      const account = accounts.find(a => a.id === formData.toAccountId);
      setToAccount(account || null);
    } else {
      setToAccount(null);
    }
  }, [formData.toAccountId, accounts]);

  const loadAccounts = async () => {
    if (!user) return;
    setLoadingAccounts(true);
    try {
      const data = await getUserAccounts(user.uid);
      // Filter only active asset accounts for transfers
      const assetAccounts = data.filter(a => a.isActive && a.type === 'asset');
      setAccounts(assetAccounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.fromAccountId || !formData.toAccountId) {
      setError('Please select both accounts');
      return;
    }

    if (formData.fromAccountId === formData.toAccountId) {
      setError('Cannot transfer to the same account');
      return;
    }

    if (!fromAccount || !toAccount) {
      setError('Selected accounts not found');
      return;
    }

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (formData.amount > fromAccount.balance) {
      setError(`Insufficient funds. Available: ${formatCurrency(fromAccount.balance)}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create a transaction with two entries (double-entry bookkeeping)
      const transactionData = {
        transactionId: `TXN-${Date.now()}`,
        date: new Date(formData.date).toISOString(),
        description: formData.description || `Transfer from ${fromAccount.name} to ${toAccount.name}`,
        reference: formData.reference || `TRANSFER-${Date.now().toString().slice(-6)}`,
        entries: [
          {
            accountId: formData.fromAccountId,
            debit: 0,
            credit: formData.amount, // Credit from account (decrease)
            description: `Transfer to ${toAccount.name}`,
          },
          {
            accountId: formData.toAccountId,
            debit: formData.amount, // Debit to account (increase)
            credit: 0,
            description: `Transfer from ${fromAccount.name}`,
          },
        ],
      };

      await createTransaction(user.uid, transactionData);
      router.push('/dashboard/accounts');
    } catch (err: any) {
      setError(err.message || 'Failed to transfer funds');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const currency = fromAccount?.currency || userProfile?.businessProfile?.currency || 'UGX';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/accounts">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transfer Funds</h1>
          <p className="text-muted-foreground">
            Move money between your accounts
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
                    <ArrowRightLeft className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Transfer Details</h2>
                    <p className="text-sm text-muted-foreground">
                      Enter transfer information
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6">
                {/* From Account */}
                <div className="space-y-2">
                  <Label htmlFor="fromAccount">From Account *</Label>
                  <Select
                    value={formData.fromAccountId}
                    onValueChange={(value) => setFormData({ ...formData, fromAccountId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingAccounts ? "Loading..." : "Select source account"} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id!}>
                          {account.name} - {formatCurrency(account.balance)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fromAccount && (
                    <p className="text-xs text-muted-foreground">
                      Available balance: {formatCurrency(fromAccount.balance)}
                    </p>
                  )}
                </div>

                {/* To Account */}
                <div className="space-y-2">
                  <Label htmlFor="toAccount">To Account *</Label>
                  <Select
                    value={formData.toAccountId}
                    onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingAccounts ? "Loading..." : "Select destination account"} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts
                        .filter(a => a.id !== formData.fromAccountId)
                        .map((account) => (
                          <SelectItem key={account.id} value={account.id!}>
                            {account.name} - {formatCurrency(account.balance)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount & Date */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Transfer Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Reference */}
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="TRANSFER-123 (auto-generated if empty)"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Reason for transfer..."
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
              <Link href="/dashboard/accounts">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading || !formData.fromAccountId || !formData.toAccountId}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Transfer Funds
              </Button>
            </div>
          </form>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {fromAccount && toAccount && formData.amount > 0 ? (
              <div className="rounded-lg border bg-card">
                <div className="border-b p-6">
                  <h2 className="text-lg font-semibold">Transfer Summary</h2>
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="font-medium">{fromAccount.name}</p>
                    <p className="text-xs text-muted-foreground">{fromAccount.accountNumber}</p>
                  </div>

                  <div className="flex justify-center">
                    <ArrowRightLeft className="h-6 w-6 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="font-medium">{toAccount.name}</p>
                    <p className="text-xs text-muted-foreground">{toAccount.accountNumber}</p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">Transfer Amount</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(formData.amount)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">From Balance</span>
                      <span className="font-medium">{formatCurrency(fromAccount.balance)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">After Transfer</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(fromAccount.balance - formData.amount)}
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2"></div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">To Balance</span>
                      <span className="font-medium">{formatCurrency(toAccount.balance)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">After Transfer</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(toAccount.balance + formData.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Select accounts and enter amount to see summary
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
