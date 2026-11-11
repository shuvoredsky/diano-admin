import type { FieldValidationError } from '@/types/api.types';

/**
 * Normalized Frontend API Error matching diano-server's error envelope.
 */
export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly errors?: FieldValidationError[] | Record<string, unknown> | unknown;
  public readonly requestId?: string;
  public readonly isCanceled: boolean;

  constructor(params: {
    message: string;
    statusCode: number;
    errors?: FieldValidationError[] | Record<string, unknown> | unknown;
    requestId?: string;
    isCanceled?: boolean;
  }) {
    super(params.message);
    this.name = 'ApiClientError';
    this.statusCode = params.statusCode;
    this.errors = params.errors;
    this.requestId = params.requestId;
    this.isCanceled = Boolean(params.isCanceled);
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

