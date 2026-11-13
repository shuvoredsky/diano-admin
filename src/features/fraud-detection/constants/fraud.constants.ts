import type { BadgeVariant } from '@/components/shared/status-badge';
import type { FraudRiskLevel, FraudReviewStatus } from '../types/fraud.types';

export const FRAUD_RISK_LABELS: Record<FraudRiskLevel, string> = {
  LOW: 'Low Risk',
  MEDIUM: 'Medium Risk',
  HIGH: 'High Risk',
};

export const FRAUD_RISK_VARIANTS: Record<FraudRiskLevel, BadgeVariant> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'danger',
};

export const FRAUD_REVIEW_STATUS_LABELS: Record<FraudReviewStatus, string> = {
  PENDING: 'Pending Assessment',
  AUTO_APPROVED: 'Auto Approved',
  MANUAL_REVIEW: 'Needs Manual Review',
  APPROVED: 'Approved by Staff',
  REJECTED: 'Rejected & Cancelled',
  OTP_REQUESTED: 'OTP Verification Sent',
};

export const FRAUD_REVIEW_STATUS_VARIANTS: Record<FraudReviewStatus, BadgeVariant> = {
  PENDING: 'neutral',
  AUTO_APPROVED: 'success',
  MANUAL_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  OTP_REQUESTED: 'purple',
};

export const FRAUD_RISK_OPTIONS: Array<{ value: FraudRiskLevel; label: string }> = [
  { value: 'LOW', label: 'Low Risk' },
  { value: 'MEDIUM', label: 'Medium Risk' },
  { value: 'HIGH', label: 'High Risk' },
];

export const FRAUD_STATUS_OPTIONS: Array<{ value: FraudReviewStatus; label: string }> = [
  { value: 'MANUAL_REVIEW', label: 'Needs Manual Review' },
  { value: 'OTP_REQUESTED', label: 'OTP Requested' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'AUTO_APPROVED', label: 'Auto Approved' },
  { value: 'PENDING', label: 'Pending' },
];
