import type { LineItem } from '@/types';

/**
 * Calculate line item total
 */
export const calculateLineItemTotal = (item: LineItem): number => {
  const subtotal = item.quantity * item.unitPrice;
  const tax = subtotal * item.taxRate;
  const discount = item.discount || 0;
  return subtotal + tax - discount;
};

/**
 * Calculate invoice totals from line items
 */
export const calculateInvoiceTotals = (lineItems: LineItem[]) => {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const taxTotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * item.taxRate,
    0
  );

  const discountTotal = lineItems.reduce(
    (sum, item) => sum + (item.discount || 0),
    0
  );

  const total = subtotal + taxTotal - discountTotal;

  return {
    subtotal,
    taxTotal,
    discountTotal,
    total,
  };
};
