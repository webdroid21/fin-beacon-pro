'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserPayments, deletePayment, getInvoice, getClient } from '@/lib/firestore-financial';
import { downloadReceiptPDF } from '@/lib/pdf-utils';
import { ReceiptPDF } from '@/components/pdf/ReceiptPDF';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Trash2, DollarSign, CreditCard, CheckCircle2, Download } from 'lucide-react';
import type { Payment } from '@/types/financial';
import Link from 'next/link';

export default function PaymentsPage() {
  const { user, userProfile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user]);

  const loadPayments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserPayments(user.uid);
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    try {
      await deletePayment(paymentId);
      setPayments(payments.filter(p => p.id !== paymentId));
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    if (!user || !userProfile) return;
    
    try {
      setDownloadingId(payment.id || null);
      
      // Get invoice details
      const invoice = await getInvoice(payment.invoiceId);
      if (!invoice) {
        alert('Invoice not found');
        return;
      }

      // Get client details
      let clientName = 'Client';
      let clientEmail = '';
      try {
        const client = await getClient(invoice.clientId);
        if (client) {
          clientName = client.name;
          clientEmail = client.email;
        }
      } catch (error) {
        console.error('Error fetching client:', error);
      }

      await downloadReceiptPDF(ReceiptPDF, {
        payment,
        invoice,
        businessProfile: userProfile.businessProfile,
        clientName,
        clientEmail,
      });
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to generate receipt. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.paymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.transactionRef?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'refunded': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    confirmed: payments.filter(p => p.status === 'confirmed').length,
    pending: payments.filter(p => p.status === 'pending').length,
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Track and manage payment records
          </p>
        </div>
        <Link href="/dashboard/payments/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Payments</p>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.total}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(stats.totalAmount, userProfile?.businessProfile?.currency || 'UGX')}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Confirmed</p>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.confirmed}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Pending</p>
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.pending}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No payments found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery ? 'Try adjusting your search' : 'Get started by recording your first payment'}
          </p>
          {!searchQuery && (
            <Link href="/dashboard/payments/new">
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Record Payment
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">Payment ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Invoice</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Method</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Reference</th>
                  <th className="px-6 py-3 text-right text-sm font-medium">Amount</th>
                  <th className="px-6 py-3 text-center text-sm font-medium">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm font-medium">{payment.paymentId}</td>
                    <td className="px-6 py-4 text-sm">{payment.invoiceId}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">{payment.method}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {payment.transactionRef || '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReceipt(payment)}
                          disabled={downloadingId === payment.id}
                          title="Download Receipt"
                        >
                          {downloadingId === payment.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => payment.id && handleDelete(payment.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
