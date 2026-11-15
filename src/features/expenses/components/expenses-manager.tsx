'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/shared/permission-gate';
import { useTableQueryParams } from '@/lib/crud';
import { PERMISSIONS } from '@/constants/permissions';
import { useExpensesQuery } from '../hooks/use-expenses-queries';
import { ExpensesFilterBar } from './expenses-filter-bar';
import { ExpensesTable } from './expenses-table';
import { ExpenseFormModal } from './expense-form-modal';
import type { ExpenseEntity, ExpenseCategory } from '../types/expenses.types';

export function ExpensesManager() {
  const { searchParams, page, limit, setPage } = useTableQueryParams({
    defaultPage: 1,
    defaultLimit: 20,
  });

  const category = (searchParams.get('category') as ExpenseCategory) || undefined;
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;

  const { data, isLoading } = useExpensesQuery({
    page,
    limit,
    category,
    from,
    to,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<ExpenseEntity | null>(null);

  const expenses: ExpenseEntity[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data as unknown as { items?: ExpenseEntity[] })?.items)
      ? ((data as unknown as { items: ExpenseEntity[] }).items)
      : [];

  const rawMeta = data?.meta as { totalPages?: number; total?: number } | undefined;
  const totalPages: number = typeof rawMeta?.totalPages === 'number' ? rawMeta.totalPages : 1;

  const handleOpenCreate = () => {
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (expense: ExpenseEntity) => {
    setExpenseToEdit(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setExpenseToEdit(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Expenses Management"
          description="Track operational expenses, store utilities, salaries, and marketing overhead."
        />
        <PermissionGate permission={PERMISSIONS.EXPENSE_MANAGE}>
          <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" />
            Record Expense
          </Button>
        </PermissionGate>
      </div>

      <ExpensesFilterBar />

      <ExpensesTable
        expenses={expenses}
        isLoading={isLoading}
        onEditExpense={handleOpenEdit}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        expenseToEdit={expenseToEdit}
      />
    </div>
  );
}

