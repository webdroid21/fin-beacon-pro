/**
 * Invoice utility functions
 * Auto-status updates and helper functions
 */

import { updateInvoice } from './firestore-financial';
import type { Invoice } from '@/types/financial';

/**
 * Check if invoice is overdue and update status
 */
export function checkAndUpdateOverdueStatus(invoice: Invoice): 'updated' | 'no-change' {
  // Only check pending invoices
  if (invoice.status !== 'pending') {
    return 'no-change';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(invoice.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  // If due date has passed and there's a balance due
  if (dueDate < today && invoice.balanceDue > 0) {
    return 'updated';
  }

  return 'no-change';
}

/**
 * Batch update overdue invoices
 * Returns array of invoice IDs that were updated
 */
export async function batchUpdateOverdueInvoices(invoices: Invoice[]): Promise<string[]> {
  const updatedIds: string[] = [];

  for (const invoice of invoices) {
    if (checkAndUpdateOverdueStatus(invoice) === 'updated') {
      try {
        if (invoice.id) {
          await updateInvoice(invoice.id, { status: 'overdue' });
          updatedIds.push(invoice.id);
        }
      } catch (error) {
        console.error(`Failed to update invoice ${invoice.id}:`, error);
      }
    }
  }

  return updatedIds;
}

/**
 * Get invoice status with auto-detection
 * Returns the correct status based on due date and payment
 */
export function getInvoiceStatus(invoice: Invoice): Invoice['status'] {
  // If already paid or cancelled, don't change
  if (invoice.status === 'paid' || invoice.status === 'cancelled' || invoice.status === 'draft') {
    return invoice.status;
  }

  // Check if overdue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(invoice.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today && invoice.balanceDue > 0) {
    return 'overdue';
  }

  return 'pending';
}

/**
 * Calculate days until due (negative if overdue)
 */
export function getDaysUntilDue(invoice: Invoice): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(invoice.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Get human-readable due status
 */
export function getDueStatusText(invoice: Invoice): string {
  if (invoice.status === 'paid') {
    return 'Paid';
  }

  const days = getDaysUntilDue(invoice);

  if (days < 0) {
    return `Overdue by ${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''}`;
  } else if (days === 0) {
    return 'Due today';
  } else if (days === 1) {
    return 'Due tomorrow';
  } else if (days <= 7) {
    return `Due in ${days} days`;
  } else {
    return `Due ${new Date(invoice.dueDate).toLocaleDateString()}`;
  }
}

/**
 * Mark invoice as paid
 */
export async function markInvoiceAsPaid(invoiceId: string, invoice: Invoice): Promise<void> {
  await updateInvoice(invoiceId, {
    status: 'paid',
    amountPaid: invoice.total,
    balanceDue: 0,
  });
}

/**
 * Generate invoice number
 * Format: INV-YYYYMM-XXXX
 */
export function generateInvoiceNumber(prefix: string = 'INV'): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  
  return `${prefix}-${year}${month}-${random}`;
}
