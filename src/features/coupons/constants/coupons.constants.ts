import type { CouponType } from '../types/coupons.types';

export const COUPON_TYPES: CouponType[] = ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING'];

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  PERCENTAGE: 'Percentage (%)',
  FIXED: 'Fixed Amount (৳)',
  FREE_SHIPPING: 'Free Shipping',
};
