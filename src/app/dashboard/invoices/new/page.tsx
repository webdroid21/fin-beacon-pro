'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createInvoice } from '@/lib/firestore-financial';
import { getUserClients } from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Plus, Trash2, FileText, Calculator } from 'lucide-react';
import Link from 'next/link';
import type { Client, InvoiceLineItem } from '@/types/financial';

export default function NewInvoicePage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);

  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    clientId: '',
    status: 'draft' as const,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
    notes: '',
  });

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0.18, // 18% VAT
      discount: 0,
      total: 0,
    },
  ]);

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    if (!user) return;
    setLoadingClients(true);
    try {
      const data = await getUserClients(user.uid);
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const calculateLineTotal = (item: InvoiceLineItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    const taxAmount = subtotal * item.taxRate;
    const total = subtotal + taxAmount - (item.discount || 0);
    return Math.max(0, total);
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate total for this line
    newItems[index].total = calculateLineTotal(newItems[index]);
    
    setLineItems(newItems);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0.18,
        discount: 0,
        total: 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    const taxTotal = lineItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice * item.taxRate);
    }, 0);

    const discountTotal = lineItems.reduce((sum, item) => {
      return sum + (item.discount || 0);
    }, 0);

    const total = subtotal + taxTotal - discountTotal;

    return { subtotal, taxTotal, discountTotal, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.clientId) {
      setError('Please select a client');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const totals = calculateTotals();
      const currency = userProfile?.businessProfile?.currency || 'UGX';

      const invoiceData = {
        invoiceId: `INV-${Date.now()}`,
        clientId: formData.clientId,
        invoiceNumber: formData.invoiceNumber,
        status: formData.status,
        currency,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        lineItems,
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        discountTotal: totals.discountTotal,
        total: totals.total,
        amountPaid: 0,
        balanceDue: totals.total,
        notes: formData.notes,
      };

      await createInvoice(user.uid, invoiceData);
      router.push('/dashboard/invoices');
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();
  const currency = userProfile?.businessProfile?.currency || 'UGX';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/invoices">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground">
            Generate a new invoice for your client
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Invoice Details */}
            <div className="rounded-lg border bg-card">
              <div className="border-b p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Invoice Details</h2>
                    <p className="text-sm text-muted-foreground">
                      Basic invoice information
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                    <Input
                      id="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client">Client *</Label>
                    <Select
                      value={formData.clientId}
                      onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingClients ? "Loading..." : "Select client"} />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id!}>
                            {client.name} {client.companyName && `(${client.companyName})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date *</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="rounded-lg border bg-card">
              <div className="border-b p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Calculator className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Line Items</h2>
                      <p className="text-sm text-muted-foreground">
                        Add products or services
                      </p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {lineItems.map((item, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-medium">Item {index + 1}</h3>
                          {lineItems.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLineItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2 md:col-span-2">
                            <Label>Description *</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                              placeholder="Product or service description"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Unit Price *</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(index, 'unitPrice', Number(e.target.value))}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Tax Rate (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={item.taxRate * 100}
                              onChange={(e) => updateLineItem(index, 'taxRate', Number(e.target.value) / 100)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Discount</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.discount || 0}
                              onChange={(e) => updateLineItem(index, 'discount', Number(e.target.value))}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-4">
                          <span className="text-sm text-muted-foreground">Line Total</span>
                          <span className="text-lg font-semibold">{formatCurrency(item.total)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-lg border bg-card p-6">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Terms</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Payment terms, additional notes..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="rounded-lg border bg-card">
                <div className="border-b p-6">
                  <h2 className="text-lg font-semibold">Invoice Summary</h2>
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatCurrency(totals.taxTotal)}</span>
                  </div>
                  {totals.discountTotal > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-red-600">-{formatCurrency(totals.discountTotal)}</span>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="font-medium">{formatCurrency(0)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-muted-foreground">Balance Due</span>
                      <span className="font-semibold">{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading || !formData.clientId}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Invoice
                </Button>
                <Link href="/dashboard/invoices" className="block">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
