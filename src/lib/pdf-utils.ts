/**
 * PDF utility functions for downloading and handling PDFs
 */

import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download invoice PDF
 */
export async function downloadInvoicePDF(
  InvoicePDF: React.ComponentType<any>,
  props: any,
  filename?: string
): Promise<void> {
  const element = createElement(InvoicePDF, props);
  const blob = await pdf(element).toBlob();
  const invoiceNumber = props.invoice.invoiceNumber;
  const fileName = filename || `Invoice-${invoiceNumber}.pdf`;
  downloadBlob(blob, fileName);
}

/**
 * Generate and download receipt PDF
 */
export async function downloadReceiptPDF(
  ReceiptPDF: React.ComponentType<any>,
  props: any,
  filename?: string
): Promise<void> {
  const element = createElement(ReceiptPDF, props);
  const blob = await pdf(element).toBlob();
  const receiptNumber = props.payment.paymentId;
  const fileName = filename || `Receipt-${receiptNumber}.pdf`;
  downloadBlob(blob, fileName);
}

/**
 * Convert blob to base64 (for email attachments)
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data:application/pdf;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generate invoice PDF as blob
 */
export async function generateInvoicePDFBlob(
  InvoicePDF: React.ComponentType<any>,
  props: any
): Promise<Blob> {
  const element = createElement(InvoicePDF, props);
  return await pdf(element).toBlob();
}

/**
 * Generate receipt PDF as blob
 */
export async function generateReceiptPDFBlob(
  ReceiptPDF: React.ComponentType<any>,
  props: any
): Promise<Blob> {
  const element = createElement(ReceiptPDF, props);
  return await pdf(element).toBlob();
}
