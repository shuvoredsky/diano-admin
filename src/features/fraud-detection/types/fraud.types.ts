export type FraudRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type FraudReviewStatus =
  | 'PENDING'
  | 'AUTO_APPROVED'
  | 'MANUAL_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'OTP_REQUESTED';

export interface TriggeredRuleItem {
  key: string;
  name: string;
  points: number;
  reason: string;
}

export interface StoredFraudRule extends Record<string, unknown> {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  weight: number;
  isEnabled: boolean;
  parameters?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface FraudDecisionHistoryItem {
  id: string;
  assessmentId: string;
  actorId: string;
  previousStatus: FraudReviewStatus;
  newStatus: FraudReviewStatus;
  decision: string;
  reason: string;
  createdAt: string;
}

export interface FraudReviewOrderItem {
  id: string;
  orderNumber: string;
  customerId?: string | null;
  grandTotal: number | string;
  paymentMethod: string;
  paymentStatus?: string;
  status: string;
  placedAt?: string;
  customerSnapshot?: Record<string, unknown> | null;
  shippingAddressSnapshot?: Record<string, unknown> | null;
}

export interface FraudReviewListItem extends Record<string, unknown> {
  id: string;
  orderId: string;
  riskScore: number;
  riskLevel: FraudRiskLevel;
  triggeredRules?: TriggeredRuleItem[] | null;
  factors?: Record<string, unknown> | null;
  explanation?: string | null;
  reviewStatus: FraudReviewStatus;
  createdAt: string;
  updatedAt: string;
  order?: FraudReviewOrderItem | null;
}

export interface FraudReviewDetailEntity extends FraudReviewListItem {
  decisionHistory?: FraudDecisionHistoryItem[];
}

export interface FraudStats {
  totalAssessments: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  pendingReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
  falsePositiveCount: number;
  falsePositiveRate: number;
}

export interface UpdateFraudRuleInput {
  name?: string;
  description?: string;
  weight?: number;
  isEnabled?: boolean;
  parameters?: Record<string, unknown>;
}

export interface ListFraudReviewsFilter {
  page?: number;
  limit?: number;
  status?: FraudReviewStatus;
  riskLevel?: FraudRiskLevel;
  dateFrom?: string;
  dateTo?: string;
}

export interface ApproveFraudReviewInput {
  isFalsePositive?: boolean;
  note?: string;
}

export interface RejectFraudReviewInput {
  reason: string;
}

export interface VerifyFraudOtpInput {
  code: string;
}
