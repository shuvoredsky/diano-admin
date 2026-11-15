import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchExpenses,
  fetchExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../api/expenses.api';
import type {
  ExpenseFilter,
  CreateExpenseInput,
  UpdateExpenseInput,
} from '../types/expenses.types';

export const EXPENSES_QUERY_KEY = ['expenses'] as const;

export function useExpensesQuery(filter: ExpenseFilter) {
  return useQuery({
    queryKey: [...EXPENSES_QUERY_KEY, 'list', filter],
    queryFn: () => fetchExpenses(filter),
    staleTime: 30_000,
  });
}

export function useExpenseDetailQuery(id?: string) {
  return useQuery({
    queryKey: [...EXPENSES_QUERY_KEY, 'detail', id],
    queryFn: () => fetchExpenseById(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useCreateExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpenseInput) => createExpense(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
    },
  });
}

export function useUpdateExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExpenseInput }) =>
      updateExpense(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
    },
  });
}

export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
    },
  });
}

