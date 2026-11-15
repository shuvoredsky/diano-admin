import type { PageType, PageStatus } from '../types/pages.types';

export const SYSTEM_PAGE_SLUGS = [
  'privacy-policy',
  'terms',
  'return-policy',
  'shipping-policy',
] as const;

export const PAGE_TYPES: { label: string; value: PageType; description: string }[] = [
  {
    label: 'Legal Policy',
    value: 'LEGAL',
    description: 'Mandatory statutory and e-commerce terms (Privacy, Terms, Returns).',
  },
  {
    label: 'Informational',
    value: 'INFORMATIONAL',
    description: 'Brand story, craftsmanship heritage, showroom locators, and FAQs.',
  },
  {
    label: 'Custom Landing Page',
    value: 'CUSTOM',
    description: 'Editorial lookbooks, seasonal launches, and campaign features.',
  },
];

export const PAGE_STATUS_CONFIG: Record<PageStatus, { label: string; color: string }> = {
  DRAFT: {
    label: 'Draft',
    color: 'bg-muted text-muted-foreground border-border',
  },
  PUBLISHED: {
    label: 'Published',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  ARCHIVED: {
    label: 'Archived',
    color: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  },
};
