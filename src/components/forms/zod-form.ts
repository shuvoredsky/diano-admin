'use client';

import { useForm, type UseFormProps, type UseFormReturn, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

export interface UseZodFormProps<TFieldValues extends FieldValues>
  extends Omit<UseFormProps<TFieldValues>, 'resolver'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<TFieldValues, any, any>;
}

/**
 * Reusable typed React Hook Form + Zod resolver hook.
 */
export function useZodForm<TFieldValues extends FieldValues>({
  schema,
  ...formProps
}: UseZodFormProps<TFieldValues>): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    ...formProps,
    resolver: zodResolver(schema),
  });
}

