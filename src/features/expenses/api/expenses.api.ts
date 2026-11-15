import { api } from '@/lib/api/browser-client';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  ExpenseEntity,
  ExpenseFilter,
  CreateExpenseInput,
  UpdateExpenseInput,
} from '../types/expenses.types';

export async function fetchExpenses(
  filter: ExpenseFilter = {}
): Promise<ApiSuccessResponse<ExpenseEntity[]>> {
  const params: Record<string, string | number> = {
    page: filter.page || 1,
    limit: filter.limit || 20,
  };

  if (filter.category) params.category = filter.category;
  if (filter.from) params.from = filter.from;
  if (filter.to) params.to = filter.to;

  const res = await api.get<ApiSuccessResponse<ExpenseEntity[]>>('/admin/expenses', { params });
  return res.data;
}

export async function fetchExpenseById(id: string): Promise<ExpenseEntity> {
  const res = await api.get<ExpenseEntity>(`/admin/expenses/${id}`);
  return res.data;
}

export async function createExpense(input: CreateExpenseInput): Promise<ExpenseEntity> {
  const res = await api.post<ExpenseEntity>('/admin/expenses', input);
  return res.data;
}

export async function updateExpense(
  id: string,
  input: UpdateExpenseInput
): Promise<ExpenseEntity> {
  const res = await api.patch<ExpenseEntity>(`/admin/expenses/${id}`, input);
  return res.data;
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/admin/expenses/${id}`);
}
