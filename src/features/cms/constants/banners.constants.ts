import type { BannerPlacement } from '../types/banners.types';

export const BANNER_PLACEMENTS: { label: string; value: BannerPlacement; description: string }[] = [
  {
    label: 'Home Hero Carousel',
    value: 'HOME_HERO',
    description: 'Full-width primary carousel at the top of the storefront homepage.',
  },
  {
    label: 'Home Secondary Showcase',
    value: 'HOME_SECONDARY',
    description: 'Promotional feature banner between product feeds.',
  },
  {
    label: 'Category Top Header',
    value: 'CATEGORY_TOP',
    description: 'Category and collection landing page top banner.',
  },
  {
    label: 'Announcement Bar',
    value: 'ANNOUNCEMENT_BAR',
    description: 'Top notification strip for nationwide free shipping or seasonal campaigns.',
  },
  {
    label: 'Promotional Popup',
    value: 'POPUP',
    description: 'Modal alert for first-time visitors or flash discount coupons.',
  },
];

export const PLACEMENT_COLOR_MAP: Record<BannerPlacement, string> = {
  HOME_HERO: 'bg-primary/10 text-primary border-primary/20',
  HOME_SECONDARY: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  CATEGORY_TOP: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  ANNOUNCEMENT_BAR: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  POPUP: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};
