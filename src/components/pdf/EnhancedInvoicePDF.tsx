import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { Invoice, Client, Payment } from '@/types/financial';
import type { BusinessProfile } from '@/types/user';

// Register fonts (you can add custom fonts if needed)
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Roboto',
    fontSize: 9,
    padding: '40px 24px 120px 24px',
    lineHeight: 1.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  logo: {
    width: 48,
    height: 48,
  },
  invoiceNumber: {
    fontSize: 12,
    fontWeight: 700,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '50%',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 4,
  },
  text: {
    fontSize: 9,
    marginBottom: 2,
  },
  boldText: {
    fontWeight: 700,
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#E5E7EB',
    padding: '8px 0',
  },
  tableHeader: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 2,
    borderColor: '#D1D5DB',
  },
  tableCell: {
    fontSize: 9,
  },
  col1: { width: '5%' },
  col2: { width: '40%' },
  col3: { width: '15%' },
  col4: { width: '20%' },
  col5: { width: '20%', textAlign: 'right' },
  noBorder: {
    borderBottomWidth: 0,
    paddingTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopWidth: 1,
    borderStyle: 'solid',
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#6B7280',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 9,
    width: '60%',
    textAlign: 'right',
    paddingRight: 10,
  },
  summaryValue: {
    fontSize: 9,
    width: '40%',
    textAlign: 'right',
  },
  totalRow: {
    borderTopWidth: 2,
    borderColor: '#000',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 700,
  },
  balanceRow: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    marginTop: 4,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: 700,
  },
  balanceValue: {
    fontSize: 12,
    fontWeight: 700,
    color: '#D97706',
  },
});

interface EnhancedInvoicePDFProps {
  invoice: Invoice;
  client?: Client;
  payments: Payment[];
  businessProfile?: BusinessProfile;
  userPhotoUrl?: string;
}

export function EnhancedInvoicePDF({ 
  invoice, 
  client, 
  payments, 
  businessProfile,
  userPhotoUrl 
}: EnhancedInvoicePDFProps) {
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

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* Logo */}
          {(userPhotoUrl || businessProfile?.logoUrl) && (
            <Image
              src={userPhotoUrl || businessProfile?.logoUrl || ''}
              style={styles.logo}
            />
          )}
          {!userPhotoUrl && !businessProfile?.logoUrl && (
            <View style={{ width: 48, height: 48, backgroundColor: '#3B82F6', borderRadius: 4 }} />
          )}

          {/* Invoice Number */}
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          </View>
        </View>

        {/* Billed From / Billed To */}
        <View style={[styles.row, styles.section]}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Billed From</Text>
            <Text style={styles.text}>{businessProfile?.name || 'Your Business'}</Text>
            {businessProfile?.address && (
              <Text style={styles.text}>
                {[
                  businessProfile.address.street,
                  businessProfile.address.city,
                  businessProfile.address.country,
                  businessProfile.address.postalCode
                ].filter(Boolean).join(', ')}
              </Text>
            )}
            <Text style={styles.text}>{businessProfile?.phone || ''}</Text>
          </View>

          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Billed To</Text>
            <Text style={styles.text}>{client?.name || 'Client'}</Text>
            {client?.companyName && <Text style={styles.text}>{client.companyName}</Text>}
            {client?.address && (
              <Text style={styles.text}>
                {[
                  client.address.street,
                  client.address.city,
                  client.address.country,
                  client.address.postalCode
                ].filter(Boolean).join(', ')}
              </Text>
            )}
            {client?.phone && <Text style={styles.text}>{client.phone}</Text>}
          </View>
        </View>

        {/* Dates */}
        <View style={[styles.row, styles.section]}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Date Created</Text>
            <Text style={styles.text}>{formatDate(invoice.issueDate)}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Due Date</Text>
            <Text style={styles.text}>{formatDate(invoice.dueDate)}</Text>
          </View>
        </View>

        {/* Bill Details Section */}
        <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 10 }]}>Bill Details</Text>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.col1, styles.boldText]}>#</Text>
            <Text style={[styles.tableCell, styles.col2, styles.boldText]}>Description</Text>
            <Text style={[styles.tableCell, styles.col3, styles.boldText]}>Qty</Text>
            <Text style={[styles.tableCell, styles.col4, styles.boldText]}>Unit Price</Text>
            <Text style={[styles.tableCell, styles.col5, styles.boldText]}>Total</Text>
          </View>

          {/* Table Rows */}
          {invoice.lineItems.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={[styles.tableCell, styles.col1]}>
                {String(index + 1).padStart(3, '0')}
              </Text>
              <Text style={[styles.tableCell, styles.col2, styles.boldText]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.col3]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.col4]}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={[styles.tableCell, styles.col5]}>{formatCurrency(item.total)}</Text>
            </View>
          ))}

          {/* Subtotal Row */}
          <View style={[styles.tableRow, styles.noBorder]}>
            <Text style={[styles.tableCell, styles.col1]}></Text>
            <Text style={[styles.tableCell, styles.col2]}></Text>
            <Text style={[styles.tableCell, styles.col3]}></Text>
            <Text style={[styles.tableCell, styles.col4]}>Subtotal</Text>
            <Text style={[styles.tableCell, styles.col5]}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
        </View>

        {/* Bill Payments Section (if payments exist) */}
        {payments.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 30, marginBottom: 10 }]}>
              Bill Payments
            </Text>

            <View style={styles.table}>
              {/* Payments Table Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.col1, styles.boldText]}>#</Text>
                <Text style={[styles.tableCell, styles.col2, styles.boldText]}>Transaction ID</Text>
                <Text style={[styles.tableCell, styles.col3, styles.boldText]}>Method</Text>
                <Text style={[styles.tableCell, styles.col4, styles.boldText]}>Date</Text>
                <Text style={[styles.tableCell, styles.col5, styles.boldText]}>Amount</Text>
              </View>

              {/* Payment Rows */}
              {payments.map((payment, index) => (
                <View style={styles.tableRow} key={payment.id}>
                  <Text style={[styles.tableCell, styles.col1]}>
                    {String(index + 1).padStart(3, '0')}
                  </Text>
                  <Text style={[styles.tableCell, styles.col2]}>
                    PAID-{payment.id?.slice(-6) || index}
                  </Text>
                  <Text style={[styles.tableCell, styles.col3, styles.boldText]}>
                    {payment.method || 'cash'}
                  </Text>
                  <Text style={[styles.tableCell, styles.col4]}>{formatDate(payment.date)}</Text>
                  <Text style={[styles.tableCell, styles.col5]}>{formatCurrency(payment.amount)}</Text>
                </View>
              ))}

              {/* Total Paid Row */}
              <View style={[styles.tableRow, styles.noBorder]}>
                <Text style={[styles.tableCell, styles.col1]}></Text>
                <Text style={[styles.tableCell, styles.col2]}></Text>
                <Text style={[styles.tableCell, styles.col3]}></Text>
                <Text style={[styles.tableCell, styles.col4]}>Total Paid</Text>
                <Text style={[styles.tableCell, styles.col5]}>{formatCurrency(totalPaid)}</Text>
              </View>
            </View>
          </>
        )}

        {/* Summary Section */}
        <View style={{ marginTop: 20 }}>
          {invoice.discountTotal > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>-{formatCurrency(invoice.discountTotal)}</Text>
            </View>
          )}
          
          {invoice.taxTotal > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxes</Text>
              <Text style={styles.summaryValue}>{formatCurrency(invoice.taxTotal)}</Text>
            </View>
          )}

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.summaryLabel, styles.totalLabel]}>Total</Text>
            <Text style={[styles.summaryValue, styles.totalValue]}>
              {formatCurrency(invoice.total)}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.balanceRow]}>
            <Text style={[styles.summaryLabel, styles.balanceLabel]}>Balance</Text>
            <Text style={[styles.summaryValue, styles.balanceValue]}>
              {formatCurrency(invoice.balanceDue)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={{ width: '70%' }}>
            <Text style={[styles.footerText, styles.boldText]}>NOTES</Text>
            <Text style={styles.footerText}>
              {invoice.notes || 
                `We appreciate your business! Get in touch: ${businessProfile?.phone || ''}`}
            </Text>
          </View>
          <View style={{ width: '30%', alignItems: 'flex-end' }}>
            <Text style={[styles.footerText, styles.boldText]}>Have a Question?</Text>
            <Text style={styles.footerText}>{businessProfile?.phone || businessProfile?.website || 'Contact us'}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
