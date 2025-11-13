import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Payment, Invoice } from '@/types/financial';
import type { User } from '@/types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    fontFamily: 'Helvetica-Bold',
    marginRight: 5,
    width: 100,
  },
  divider: {
    borderBottom: '1pt solid #e5e7eb',
    marginVertical: 15,
  },
  amountPaid: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f0fdf4',
    textAlign: 'center',
  },
  table: {
    marginTop: 15,
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
  col1: {
    width: '50%',
  },
  col2: {
    width: '25%',
  },
  col3: {
    width: '25%',
    textAlign: 'right',
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
  summaryBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
  },
  summaryValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
});

interface ReceiptPDFProps {
  payment: Payment;
  invoice: Invoice;
  businessProfile: User['businessProfile'];
  clientName: string;
  clientEmail: string;
}

export const ReceiptPDF: React.FC<ReceiptPDFProps> = ({
  payment,
  invoice,
  businessProfile,
  clientName,
  clientEmail,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: payment.currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Receipt</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Receipt number:</Text>
            <Text>{payment.paymentId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date paid:</Text>
            <Text>{formatDate(payment.date)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Business Info */}
        <View style={styles.section}>
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
          {businessProfile?.phone && <Text>{businessProfile.phone}</Text>}
        </View>

        {/* Bill To */}
        <View style={styles.section}>
          <Text style={styles.label}>Bill to:</Text>
          <Text>{clientEmail}</Text>
        </View>

        <View style={styles.divider} />

        {/* Amount Paid */}
        <View style={styles.amountPaid}>
          <Text>{formatCurrency(payment.amount)} paid on {formatDate(payment.date)}</Text>
        </View>

        {/* Invoice Items */}
        <View style={styles.section}>
          <Text style={styles.label}>For Invoice: {invoice.invoiceNumber}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Qty</Text>
            <Text style={styles.col3}>Amount</Text>
          </View>
          {invoice.lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{item.description}</Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          {invoice.taxTotal > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(invoice.taxTotal)}</Text>
            </View>
          )}
          {invoice.discountTotal > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount:</Text>
              <Text style={styles.summaryValue}>-{formatCurrency(invoice.discountTotal)}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, { borderTop: '1pt solid #e5e7eb', paddingTop: 8 }]}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(invoice.total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount Paid:</Text>
            <Text style={styles.summaryValue}>-{formatCurrency(payment.amount)}</Text>
          </View>
        </View>

        {/* Payment History */}
        {payment.transactionRef && (
          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={styles.label}>Payment history</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.col1}>Payment method</Text>
                <Text style={styles.col2}>Date</Text>
                <Text style={styles.col3}>Amount paid</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.col1}>{payment.method}</Text>
                <Text style={styles.col2}>{formatDate(payment.date)}</Text>
                <Text style={styles.col3}>{formatCurrency(payment.amount)}</Text>
              </View>
            </View>
            {payment.transactionRef && (
              <Text style={{ marginTop: 5, fontSize: 8, color: '#6b7280' }}>
                Transaction ref: {payment.transactionRef}
              </Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by Fin Beacon Pro on {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
};
