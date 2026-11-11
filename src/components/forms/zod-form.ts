'use client';

import { useForm, type UseFormProps, type UseFormReturn, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export interface UseZodFormProps<TFieldValues extends FieldValues>
  extends Omit<UseFormProps<TFieldValues>, 'resolver'> {
  schema: Parameters<typeof zodResolver>[0];
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
    resolver: zodResolver(schema as never),
  });
}
