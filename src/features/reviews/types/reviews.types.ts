export type ReviewStatusType = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ReviewImageDto {
  id: string;
  url: string;
}

export interface ReviewEntity {
  id: string;
  userId: string;
  productId: string;
  orderItemId: string | null;
  rating: number;
  title: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  status: ReviewStatusType;
  moderationReason: string | null;
  moderatedById: string | null;
  moderatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
  };
  images: ReviewImageDto[];
}

export interface AdminReviewsFilter {
  page?: number;
  limit?: number;
  status?: ReviewStatusType;
  rating?: number;
  productId?: string;
  search?: string;
}

export interface UpdateReviewStatusInput {
  status: ReviewStatusType;
  reason?: string;
}
