'use client';

import { ShieldAlert, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/feedback/skeletons';
import type { FraudStats } from '../types/fraud.types';

export interface FraudStatsCardsProps {
  stats?: FraudStats;
  isLoading: boolean;
}

export function FraudStatsCards({ stats, isLoading }: FraudStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* High Risk Count */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-destructive">
          <span className="text-xs font-semibold text-muted-foreground">High Risk Flagged</span>
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div className="text-2xl font-bold text-foreground">{stats.highRiskCount}</div>
        <p className="text-[11px] text-muted-foreground">Requires manual intervention</p>
      </div>

      {/* Pending Reviews */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-warning">
          <span className="text-xs font-semibold text-muted-foreground">Pending Review</span>
          <Clock className="h-4 w-4" />
        </div>
        <div className="text-2xl font-bold text-foreground">{stats.pendingReviewCount}</div>
        <p className="text-[11px] text-muted-foreground">Awaiting staff decision</p>
      </div>

      {/* Medium Risk */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-amber-500">
          <span className="text-xs font-semibold text-muted-foreground">Medium Risk</span>
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="text-2xl font-bold text-foreground">{stats.mediumRiskCount}</div>
        <p className="text-[11px] text-muted-foreground">Automated surveillance</p>
      </div>

      {/* Approved / Resolved */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-emerald-600">
          <span className="text-xs font-semibold text-muted-foreground">Approved Orders</span>
          <CheckCircle className="h-4 w-4" />
        </div>
        <div className="text-2xl font-bold text-foreground">{stats.approvedCount}</div>
        <p className="text-[11px] text-muted-foreground">
          FP Rate: {(stats.falsePositiveRate * 100).toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
