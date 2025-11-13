/**
 * Email service for sending invoices and receipts
 * Uses Web API (mailto) for client-side or can be extended with backend service
 */

import type { Invoice, Payment } from '@/types/financial';

export interface EmailInvoiceParams {
  to: string;
  invoiceNumber: string;
  dueDate: string;
  total: number;
  currency: string;
  pdfBlob?: Blob;
}

export interface EmailReceiptParams {
  to: string;
  receiptNumber: string;
  paymentDate: string;
  amount: number;
  currency: string;
  pdfBlob?: Blob;
}

/**
 * Generate mailto link for invoice
 * Opens user's default email client with pre-filled content
 */
export function generateInvoiceMailto(params: EmailInvoiceParams): string {
  const { to, invoiceNumber, dueDate, total, currency } = params;

  const subject = encodeURIComponent(`Invoice ${invoiceNumber}`);
  
  const body = encodeURIComponent(
    `Dear Client,\n\n` +
    `Please find attached invoice ${invoiceNumber}.\n\n` +
    `Amount Due: ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(total)}\n` +
    `Due Date: ${new Date(dueDate).toLocaleDateString()}\n\n` +
    `Thank you for your business!\n\n` +
    `Best regards`
  );

  return `mailto:${to}?subject=${subject}&body=${body}`;
}

/**
 * Generate mailto link for receipt
 */
export function generateReceiptMailto(params: EmailReceiptParams): string {
  const { to, receiptNumber, paymentDate, amount, currency } = params;

  const subject = encodeURIComponent(`Receipt ${receiptNumber}`);
  
  const body = encodeURIComponent(
    `Dear Client,\n\n` +
    `Thank you for your payment!\n\n` +
    `Receipt Number: ${receiptNumber}\n` +
    `Payment Date: ${new Date(paymentDate).toLocaleDateString()}\n` +
    `Amount Paid: ${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}\n\n` +
    `Please find attached your receipt.\n\n` +
    `Best regards`
  );

  return `mailto:${to}?subject=${subject}&body=${body}`;
}

/**
 * Open email client with invoice
 */
export function sendInvoiceEmail(params: EmailInvoiceParams): void {
  const mailtoLink = generateInvoiceMailto(params);
  window.location.href = mailtoLink;
}

/**
 * Open email client with receipt
 */
export function sendReceiptEmail(params: EmailReceiptParams): void {
  const mailtoLink = generateReceiptMailto(params);
  window.location.href = mailtoLink;
}

/**
 * Future: Backend email service integration
 * This function can be implemented when you add a backend API
 */
export async function sendInvoiceViaAPI(params: EmailInvoiceParams & { pdfBase64: string }): Promise<void> {
  // TODO: Implement with your backend API
  // Example:
  // const response = await fetch('/api/send-invoice', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(params),
  // });
  // 
  // if (!response.ok) {
  //   throw new Error('Failed to send email');
  // }
  
  console.log('Backend email service not implemented yet. Using mailto fallback.');
  sendInvoiceEmail(params);
}

/**
 * Future: Backend receipt email service
 */
export async function sendReceiptViaAPI(params: EmailReceiptParams & { pdfBase64: string }): Promise<void> {
  console.log('Backend email service not implemented yet. Using mailto fallback.');
  sendReceiptEmail(params);
}

/**
 * Check if backend email service is available
 */
export function isBackendEmailAvailable(): boolean {
  // TODO: Check if backend email service is configured
  return false;
}

/**
 * Get recommended email method
 */
export function getEmailMethod(): 'mailto' | 'api' {
  return isBackendEmailAvailable() ? 'api' : 'mailto';
}
