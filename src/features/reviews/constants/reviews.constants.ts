import type { ReviewStatusType } from '../types/reviews.types';

export const REVIEW_STATUS_OPTIONS: { label: string; value: ReviewStatusType }[] = [
  { label: 'Pending Review', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export const RATING_FILTER_OPTIONS = [
  { label: 'All Ratings', value: '' },
  { label: '5 Stars ★★★★★', value: '5' },
  { label: '4 Stars ★★★★☆', value: '4' },
  { label: '3 Stars ★★★☆☆', value: '3' },
  { label: '2 Stars ★★☆☆☆', value: '2' },
  { label: '1 Star ★☆☆☆☆', value: '1' },
];

