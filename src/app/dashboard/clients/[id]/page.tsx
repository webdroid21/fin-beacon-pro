'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getClient, deleteClient, getUserInvoices } from '@/lib/firestore-financial';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  DollarSign,
  User,
  Globe,
  Hash,
} from 'lucide-react';
import type { Client, Invoice } from '@/types/financial';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && params.id) {
      loadClientData();
    }
  }, [user, params.id]);

  const loadClientData = async () => {
    if (!params.id || typeof params.id !== 'string') return;
    
    setLoading(true);
    try {
      // Load client
      const clientData = await getClient(params.id);
      if (!clientData) {
        router.push('/dashboard/clients');
        return;
      }
      setClient(clientData);

      // Load client invoices
      if (user) {
        const allInvoices = await getUserInvoices(user.uid);
        const clientInvoices = allInvoices.filter(inv => inv.clientId === params.id);
        setInvoices(clientInvoices);
      }
    } catch (error) {
      console.error('Error loading client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!client?.id || !confirm('Are you sure you want to delete this client? This cannot be undone.')) return;
    
    try {
      await deleteClient(client.id);
      router.push('/dashboard/clients');
    } catch (error) {
      console.error('Error deleting client:', error);
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
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    totalInvoiced: invoices.reduce((sum, inv) => sum + inv.total, 0),
    totalPaid: invoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
    outstanding: invoices.reduce((sum, inv) => sum + inv.balanceDue, 0),
    invoiceCount: invoices.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="py-12 text-center">
        <p>Client not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
              {client.companyName && (
                <Badge variant="outline">{client.companyName}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Client ID: {client.clientId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/clients/${client.id}/edit`}>
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
              <DropdownMenuItem asChild>
                <a href={`mailto:${client.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </a>
              </DropdownMenuItem>
              {client.phone && (
                <DropdownMenuItem asChild>
                  <a href={`tel:${client.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Client
                  </a>
                </DropdownMenuItem>
              )}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Invoiced</p>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(stats.totalInvoiced, client.currency)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{stats.invoiceCount} invoices</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalPaid, client.currency)}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-orange-600">
            {formatCurrency(stats.outstanding, client.currency)}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Currency</p>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{client.currency}</p>
          <p className="text-xs text-muted-foreground mt-1">{client.preferredLanguage || 'English'}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="info">
            <User className="h-4 w-4 mr-2" />
            Information
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="h-4 w-4 mr-2" />
            Invoices ({invoices.length})
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Contact Information */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${client.email}`} className="font-medium hover:text-primary">
                    {client.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href={`tel:${client.phone}`} className="font-medium hover:text-primary">
                    {client.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                Business Information
              </h3>
              <div className="space-y-3">
                {client.companyName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Company Name</p>
                    <p className="font-medium">{client.companyName}</p>
                  </div>
                )}
                {client.taxNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tax Number</p>
                    <p className="font-medium">{client.taxNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="rounded-lg border bg-card p-6 md:col-span-2">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                Address
              </h3>
              <p className="text-sm">
                {[
                  client.address.street,
                  client.address.city,
                  client.address.country,
                  client.address.postalCode
                ].filter(Boolean).join(', ')}
              </p>
            </div>

            {/* Notes */}
            {client.notes && (
              <div className="rounded-lg border bg-card p-6 md:col-span-2">
                <h3 className="font-semibold mb-4">Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          {invoices.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No invoices yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create an invoice for this client
              </p>
              <Link href={`/dashboard/invoices/new?clientId=${client.id}`}>
                <Button className="mt-4">Create Invoice</Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-lg border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium">Invoice #</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Issue Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Due Date</th>
                      <th className="px-6 py-3 text-right text-sm font-medium">Amount</th>
                      <th className="px-6 py-3 text-right text-sm font-medium">Balance</th>
                      <th className="px-6 py-3 text-center text-sm font-medium">Status</th>
                      <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 text-sm font-medium">{invoice.invoiceNumber}</td>
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
                          <div className="flex justify-center">
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/dashboard/invoices/${invoice.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
