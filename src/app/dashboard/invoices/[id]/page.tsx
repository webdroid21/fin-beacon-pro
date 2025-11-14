'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getInvoice, getClient, updateInvoice, deleteInvoice, getUserPayments } from '@/lib/firestore-financial';
import { getInvoicePayments } from '@/lib/firestore-financial';
import { downloadInvoicePDF } from '@/lib/pdf-utils';
import { EnhancedInvoicePDF } from '@/components/pdf/EnhancedInvoicePDF';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Mail,
  Printer,
  MoreVertical,
  FileText,
  CreditCard,
  User,
  Calendar,
  DollarSign,
} from 'lucide-react';
import type { Invoice, Client, Payment } from '@/types/financial';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [includePayments, setIncludePayments] = useState(true);
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  useEffect(() => {
    if (user && params.id) {
      loadInvoiceData();
    }
  }, [user, params.id]);

  const loadInvoiceData = async () => {
    if (!params.id || typeof params.id !== 'string') return;
    
    setLoading(true);
    try {
      // Load invoice
      const invoiceData = await getInvoice(params.id);
      if (!invoiceData) {
        router.push('/dashboard/invoices');
        return;
      }
      setInvoice(invoiceData);

      // Load client
      const clientData = await getClient(invoiceData.clientId);
      setClient(clientData);

      // Load payments - try multiple strategies with userId for security rules
      let paymentsData = await getInvoicePayments(invoiceData.invoiceId, user?.uid);
      console.log('Payments by invoiceId:', paymentsData.length);
      
      // If no payments found with custom invoiceId, try with document ID
      if (paymentsData.length === 0 && params.id && user) {
        paymentsData = await getInvoicePayments(params.id as string, user.uid);
        console.log('Payments by document ID:', paymentsData.length);
      }
      
      // If still no payments, try loading all user payments and filter by clientId
      if (paymentsData.length === 0 && user) {
        const allPayments = await getUserPayments(user.uid);
        console.log('All user payments:', allPayments.length);
        // Filter by clientId or invoiceId/document ID
        paymentsData = allPayments.filter(p => 
          p.invoiceId === invoiceData.invoiceId || 
          p.invoiceId === params.id ||
          p.clientId === invoiceData.clientId
        );
        console.log('Filtered payments by client/invoice:', paymentsData.length);
      }
      
      console.log('Final loaded payments:', paymentsData.length, 'for invoice:', invoiceData.invoiceNumber);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice?.id || !confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await deleteInvoice(invoice.id);
      router.push('/dashboard/invoices');
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice || !userProfile) return;

    try {
      setDownloading(true);
      
      const clientAddress = client ? [
        client.address?.street,
        client.address?.city,
        client.address?.country,
        client.address?.postalCode
      ].filter(Boolean).join(', ') : '';

      await downloadInvoicePDF(EnhancedInvoicePDF, {
        invoice,
        client: client || undefined,
        payments: includePayments ? payments : [],
        businessProfile: userProfile.businessProfile,
        userPhotoUrl: userProfile.photoUrl,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
      setShowPdfOptions(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'cancelled': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
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

  if (!invoice) {
    return (
      <div className="py-12 text-center">
        <p>Invoice not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{invoice.invoiceNumber}</h1>
              <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Due: {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPdfOptions(true)}
            disabled={downloading}
          >
            {downloading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download PDF
          </Button>
          
          <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
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
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Email Invoice
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Client Info Card */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">To:</h3>
          </div>
          <div className="space-y-2">
            <p className="font-medium">{client?.name || 'Unknown Client'}</p>
            {client?.companyName && (
              <p className="text-sm text-muted-foreground">{client.companyName}</p>
            )}
            {client?.address && (
              <p className="text-sm text-muted-foreground">
                {[
                  client.address.street,
                  client.address.city,
                  client.address.country,
                  client.address.postalCode
                ].filter(Boolean).join(', ')}
              </p>
            )}
            {client?.phone && (
              <p className="text-sm text-muted-foreground">{client.phone}</p>
            )}
          </div>
        </div>

        {/* Amount Summary Card */}
        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Amount</span>
              </div>
              <span className="text-2xl font-bold">{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Paid</span>
              </div>
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(invoice.amountPaid, invoice.currency)}
              </span>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold">Balance</span>
                </div>
                <span className="text-xl font-bold text-orange-600">
                  {formatCurrency(invoice.balanceDue, invoice.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Line Items and Payments */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="items">
            <FileText className="h-4 w-4 mr-2" />
            Line Items
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments ({payments.length})
          </TabsTrigger>
        </TabsList>

        {/* Line Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">#</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Description</th>
                    <th className="px-6 py-3 text-right text-sm font-medium">Qty</th>
                    <th className="px-6 py-3 text-right text-sm font-medium">Unit Price</th>
                    <th className="px-6 py-3 text-right text-sm font-medium">Tax</th>
                    <th className="px-6 py-3 text-right text-sm font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoice.lineItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm">{String(index + 1).padStart(3, '0')}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{item.description}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-sm">
                        {formatCurrency(item.unitPrice, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">{(item.taxRate * 100).toFixed(0)}%</td>
                      <td className="px-6 py-4 text-right font-medium">
                        {formatCurrency(item.total, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t bg-muted/30">
                  <tr>
                    <td colSpan={5} className="px-6 py-3 text-right text-sm font-medium">Subtotal</td>
                    <td className="px-6 py-3 text-right font-semibold">
                      {formatCurrency(invoice.subtotal, invoice.currency)}
                    </td>
                  </tr>
                  {invoice.discountTotal > 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-2 text-right text-sm">Discount</td>
                      <td className="px-6 py-2 text-right text-sm text-green-600">
                        -{formatCurrency(invoice.discountTotal, invoice.currency)}
                      </td>
                    </tr>
                  )}
                  {invoice.taxTotal > 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-2 text-right text-sm">Tax</td>
                      <td className="px-6 py-2 text-right text-sm">
                        {formatCurrency(invoice.taxTotal, invoice.currency)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t-2">
                    <td colSpan={5} className="px-6 py-3 text-right text-base font-bold">Total</td>
                    <td className="px-6 py-3 text-right text-lg font-bold">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Payment History</h3>
            <Link href={`/dashboard/payments/new?invoiceId=${invoice.invoiceId}`}>
              <Button size="sm">Record Payment</Button>
            </Link>
          </div>

          {payments.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No payments recorded</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Record the first payment for this invoice
              </p>
            </div>
          ) : (
            <div className="rounded-lg border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium">#</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Transaction ID</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Method</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Reference</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
                      <th className="px-6 py-3 text-right text-sm font-medium">Amount</th>
                      <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.map((payment, index) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 text-sm">{String(index + 1).padStart(3, '0')}</td>
                        <td className="px-6 py-4 text-sm font-medium">PAID-{payment.id?.slice(-6)}</td>
                        <td className="px-6 py-4 text-sm capitalize">{payment.method || 'cash'}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {payment.transactionRef || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/dashboard/payments/${payment.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t bg-muted/30">
                    <tr>
                      <td colSpan={5} className="px-6 py-3 text-right text-sm font-medium">Total Paid</td>
                      <td className="px-6 py-3 text-right font-semibold text-green-600">
                        {formatCurrency(invoice.amountPaid, invoice.currency)}
                      </td>
                      <td></td>
                    </tr>
                    <tr className="border-t">
                      <td colSpan={5} className="px-6 py-3 text-right text-base font-bold">Balance</td>
                      <td className="px-6 py-3 text-right text-lg font-bold text-orange-600">
                        {formatCurrency(invoice.balanceDue, invoice.currency)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Notes */}
      {invoice.notes && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* PDF Options Dialog */}
      <Dialog open={showPdfOptions} onOpenChange={setShowPdfOptions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download PDF Options</DialogTitle>
            <DialogDescription>
              Configure how you want the PDF invoice to be generated
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="include-payments">Include Payment History</Label>
                <p className="text-sm text-muted-foreground">
                  Show all payments made on this invoice
                </p>
              </div>
              <Switch
                id="include-payments"
                checked={includePayments}
                onCheckedChange={setIncludePayments}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPdfOptions(false)}>
              Cancel
            </Button>
            <Button onClick={handleDownloadPDF} disabled={downloading}>
              {downloading ? 'Generating...' : 'Download PDF'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
