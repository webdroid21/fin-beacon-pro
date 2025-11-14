'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAccount, updateAccount } from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import type { Account, AccountType } from '@/types/financial';

const CURRENCIES = [
  { code: 'UGX', name: 'Ugandan Shilling' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
];

export default function EditAccountPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [account, setAccount] = useState<Account | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    type: 'asset' as AccountType,
    subtype: '',
    description: '',
    currency: 'UGX',
    isActive: true,
  });

  useEffect(() => {
    if (user && params.id) {
      loadAccount();
    }
  }, [user, params.id]);

  const loadAccount = async () => {
    if (!params.id || typeof params.id !== 'string') return;

    setLoadingData(true);
    try {
      const accountData = await getAccount(params.id);
      if (!accountData) {
        router.push('/dashboard/accounts');
        return;
      }
      setAccount(accountData);

      setFormData({
        name: accountData.name,
        accountNumber: accountData.accountNumber,
        type: accountData.type,
        subtype: accountData.subtype || '',
        description: accountData.description || '',
        currency: accountData.currency,
        isActive: accountData.isActive,
      });
    } catch (error) {
      console.error('Error loading account:', error);
      setError('Failed to load account');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account?.id || !user) return;

    setLoading(true);
    setError('');

    try {
      const updateData = {
        name: formData.name,
        accountNumber: formData.accountNumber,
        type: formData.type,
        subtype: formData.subtype,
        description: formData.description,
        currency: formData.currency,
        isActive: formData.isActive,
      };

      await updateAccount(account.id, updateData);
      router.push(`/dashboard/accounts/${account.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
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

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/accounts/${account.id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Account</h1>
          <p className="text-muted-foreground">
            Update account information
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Account Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Cash Account"
                required
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="e.g., 1001"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="type">Account Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: AccountType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subtype">Subtype</Label>
                <Input
                  id="subtype"
                  value={formData.subtype}
                  onChange={(e) => setFormData({ ...formData, subtype: e.target.value })}
                  placeholder="e.g., Current, Fixed"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Account Status</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.isActive ? 'This account is active' : 'This account is inactive'}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
        </div>

        {/* Read-only Info */}
        <div className="rounded-lg border bg-muted/50 p-6">
          <h3 className="font-semibold mb-4">Current Balance (Read-only)</h3>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: formData.currency,
            }).format(account.balance)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Balance can only be changed through transactions
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href={`/dashboard/accounts/${account.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
