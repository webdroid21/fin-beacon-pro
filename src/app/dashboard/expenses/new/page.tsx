'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createExpense, getUserAccounts, createTransaction } from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Receipt } from 'lucide-react';
import Link from 'next/link';
import type { Account } from '@/types/financial';
import {PaymentMethod} from "@/types";

const EXPENSE_CATEGORIES = [
  'Rent', 'Utilities', 'Supplies', 'Marketing', 'Salary', 'Transportation',
  'Insurance', 'Maintenance', 'Software', 'Equipment', 'Travel', 'Food & Dining',
  'Professional Services', 'Training', 'Other',
];

const INCOME_CATEGORIES = [
  'Sales', 'Services', 'Consulting', 'Interest', 'Dividends', 'Rental Income',
  'Commission', 'Royalties', 'Other Income',
];

const PAYMENT_METHODS = [
  'Cash', 'Bank Transfer', 'Mobile Money', 'Card', 'Check', 'Other',
];

export default function NewExpensePage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [formData, setFormData] = useState({
    type: 'expense' as 'expense' | 'income',
    description: '',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    vendor: '',
    accountId: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  const loadAccounts = async () => {
    if (!user) return;
    setLoadingAccounts(true);
    try {
      const data = await getUserAccounts(user.uid);
      // Get asset and expense/revenue accounts
      const relevantAccounts = data.filter(a => 
        a.isActive && (a.type === 'asset' || a.type === 'expense' || a.type === 'revenue')
      );
      setAccounts(relevantAccounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const currency = userProfile?.businessProfile?.currency || 'UGX';
      const month = new Date(formData.date).toISOString().slice(0, 7); // YYYY-MM

      // Create expense/income record
      const expenseData = {
        expenseId: `${formData.type === 'expense' ? 'EXP' : 'INC'}-${Date.now()}`,
        category: formData.category,
        description: formData.description,
        amount: formData.amount,
        currency,
        paymentMethod: formData.paymentMethod as PaymentMethod | undefined,
        date: new Date(formData.date).toISOString(),
        month,
        type: formData.type,
        vendor: formData.vendor,
        notes: formData.notes,
      };

      await createExpense(user.uid, expenseData);

      // If account is linked, create accounting transaction
      if (formData.accountId) {
        const account = accounts.find(a => a.id === formData.accountId);
        if (account) {
          // Find or create expense/revenue account
          let categoryAccount = accounts.find(a => 
            a.name.toLowerCase() === formData.category.toLowerCase() && 
            a.type === (formData.type === 'expense' ? 'expense' : 'revenue')
          );

          if (categoryAccount) {
            const transactionData = {
              transactionId: `TXN-${Date.now()}`,
              date: new Date(formData.date).toISOString(),
              description: formData.description,
              reference: expenseData.expenseId,
              entries: formData.type === 'expense' ? [
                {
                  accountId: categoryAccount.id!,
                  debit: formData.amount, // Increase expense
                  credit: 0,
                  description: formData.description,
                },
                {
                  accountId: formData.accountId,
                  debit: 0,
                  credit: formData.amount, // Decrease asset (cash/bank)
                  description: `Payment for ${formData.description}`,
                },
              ] : [
                {
                  accountId: formData.accountId,
                  debit: formData.amount, // Increase asset (cash/bank)
                  credit: 0,
                  description: `Received from ${formData.description}`,
                },
                {
                  accountId: categoryAccount.id!,
                  debit: 0,
                  credit: formData.amount, // Increase revenue
                  description: formData.description,
                },
              ],
              notes: formData.notes,
            };

            await createTransaction(user.uid, transactionData);
          }
        }
      }

      router.push('/dashboard/expenses');
    } catch (err: any) {
      setError(err.message || 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/expenses">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Expense / Income</h1>
          <p className="text-muted-foreground">
            Record a new financial transaction
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-lg border bg-card">
          <div className="border-b p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Transaction Details</h2>
                <p className="text-sm text-muted-foreground">
                  Enter transaction information
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {/* Type Selector */}
            <div className="space-y-2">
              <Label>Transaction Type *</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={formData.type === 'expense' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                >
                  Expense
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'income' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                >
                  Income
                </Button>
              </div>
            </div>

            {/* Description & Category */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Office rent, Client payment"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Account & Payment Method */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account">Account (Optional)</Label>
                <Select
                  value={formData.accountId}
                  onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingAccounts ? "Loading..." : "Link to account"} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter(a => a.type === 'asset')
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id!}>
                          {account.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Link to an account to automatically update balance
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vendor */}
            <div className="space-y-2">
              <Label htmlFor="vendor">
                {formData.type === 'expense' ? 'Vendor / Supplier' : 'Source / Customer'}
              </Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder={formData.type === 'expense' ? 'Company or person paid' : 'Company or person received from'}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional details..."
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
          <Link href="/dashboard/expenses">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Entry
          </Button>
        </div>
      </form>
    </div>
  );
}
