/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate invoice number
 */
export const generateInvoiceNumber = (prefix = 'INV', counter: number): string => {
  const paddedCounter = counter.toString().padStart(4, '0');
  return `${prefix}${paddedCounter}`;
};

/**
 * Generate payment ID
 */
export const generatePaymentId = (prefix = 'PAY', counter: number): string => {
  const paddedCounter = counter.toString().padStart(4, '0');
  return `${prefix}${paddedCounter}`;
};

/**
 * Generate expense ID
 */
export const generateExpenseId = (prefix = 'EXP', counter: number): string => {
  const paddedCounter = counter.toString().padStart(4, '0');
  return `${prefix}${paddedCounter}`;
};

/**
 * Generate client ID
 */
export const generateClientId = (prefix = 'CLI', counter: number): string => {
  const paddedCounter = counter.toString().padStart(4, '0');
  return `${prefix}${paddedCounter}`;
};
