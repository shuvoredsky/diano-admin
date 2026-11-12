import type { DiscountType } from '@/features/products/types/products.types';

export interface CalculatedPricing {
  isValid: boolean;
  mrp: string;
  sellingPrice: string;
  discountAmount: string;
  discountType: DiscountType;
  discountValue: string;
  error?: string;
  warning?: string;
}

/**
 * Rounds a number to exactly 2 decimal places using half-up arithmetic.
 */
export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a number to a 2-decimal string e.g. "1250.00"
 */
export function toDecimalString(num: number): string {
  return roundToTwoDecimals(num).toFixed(2);
}

/**
 * Pure client-side pricing calculator matching backend products.pricing.ts logic.
 */
export function calculateClientPricing(
  mrpInput: number | string | null | undefined,
  discountTypeInput: DiscountType = 'NONE',
  discountValueInput: number | string | null | undefined = 0,
  costPriceInput?: number | string | null | undefined
): CalculatedPricing {
  const numMrp = typeof mrpInput === 'string' ? parseFloat(mrpInput) : (mrpInput ?? 0);
  const discountType = discountTypeInput || 'NONE';
  const numDiscountValue =
    typeof discountValueInput === 'string'
      ? parseFloat(discountValueInput)
      : (discountValueInput ?? 0);

  if (isNaN(numMrp) || numMrp <= 0) {
    return {
      isValid: false,
      mrp: '0.00',
      sellingPrice: '0.00',
      discountAmount: '0.00',
      discountType,
      discountValue: '0.00',
      error: 'MRP must be greater than 0',
    };
  }

  const roundedMrp = roundToTwoDecimals(numMrp);

  if (discountType === 'NONE') {
    return {
      isValid: true,
      mrp: toDecimalString(roundedMrp),
      sellingPrice: toDecimalString(roundedMrp),
      discountAmount: '0.00',
      discountType: 'NONE',
      discountValue: '0.00',
    };
  }

  if (isNaN(numDiscountValue) || numDiscountValue <= 0) {
    return {
      isValid: false,
      mrp: toDecimalString(roundedMrp),
      sellingPrice: toDecimalString(roundedMrp),
      discountAmount: '0.00',
      discountType,
      discountValue: '0.00',
      error: 'Discount value must be greater than 0',
    };
  }

  if (discountType === 'PERCENTAGE') {
    if (numDiscountValue >= 100) {
      return {
        isValid: false,
        mrp: toDecimalString(roundedMrp),
        sellingPrice: '0.00',
        discountAmount: '0.00',
        discountType,
        discountValue: toDecimalString(numDiscountValue),
        error: 'Percentage discount must be less than 100%',
      };
    }

    const rawDiscount = (roundedMrp * numDiscountValue) / 100;
    const discountAmount = roundToTwoDecimals(rawDiscount);
    const sellingPrice = roundToTwoDecimals(roundedMrp - discountAmount);

    let warning: string | undefined;
    if (costPriceInput) {
      const numCost = typeof costPriceInput === 'string' ? parseFloat(costPriceInput) : costPriceInput;
      if (!isNaN(numCost) && numCost > 0 && sellingPrice < numCost) {
        warning = `Calculated selling price (৳${toDecimalString(sellingPrice)}) is less than cost price (৳${toDecimalString(numCost)})`;
      }
    }

    return {
      isValid: true,
      mrp: toDecimalString(roundedMrp),
      sellingPrice: toDecimalString(sellingPrice),
      discountAmount: toDecimalString(discountAmount),
      discountType: 'PERCENTAGE',
      discountValue: toDecimalString(numDiscountValue),
      warning,
    };
  }

  if (discountType === 'FIXED') {
    if (numDiscountValue >= roundedMrp) {
      return {
        isValid: false,
        mrp: toDecimalString(roundedMrp),
        sellingPrice: '0.00',
        discountAmount: '0.00',
        discountType,
        discountValue: toDecimalString(numDiscountValue),
        error: `Fixed discount must be less than MRP (৳${toDecimalString(roundedMrp)})`,
      };
    }

    const discountAmount = roundToTwoDecimals(numDiscountValue);
    const sellingPrice = roundToTwoDecimals(roundedMrp - discountAmount);

    let warning: string | undefined;
    if (costPriceInput) {
      const numCost = typeof costPriceInput === 'string' ? parseFloat(costPriceInput) : costPriceInput;
      if (!isNaN(numCost) && numCost > 0 && sellingPrice < numCost) {
        warning = `Calculated selling price (৳${toDecimalString(sellingPrice)}) is less than cost price (৳${toDecimalString(numCost)})`;
      }
    }

    return {
      isValid: true,
      mrp: toDecimalString(roundedMrp),
      sellingPrice: toDecimalString(sellingPrice),
      discountAmount: toDecimalString(discountAmount),
      discountType: 'FIXED',
      discountValue: toDecimalString(discountAmount),
      warning,
    };
  }

  return {
    isValid: false,
    mrp: toDecimalString(roundedMrp),
    sellingPrice: '0.00',
    discountAmount: '0.00',
    discountType,
    discountValue: '0.00',
    error: 'Invalid discount type',
  };
}

