/**
 * Bangladeshi Taka (BDT ৳) Currency Formatting Utilities.
 * Backend monetary values are returned as 2-decimal strings (e.g. "1500.00").
 */

export const DEFAULT_CURRENCY = 'BDT' as const;
export const CURRENCY_SYMBOL = '৳' as const;

export function formatBdt(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') {
    return `${CURRENCY_SYMBOL}0.00`;
  }

  const numericValue = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(numericValue)) {
    return `${CURRENCY_SYMBOL}0.00`;
  }

  const formattedNumber = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);

  return `${CURRENCY_SYMBOL}${formattedNumber}`;
}

