export type CouponType = 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';

export interface CouponEntity {
  id: string;
  code: string;
  type: CouponType;
  value: string;
  minPurchase: string;
  maxDiscount: string | null;
  startsAt: string;
  expiresAt: string;
  usageLimit: number | null;
  perUserLimit: number;
  usedCount: number;
  firstOrderOnly: boolean;
  allowOnSale: boolean;
  scopes?: unknown;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponInput {
  code: string;
  type: CouponType;
  value: string | number;
  minPurchase?: string | number;
  maxDiscount?: string | number | null;
  startsAt: string;
  expiresAt: string;
  usageLimit?: number | null;
  perUserLimit?: number;
  firstOrderOnly?: boolean;
  allowOnSale?: boolean;
  scopes?: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateCouponInput {
  code?: string;
  type?: CouponType;
  value?: string | number;
  minPurchase?: string | number;
  maxDiscount?: string | number | null;
  startsAt?: string;
  expiresAt?: string;
  usageLimit?: number | null;
  perUserLimit?: number;
  firstOrderOnly?: boolean;
  allowOnSale?: boolean;
  scopes?: Record<string, unknown>;
  isActive?: boolean;
}

export interface CouponFilter {
  search?: string;
  isActive?: boolean;
  type?: CouponType;
  page?: number;
  limit?: number;
}
