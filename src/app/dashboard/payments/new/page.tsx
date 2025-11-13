'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createPayment, getUserInvoices } from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, DollarSign, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { Invoice, PaymentMethod, PaymentStatus } from '@/types/financial';

export default function NewPaymentPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [error, setError] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [formData, setFormData] = useState({
    invoiceId: '',
    method: 'bank transfer' as PaymentMethod,
    transactionRef: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'confirmed' as PaymentStatus,
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadInvoices();
    }
  }, [user]);

  useEffect(() => {
    if (formData.invoiceId) {
      const invoice = invoices.find(inv => inv.id === formData.invoiceId);
      setSelectedInvoice(invoice || null);
      if (invoice && formData.amount === 0) {
        setFormData(prev => ({ ...prev, amount: invoice.balanceDue }));
      }
    } else {
      setSelectedInvoice(null);
    }
  }, [formData.invoiceId, invoices]);

  const loadInvoices = async () => {
    if (!user) return;
    setLoadingInvoices(true);
    try {
      const data = await getUserInvoices(user.uid);
      // Filter to show only invoices with balance due
      const unpaidInvoices = data.filter(inv => 
        inv.balanceDue > 0 && inv.status !== 'cancelled'
      );
      setInvoices(unpaidInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.invoiceId) {
      setError('Please select an invoice');
      return;
    }

    if (!selectedInvoice) {
      setError('Selected invoice not found');
      return;
    }

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (formData.amount > selectedInvoice.balanceDue) {
      setError(`Amount cannot exceed balance due (${formatCurrency(selectedInvoice.balanceDue)})`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const paymentData = {
        paymentId: `PAY-${Date.now()}`,
        invoiceId: formData.invoiceId,
        clientId: selectedInvoice.clientId,
        method: formData.method,
        transactionRef: formData.transactionRef,
        currency: selectedInvoice.currency,
        amount: formData.amount,
        date: new Date(formData.date).toISOString(),
        status: formData.status,
        notes: formData.notes,
      };

      await createPayment(user.uid, paymentData);
      router.push('/dashboard/payments');
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const currency = selectedInvoice?.currency || userProfile?.businessProfile?.currency || 'UGX';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const paymentMethods: PaymentMethod[] = [
    'bank transfer',
    'cash',
    'mobile money',
    'card',
    'paypal',
    'stripe',
    'check',
    'other',
  ];

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/payments">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Record Payment</h1>
          <p className="text-muted-foreground">
            Record a payment received from a client
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
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Payment Details</h2>
                    <p className="text-sm text-muted-foreground">
                      Enter payment information
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6">
                {/* Invoice Selection */}
                <div className="space-y-2">
                  <Label htmlFor="invoice">Invoice *</Label>
                  <Select
                    value={formData.invoiceId}
                    onValueChange={(value) => setFormData({ ...formData, invoiceId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingInvoices ? "Loading..." : "Select invoice"} />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id!}>
                          {invoice.invoiceNumber} - {formatCurrency(invoice.balanceDue)} due
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {invoices.length === 0 && !loadingInvoices && (
                    <p className="text-sm text-muted-foreground">
                      No invoices with outstanding balance. <Link href="/dashboard/invoices/new" className="text-primary hover:underline">Create an invoice</Link>
                    </p>
                  )}
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
                    {selectedInvoice && (
                      <p className="text-xs text-muted-foreground">
                        Balance due: {formatCurrency(selectedInvoice.balanceDue)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Payment Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Payment Method & Status */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="method">Payment Method *</Label>
                    <Select
                      value={formData.method}
                      onValueChange={(value: PaymentMethod) => setFormData({ ...formData, method: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: PaymentStatus) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Transaction Reference */}
                <div className="space-y-2">
                  <Label htmlFor="transactionRef">Transaction Reference</Label>
                  <Input
                    id="transactionRef"
                    value={formData.transactionRef}
                    onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                    placeholder="TXN123456, Check #1234, etc."
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional payment notes..."
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
              <Link href="/dashboard/payments">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading || !formData.invoiceId}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Payment
              </Button>
            </div>
          </form>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {selectedInvoice ? (
              <div className="rounded-lg border bg-card">
                <div className="border-b p-6">
                  <h2 className="text-lg font-semibold">Invoice Details</h2>
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Number</p>
                    <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-medium">{formatCurrency(selectedInvoice.total)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                    <p className="font-medium">{formatCurrency(selectedInvoice.amountPaid)}</p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">Balance Due</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(selectedInvoice.balanceDue)}
                    </p>
                  </div>
                  {formData.amount > 0 && (
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm text-muted-foreground">After This Payment</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(selectedInvoice.balanceDue - formData.amount)}
                      </p>
                      {selectedInvoice.balanceDue - formData.amount === 0 && (
                        <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                          ✓ Invoice will be marked as paid
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Select an invoice to see details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
