export type BannerPlacement =
  | 'HOME_HERO'
  | 'HOME_SECONDARY'
  | 'CATEGORY_TOP'
  | 'ANNOUNCEMENT_BAR'
  | 'POPUP';

export interface BannerEntity {
  id: string;
  placement: BannerPlacement;
  title: string;
  subtitle?: string | null;
  desktopImage: string;
  mobileImage?: string | null;
  altText?: string | null;
  linkUrl?: string | null;
  ctaText?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
  sortOrder: number;
  clickCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerInput {
  placement: BannerPlacement;
  title: string;
  subtitle?: string | null;
  desktopImage: string;
  mobileImage?: string | null;
  altText?: string | null;
  linkUrl?: string | null;
  ctaText?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateBannerInput {
  placement?: BannerPlacement;
  title?: string;
  subtitle?: string | null;
  desktopImage?: string;
  mobileImage?: string | null;
  altText?: string | null;
  linkUrl?: string | null;
  ctaText?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface BannerReorderItem {
  id: string;
  sortOrder: number;
}

export interface BannerFilterParams {
  placement?: BannerPlacement;
  isActive?: boolean | string;
  page?: number;
  limit?: number;
}
