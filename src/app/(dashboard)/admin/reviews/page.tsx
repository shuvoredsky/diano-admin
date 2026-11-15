import type { Metadata } from 'next';
import { ReviewsManager } from '@/features/reviews';

export const metadata: Metadata = {
  title: 'Reviews Moderation | DIANO Admin',
  description: 'Moderate customer product reviews and ratings.',
};

export default function ReviewsPage() {
  return <ReviewsManager />;
}
