/**
 * Core API Response & Pagination Types aligned with diano-server/src/utils/api-response.ts
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiMeta {
  pagination?: PaginationMeta;
  requestId?: string;
  [key: string]: unknown;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: ApiMeta;
  /**
   * Optional top-level pagination fallback for backward compatibility with docs/API_CONTRACT.md,
   * while runtime diano-server places pagination inside `meta.pagination`.
   */
  pagination?: PaginationMeta;
  timestamp: string;
}

export interface FieldValidationError {
  field?: string;
  path?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: FieldValidationError[] | Record<string, unknown> | unknown;
  requestId?: string;
  timestamp: string;
}

export type ApiEnvelope<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

