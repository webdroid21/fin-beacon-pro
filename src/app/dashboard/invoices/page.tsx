'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserInvoices, deleteInvoice, getClient } from '@/lib/firestore-financial';
import { batchUpdateOverdueInvoices, getDueStatusText } from '@/lib/invoice-utils';
import { sendInvoiceEmail } from '@/lib/email-service';
import { downloadInvoicePDF } from '@/lib/pdf-utils';
import { InvoicePDF } from '@/components/pdf/InvoicePDF';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Eye, Edit, Trash2, FileText, Download, Mail, AlertCircle } from 'lucide-react';
import type { Invoice } from '@/types/financial';
import type { Client } from '@/types/financial';
import Link from 'next/link';

export default function InvoicesPage() {
  const { user, userProfile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadInvoices();
    }
  }, [user]);

  const loadInvoices = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserInvoices(user.uid);
      
      // Auto-update overdue invoices
      const updatedIds = await batchUpdateOverdueInvoices(data);
      
      // Reload if any were updated
      if (updatedIds.length > 0) {
        const refreshedData = await getUserInvoices(user.uid);
        setInvoices(refreshedData);
      } else {
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await deleteInvoice(invoiceId);
      setInvoices(invoices.filter(inv => inv.id !== invoiceId));
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    if (!user || !userProfile) return;
    
    try {
      setDownloadingId(invoice.id || null);
      
      // Get client details
      let clientName = 'Client';
      let clientEmail = '';
      let clientCompany = '';
      let clientAddress = '';
      
      try {
        const client = await getClient(invoice.clientId);
        if (client) {
          clientName = client.name;
          clientEmail = client.email;
          clientCompany = client.companyName || '';
          clientAddress = [
            client.address?.street,
            client.address?.city,
            client.address?.country,
            client.address?.postalCode
          ].filter(Boolean).join(', ');
        }
      } catch (error) {
        console.error('Error fetching client:', error);
      }

      await downloadInvoicePDF(InvoicePDF, {
        invoice,
        businessProfile: userProfile.businessProfile,
        clientName,
        clientEmail,
        clientCompany,
        clientAddress,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleEmailInvoice = async (invoice: Invoice) => {
    if (!user || !userProfile) return;

    try {
      // Get client details
      let clientEmail = '';
      try {
        const client = await getClient(invoice.clientId);
        if (client) {
          clientEmail = client.email;
        }
      } catch (error) {
        console.error('Error fetching client:', error);
      }

      if (!clientEmail) {
        alert('Client email not found. Please update client information.');
        return;
      }

      sendInvoiceEmail({
        to: clientEmail,
        invoiceNumber: invoice.invoiceNumber,
        dueDate: invoice.dueDate,
        total: invoice.total,
        currency: invoice.currency,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to open email client. Please try again.');
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'pending').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
    paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
    outstandingAmount: invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((sum, i) => sum + i.balanceDue, 0),
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Create and manage your invoices
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Invoices</p>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.total}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Paid</p>
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.paid}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(stats.paidAmount, userProfile?.businessProfile?.currency || 'UGX')}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Pending</p>
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.pending}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(stats.outstandingAmount, userProfile?.businessProfile?.currency || 'UGX')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'draft', 'pending', 'paid', 'overdue'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No invoices found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first invoice'}
          </p>
          {!searchQuery && (
            <Link href="/dashboard/invoices/new">
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create Invoice
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
                  <th className="px-6 py-3 text-left text-sm font-medium">Invoice #</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Client</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Issue Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Due Date</th>
                  <th className="px-6 py-3 text-right text-sm font-medium">Amount</th>
                  <th className="px-6 py-3 text-right text-sm font-medium">Balance Due</th>
                  <th className="px-6 py-3 text-center text-sm font-medium">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm font-medium">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 text-sm">{invoice.clientId}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      {formatCurrency(invoice.balanceDue, invoice.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getDueStatusText(invoice)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                          <Button variant="ghost" size="sm" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownloadPDF(invoice)}
                          disabled={downloadingId === invoice.id}
                          title="Download PDF"
                        >
                          {downloadingId === invoice.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEmailInvoice(invoice)}
                          title="Email Invoice"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => invoice.id && handleDelete(invoice.id)}
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
