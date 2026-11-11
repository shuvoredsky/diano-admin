import type { FieldValues, UseFormSetError, Path } from 'react-hook-form';
import { ApiClientError } from '@/lib/api/api-error';

export interface BackendFieldError {
  field?: string;
  path?: string;
  message: string;
}

/**
 * Maps structured backend validation errors (e.g. from Zod/AppError) directly
 * onto React Hook Form fields via setError.
 * Returns the primary/general error message string for alert banners.
 */
export function mapBackendValidationErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>
): string {
  if (error instanceof ApiClientError) {
    if (Array.isArray(error.errors)) {
      for (const item of error.errors as BackendFieldError[]) {
        const fieldName = item.field || item.path;
        if (fieldName && typeof fieldName === 'string') {
          setError(fieldName as Path<TFieldValues>, {
            type: 'server',
            message: item.message,
          });
        }
      }
    } else if (error.errors && typeof error.errors === 'object') {
      for (const [key, value] of Object.entries(error.errors)) {
        const msg = Array.isArray(value) ? value[0] : String(value);
        if (key && msg) {
          setError(key as Path<TFieldValues>, {
            type: 'server',
            message: String(msg),
          });
        }
      }
    }
    return error.message || 'Validation failed. Please correct the highlighted errors.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

