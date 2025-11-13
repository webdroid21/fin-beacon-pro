'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createAccount } from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Wallet } from 'lucide-react';
import Link from 'next/link';
import type { AccountType } from '@/types/financial';

const ACCOUNT_TYPES: { value: AccountType; label: string; description: string }[] = [
  { value: 'asset', label: 'Asset', description: 'Bank accounts, cash, savings' },
  { value: 'liability', label: 'Liability', description: 'Loans, credit cards, payables' },
  { value: 'equity', label: 'Equity', description: 'Owner equity, retained earnings' },
  { value: 'revenue', label: 'Revenue', description: 'Income from sales, services' },
  { value: 'expense', label: 'Expense', description: 'Operating costs, purchases' },
];

const ASSET_SUBTYPES = ['checking', 'savings', 'cash', 'investment', 'other'];
const LIABILITY_SUBTYPES = ['loan', 'credit card', 'mortgage', 'accounts payable', 'other'];
const EQUITY_SUBTYPES = ['owner equity', 'retained earnings', 'capital', 'other'];
const REVENUE_SUBTYPES = ['sales', 'services', 'interest', 'other income', 'other'];
const EXPENSE_SUBTYPES = ['rent', 'utilities', 'supplies', 'salary', 'marketing', 'other'];

export default function NewAccountPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    accountNumber: `ACC-${Date.now().toString().slice(-6)}`,
    name: '',
    type: 'asset' as AccountType,
    subtype: '',
    description: '',
    balance: 0,
  });

  const getSubtypes = () => {
    switch (formData.type) {
      case 'asset': return ASSET_SUBTYPES;
      case 'liability': return LIABILITY_SUBTYPES;
      case 'equity': return EQUITY_SUBTYPES;
      case 'revenue': return REVENUE_SUBTYPES;
      case 'expense': return EXPENSE_SUBTYPES;
      default: return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const accountData = {
        accountId: `ACC-${Date.now()}`,
        accountNumber: formData.accountNumber,
        name: formData.name,
        type: formData.type,
        subtype: formData.subtype,
        description: formData.description,
        currency: userProfile?.businessProfile?.currency || 'UGX',
        balance: formData.balance,
        isActive: true,
      };

      await createAccount(user.uid, accountData);
      router.push('/dashboard/accounts');
    } catch (err: any) {
      // Show specific error message (e.g., duplicate name)
      setError(err.message || 'Failed to create account');
      console.error('Error creating account:', err);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Add New Account</h1>
          <p className="text-muted-foreground">
            Create a new financial account
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-lg border bg-card">
          <div className="border-b p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Account Information</h2>
                <p className="text-sm text-muted-foreground">
                  Basic details about your account
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {/* Account Number & Name */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="ACC-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Account Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="General Account, Savings, etc."
                  required
                />
              </div>
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Account Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: AccountType) => {
                  setFormData({ ...formData, type: value, subtype: '' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subtype */}
            <div className="space-y-2">
              <Label htmlFor="subtype">Subtype</Label>
              <Select
                value={formData.subtype}
                onValueChange={(value) => setFormData({ ...formData, subtype: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subtype (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {getSubtypes().map((subtype) => (
                    <SelectItem key={subtype} value={subtype}>
                      {subtype.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Opening Balance */}
            <div className="space-y-2">
              <Label htmlFor="balance">Opening Balance</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                Current balance in this account (can be 0 for new accounts)
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about this account..."
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Suggested Accounts */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <h3 className="mb-3 text-sm font-semibold">💡 Suggested Accounts</h3>
          <div className="grid gap-2 text-sm">
            <div>
              <strong>Asset Accounts:</strong> General Account (checking), Savings Account, Cash on Hand
            </div>
            <div>
              <strong>Revenue Accounts:</strong> Invoice Income, Payment Revenue, Service Income
            </div>
            <div>
              <strong>Expense Accounts:</strong> Office Rent, Utilities, Supplies, Marketing
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
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );
}
