'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getInvoice, updateInvoice, getUserClients } from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import type { Client, InvoiceLineItem, Invoice, InvoiceStatus } from '@/types/financial';

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const [formData, setFormData] = useState<{
    invoiceNumber: string;
    clientId: string;
    status: InvoiceStatus;
    issueDate: string;
    dueDate: string;
    notes: string;
  }>({
    invoiceNumber: '',
    clientId: '',
    status: 'draft',
    issueDate: '',
    dueDate: '',
    notes: '',
  });

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0.18,
      discount: 0,
      total: 0,
    },
  ]);

  useEffect(() => {
    if (user && params.id) {
      loadData();
    }
  }, [user, params.id]);

  const loadData = async () => {
    if (!params.id || typeof params.id !== 'string') return;

    setLoadingData(true);
    try {
      // Load invoice
      const invoiceData = await getInvoice(params.id);
      if (!invoiceData) {
        router.push('/dashboard/invoices');
        return;
      }
      setInvoice(invoiceData);

      // Set form data
      setFormData({
        invoiceNumber: invoiceData.invoiceNumber,
        clientId: invoiceData.clientId,
        status: invoiceData.status,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        notes: invoiceData.notes || '',
      });

      setLineItems(invoiceData.lineItems);

      // Load clients
      if (user) {
        const clientsData = await getUserClients(user.uid);
        setClients(clientsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load invoice');
    } finally {
      setLoadingData(false);
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
    if (!invoice?.id || !user || !formData.clientId) {
      setError('Invalid invoice data');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const totals = calculateTotals();
      
      // Calculate new balance due based on existing payments
      const newBalanceDue = totals.total - invoice.amountPaid;

      const updateData = {
        invoiceNumber: formData.invoiceNumber,
        clientId: formData.clientId,
        status: formData.status,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        lineItems,
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        discountTotal: totals.discountTotal,
        total: totals.total,
        balanceDue: newBalanceDue,
        notes: formData.notes,
      };

      await updateInvoice(invoice.id, updateData);
      router.push(`/dashboard/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Error updating invoice:', error);
      setError('Failed to update invoice. Please try again.');
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

  if (!invoice) {
    return (
      <div className="py-12 text-center">
        <p>Invoice not found</p>
      </div>
    );
  }

  const totals = calculateTotals();
  const currency = userProfile?.businessProfile?.currency || 'UGX';

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/invoices/${invoice.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
            <p className="text-muted-foreground">
              Update invoice details and line items
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="client">Client</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                required
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id!}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Line Items</h2>
            <Button type="button" onClick={addLineItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={index} className="grid gap-4 md:grid-cols-12 items-end p-4 rounded-lg border">
                <div className="md:col-span-4">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Input
                    id={`description-${index}`}
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    placeholder="Item description"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                  <Input
                    id={`unitPrice-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(index, 'unitPrice', Number(e.target.value))}
                    required
                  />
                </div>

                <div className="md:col-span-1">
                  <Label htmlFor={`taxRate-${index}`}>Tax %</Label>
                  <Input
                    id={`taxRate-${index}`}
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={item.taxRate}
                    onChange={(e) => updateLineItem(index, 'taxRate', Number(e.target.value))}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Total</Label>
                  <div className="font-semibold py-2">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currency,
                    }).format(item.total)}
                  </div>
                </div>

                <div className="md:col-span-1">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-lg border bg-card p-6">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes or payment terms..."
            rows={4}
          />
        </div>

        {/* Summary */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency,
                }).format(totals.subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency,
                }).format(totals.taxTotal)}
              </span>
            </div>
            {totals.discountTotal > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600">
                <span>Discount</span>
                <span className="font-medium">
                  -{new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency,
                  }).format(totals.discountTotal)}
                </span>
              </div>
            )}
            <div className="border-t pt-2 flex items-center justify-between text-base font-bold">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency,
                }).format(totals.total)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Already Paid</span>
              <span className="font-medium text-green-600">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency,
                }).format(invoice.amountPaid)}
              </span>
            </div>
            <div className="border-t pt-2 flex items-center justify-between text-base font-bold">
              <span>Balance Due</span>
              <span className="text-orange-600">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency,
                }).format(totals.total - invoice.amountPaid)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href={`/dashboard/invoices/${invoice.id}`}>
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
