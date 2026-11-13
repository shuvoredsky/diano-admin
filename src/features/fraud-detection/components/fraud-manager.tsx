'use client';

import { useState } from 'react';
import { SlidersHorizontal, AlertOctagon } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useTableQueryParams } from '@/lib/crud';
import {
  useFraudReviewsQuery,
  useFraudStatsQuery,
} from '../hooks/use-fraud-queries';
import { FraudStatsCards } from './fraud-stats-cards';
import { FraudReviewsFilterBar } from './fraud-reviews-filter-bar';
import { FraudReviewsTable } from './fraud-reviews-table';
import { FraudReviewDetailModal } from './fraud-review-detail-modal';
import { FraudRulesTable } from './fraud-rules-table';
import type {
  FraudReviewListItem,
  FraudRiskLevel,
  FraudReviewStatus,
} from '../types/fraud.types';

export function FraudManager() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'rules'>('reviews');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useFraudStatsQuery();

  const {
    page,
    limit,
    searchParams,
    setPage,
    setLimit,
  } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const riskLevel = (searchParams.get('riskLevel') as FraudRiskLevel) || undefined;
  const status = (searchParams.get('status') as FraudReviewStatus) || undefined;

  const { data: response, isLoading: reviewsLoading } = useFraudReviewsQuery({
    page,
    limit,
    riskLevel,
    status,
  });

  const items = response?.data || [];
  const total =
    response?.meta?.pagination?.totalItems ??
    response?.pagination?.totalItems ??
    0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Detection & Risk Management"
        description="Monitor automated velocity and heuristic checks, investigate flagged orders, and calibrate detection rules."
      />

      {/* Top Stats Overview */}
      <FraudStatsCards stats={stats} isLoading={statsLoading} />

      {/* Tabs Switcher */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <AlertOctagon className="h-4 w-4" />
          Review Queue
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'rules'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Detection Rules
        </button>
      </div>

      {activeTab === 'reviews' ? (
        <div className="space-y-4">
          <FraudReviewsFilterBar />

          <FraudReviewsTable
            data={items}
            total={total}
            page={page}
            limit={limit}
            isLoading={reviewsLoading}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onViewReview={(review: FraudReviewListItem) => {
              setSelectedReviewId(review.id);
            }}
          />

          <FraudReviewDetailModal
            reviewId={selectedReviewId}
            isOpen={Boolean(selectedReviewId)}
            onClose={() => setSelectedReviewId(null)}
          />
        </div>
      ) : (
        <FraudRulesTable />
      )}
    </div>
  );
}
