/**
 * Format number as currency
 */
export const formatCurrency = (
  amount: number,
  currency = 'UGX',
  locale = 'en-UG'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number, decimals = 2): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Calculate tax amount
 */
export const calculateTax = (amount: number, taxRate: number): number => {
  return amount * taxRate;
};

/**
 * Calculate total with tax
 */
export const calculateTotalWithTax = (amount: number, taxRate: number): number => {
  return amount + calculateTax(amount, taxRate);
};

/**
 * Calculate discount amount
 */
export const calculateDiscount = (amount: number, discountRate: number): number => {
  return amount * discountRate;
};

/**
 * Calculate total after discount
 */
export const calculateTotalAfterDiscount = (
  amount: number,
  discountRate: number
): number => {
  return amount - calculateDiscount(amount, discountRate);
};
