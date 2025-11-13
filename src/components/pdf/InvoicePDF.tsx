import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Invoice } from '@/types/financial';
import type { User } from '@/types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
  },
  invoiceDetails: {
    textAlign: 'right',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    fontFamily: 'Helvetica-Bold',
    marginRight: 5,
  },
  divider: {
    borderBottom: '1pt solid #e5e7eb',
    marginVertical: 10,
  },
  table: {
    marginTop: 15,
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1pt solid #e5e7eb',
  },
  colDescription: {
    width: '50%',
  },
  colQuantity: {
    width: '15%',
    textAlign: 'right',
  },
  colRate: {
    width: '17.5%',
    textAlign: 'right',
  },
  colAmount: {
    width: '17.5%',
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontFamily: 'Helvetica-Bold',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2pt solid #000',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#6b7280',
  },
  statusBadge: {
    padding: '4 8',
    borderRadius: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  statusPaid: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusOverdue: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  statusDraft: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  businessProfile: User['businessProfile'];
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  clientAddress?: string;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({
  invoice,
  businessProfile,
  clientName,
  clientEmail,
  clientCompany,
  clientAddress,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return [styles.statusBadge, styles.statusPaid];
      case 'pending':
        return [styles.statusBadge, styles.statusPending];
      case 'overdue':
        return [styles.statusBadge, styles.statusOverdue];
      default:
        return [styles.statusBadge, styles.statusDraft];
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
          </View>
          <View style={styles.invoiceDetails}>
            <Text>Invoice #: {invoice.invoiceNumber}</Text>
            <Text>Issue Date: {formatDate(invoice.issueDate)}</Text>
            <Text>Due Date: {formatDate(invoice.dueDate)}</Text>
            <View style={getStatusStyle(invoice.status)}>
              <Text>{invoice.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* From Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>From:</Text>
          <Text style={styles.label}>{businessProfile?.name || 'Your Business'}</Text>
          {businessProfile?.address && (
            <>
              {businessProfile.address.street && (
                <Text>{businessProfile.address.street}</Text>
              )}
              {businessProfile.address.city && (
                <Text>{businessProfile.address.city}</Text>
              )}
              {businessProfile.address.country && (
                <Text>{businessProfile.address.country}</Text>
              )}
            </>
          )}
          {businessProfile?.phone && <Text>Phone: {businessProfile.phone}</Text>}
        </View>

        {/* To Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text style={styles.label}>{clientName}</Text>
          {clientCompany && <Text>{clientCompany}</Text>}
          <Text>{clientEmail}</Text>
          {clientAddress && <Text>{clientAddress}</Text>}
        </View>

        <View style={styles.divider} />

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colQuantity}>Qty</Text>
            <Text style={styles.colRate}>Rate</Text>
            <Text style={styles.colAmount}>Amount</Text>
          </View>
          {invoice.lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQuantity}>{item.quantity}</Text>
              <Text style={styles.colRate}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.colAmount}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          {invoice.taxTotal > 0 && (
            <View style={styles.totalRow}>
              <Text>Tax:</Text>
              <Text>{formatCurrency(invoice.taxTotal)}</Text>
            </View>
          )}
          {invoice.discountTotal > 0 && (
            <View style={styles.totalRow}>
              <Text>Discount:</Text>
              <Text>-{formatCurrency(invoice.discountTotal)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text>TOTAL:</Text>
            <Text>{formatCurrency(invoice.total)}</Text>
          </View>
          {invoice.amountPaid > 0 && (
            <>
              <View style={[styles.totalRow, { marginTop: 10 }]}>
                <Text>Amount Paid:</Text>
                <Text>-{formatCurrency(invoice.amountPaid)}</Text>
              </View>
              <View style={[styles.totalRow, styles.totalLabel]}>
                <Text>Balance Due:</Text>
                <Text>{formatCurrency(invoice.balanceDue)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generated by Fin Beacon Pro on {new Date().toLocaleDateString()}
          </Text>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
};
